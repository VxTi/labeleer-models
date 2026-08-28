/**
 * Verifies that every `index.ts` barrel file re-exports all of its siblings.
 *
 * A module that is never re-exported by its parent barrel is invisible to
 * consumers of the published package, even though it compiles fine. This
 * script is therefore run before `build` so a missing export fails the build
 * instead of shipping an incomplete public API.
 *
 * Usage: `tsx bin/check-exports.ts [--fix]`, where `--fix` appends the missing
 * `export * from` statements to the barrels instead of failing.
 */
import chalk                                from 'chalk';
import { existsSync, readdirSync }          from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath }                    from 'node:url';
import ts                                   from 'typescript';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/** Directory that is walked, relative to the project root. */
const sourceRoot = 'src';

/** Whether missing exports are written to the barrels instead of reported. */
const shouldFix = process.argv.slice(2).includes('--fix');

/**
 * Glob patterns of files and directories that are not expected to be exported.
 * Patterns are matched against project-root relative, posix-style paths.
 * Supported wildcards: `**`, `*` and `?`.
 */
const excluded: string[] = [
  '**/*.test.ts',
  '**/*.spec.ts',
  '**/*.d.ts',
  '**/__testutils__/**',
  '**/__snapshots__/**',
  '**/__mocks__/**',
  '**/mock*.ts',
];

/** File extensions that are considered exportable modules. */
const moduleExtensions = ['.ts', '.tsx'];

interface Reexport {
  /** Absolute path of the file the specifier resolves to. */
  resolvedFileName: string;
  /** Whether this is a `export * from` / `export * as ns from` statement. */
  isWildcard: boolean;
}

interface Problem {
  /** Project-root relative path of the barrel file. */
  barrel: string;
  /** Specifier that should be added, e.g. `'./utils'`. */
  specifier: string;
  /** Project-root relative path of the module that is not exported. */
  target: string;
}

/** The project's compiler options, so module resolution honours `paths`. */
const compilerOptions = ((): ts.CompilerOptions => {
  const tsconfigPath = join(projectRoot, 'tsconfig.json');
  const { config } = ts.readConfigFile(tsconfigPath, ts.sys.readFile);

  return ts.parseJsonConfigFileContent(config, ts.sys, projectRoot).options;
})();

const moduleResolutionCache = ts.createModuleResolutionCache(
  projectRoot,
  fileName => fileName,
  compilerOptions
);

/** Converts a glob pattern into an anchored regular expression. */
function globToRegExp(pattern: string): RegExp {
  let source = '';

  for (let index = 0; index < pattern.length; index++) {
    const char = pattern[index];

    if (char === '*') {
      if (pattern[index + 1] === '*') {
        // `**/` may span zero or more directories, a bare `**` any characters.
        if (pattern[index + 2] === '/') {
          source += '(?:.*/)?';
          index += 2;
        } else {
          source += '.*';
          index += 1;
        }
        continue;
      }
      source += '[^/]*';
      continue;
    }

    source += char === '?' ? '[^/]' : char.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  }

  return new RegExp(`^${source}$`);
}

const excludedMatchers = excluded.map(globToRegExp);

/** Project-root relative, posix-style path of an absolute path. */
function toRelativePath(absolutePath: string): string {
  return relative(projectRoot, absolutePath).split(/[\\/]/).join('/');
}

function isExcluded(absolutePath: string, isDirectory: boolean): boolean {
  const path = toRelativePath(absolutePath);
  const candidates = isDirectory ? [path, `${path}/`] : [path];

  return excludedMatchers.some(matcher =>
    candidates.some(candidate => matcher.test(candidate))
  );
}

function isModuleFile(name: string): boolean {
  return moduleExtensions.some(extension => name.endsWith(extension));
}

function barrelPathOf(directory: string): string | undefined {
  return moduleExtensions
    .map(extension => join(directory, `index${extension}`))
    .find(path => existsSync(path));
}

/**
 * Collects every `export ... from '<specifier>'` in a barrel, resolved to the
 * file it points at. Parsing with the compiler rather than by hand means
 * comments, multi-line clauses and `paths` aliases are all handled correctly.
 */
function collectReexports(barrelPath: string): Reexport[] {
  const source = ts.createSourceFile(
    barrelPath,
    ts.sys.readFile(barrelPath) ?? '',
    ts.ScriptTarget.Latest,
    /* setParentNodes */ false,
    ts.ScriptKind.TS
  );

  return source.statements.flatMap(statement => {
    if (
      !ts.isExportDeclaration(statement) ||
      statement.moduleSpecifier === undefined ||
      !ts.isStringLiteral(statement.moduleSpecifier)
    )
      return [];

    const { resolvedModule } = ts.resolveModuleName(
      statement.moduleSpecifier.text,
      barrelPath,
      compilerOptions,
      ts.sys,
      moduleResolutionCache
    );

    if (!resolvedModule) return [];

    return [
      {
        resolvedFileName: resolve(resolvedModule.resolvedFileName),
        // `export * from` and `export * as ns from` re-export everything;
        // an `export { a, b } from` clause only covers what it names.
        isWildcard:
          statement.exportClause === undefined ||
          ts.isNamespaceExport(statement.exportClause),
      },
    ];
  });
}

const success = (message: string) => console.log(chalk.green(message));
const error = (message: string): void => console.log(chalk.red(message));
const warn = (message: string): void => console.log(chalk.yellow(message));

const problems: Problem[] = [];
const partialExports: Problem[] = [];
const unbarrelledDirectories: string[] = [];

/** Checks a single directory and recurses into its subdirectories. */
function checkDirectory(directory: string): void {
  const entries = readdirSync(directory, { withFileTypes: true });

  const files = entries
    .filter(entry => entry.isFile() && isModuleFile(entry.name))
    .map(entry => join(directory, entry.name))
    .filter(path => !isExcluded(path, false));

  const directories = entries
    .filter(entry => entry.isDirectory())
    .map(entry => join(directory, entry.name))
    .filter(path => !isExcluded(path, true));

  const barrelPath = barrelPathOf(directory);

  if (barrelPath) {
    const reexports = collectReexports(barrelPath);

    // Every sibling module, plus every subdirectory that has a barrel of its
    // own, is expected to be reachable from this barrel.
    const expected = [
      ...files.filter(path => path !== barrelPath),
      ...directories.flatMap(path => barrelPathOf(path) ?? []),
    ];

    for (const target of expected) {
      const matches = reexports.filter(
        reexport => reexport.resolvedFileName === target
      );
      if (matches.some(reexport => reexport.isWildcard)) continue;

      const targetDirectory = dirname(target);
      const problem: Problem = {
        barrel: toRelativePath(barrelPath),
        specifier:
          targetDirectory === directory ?
            `./${basenameWithoutExtension(target)}`
          : `./${basenameWithoutExtension(targetDirectory)}`,
        target: toRelativePath(target),
      };

      // A named re-export covers the module, but silently drops any member
      // added to it later, so it is reported separately as a warning.
      (matches.length > 0 ? partialExports : problems).push(problem);
    }
  } else if (directory !== join(projectRoot, sourceRoot) && files.length > 0) {
    unbarrelledDirectories.push(toRelativePath(directory));
  }

  directories.forEach(checkDirectory);
}

function basenameWithoutExtension(path: string): string {
  return (path.split(/[\\/]/).at(-1) ?? '').replace(/\.(ts|tsx)$/, '');
}

/**
 * Appends the missing `export * from` statements to a barrel, directly after
 * the last re-export it already has so the existing ordering is preserved.
 */
function addExports(barrel: string, specifiers: string[]): void {
  const barrelPath = resolve(projectRoot, barrel);
  const original = ts.sys.readFile(barrelPath) ?? '';
  const statements = `${specifiers
    .map(specifier => `export * from '${specifier}';`)
    .join('\n')}\n`;

  const source = ts.createSourceFile(
    barrelPath,
    original,
    ts.ScriptTarget.Latest,
    /* setParentNodes */ false,
    ts.ScriptKind.TS
  );

  const lastReexport = source.statements
    .filter(ts.isExportDeclaration)
    .filter(statement => statement.moduleSpecifier !== undefined)
    .at(-1);

  if (!lastReexport) {
    const body = original.replace(/\s*$/, '');
    ts.sys.writeFile(barrelPath, body ? `${body}\n${statements}` : statements);
    return;
  }

  ts.sys.writeFile(
    barrelPath,
    `${original.slice(0, lastReexport.end)}\n${statements}${original
      .slice(lastReexport.end)
      .replace(/^\n/, '')}`
  );
}

function groupByBarrel(items: Problem[]): Map<string, Problem[]> {
  return items.reduce<Map<string, Problem[]>>((grouped, item) => {
    grouped.set(item.barrel, [...(grouped.get(item.barrel) ?? []), item]);
    return grouped;
  }, new Map());
}

checkDirectory(join(projectRoot, sourceRoot));

for (const [barrel, items] of groupByBarrel(partialExports)) {
  warn(`⚠ ${barrel} only re-exports named members of:`);
  for (const { target, specifier } of items)
    warn(`    ${target} — consider \`export * from '${specifier}';\``);
}

for (const directory of unbarrelledDirectories)
  warn(`⚠ ${directory} has no index.ts, so it is not part of the API`);

if (problems.length === 0) {
  success('✔ All index.ts files export their siblings');
  process.exit(0);
}

if (shouldFix) {
  for (const [barrel, items] of groupByBarrel(problems)) {
    // Duplicate specifiers cannot occur: a barrel is only ever missing one
    // statement per sibling, and siblings have unique names.
    addExports(
      barrel,
      items.map(({ specifier }) => specifier)
    );

    success(`✔ ${barrel} — added ${items.length} export(s):`);
    for (const { specifier } of items)
      success(`    export * from '${specifier}';`);
  }

  success(`\n${problems.length} missing export(s) added.`);
  process.exit(0);
}

for (const [barrel, items] of groupByBarrel(problems)) {
  error(`\n✖ ${barrel} is missing ${items.length} export(s):`);
  for (const { target, specifier } of items)
    error(
      `    ${chalk.underline(target)} — add \`export * from '${specifier}';\``
    );
}

error(
  `\n${problems.length} missing export(s). Run with --fix to add them, or add the files to the exclusion list in bin/check-exports.ts.`
);
process.exit(1);
