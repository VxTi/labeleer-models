import { DatasetBuilder } from '@/dataset-builder';
import type {
  ParsingOptions,
  SerializationOptions,
  SerializationResult,
  TranslationDataset,
} from '@/definitions';
import {
  getFileExtensionsFromFormat,
  type LanguageFileFormat,
} from '@/file-formats';
import type { Locale } from '@/locales';
import { entries } from '@/util/data-extraction';

/**
 * A self-contained transformer for a single {@link LanguageFileFormat},
 * bundling the parsing and serialization logic for that format behind a
 * uniform, object-oriented interface.
 *
 * Concrete implementations wrap the functional `parseXxx`/`serializeXxx`
 * helpers of their format. Register instances in a {@link ParserSet} (via
 * {@link ParserSetBuilder}) to look them up by format or file extension.
 *
 * @typeParam TFormat - The file format this transformer handles.
 * @typeParam TFileExtensions - A list of at least 1 file extension for this format
 * @typeParam TParseOptions - Additional, format-specific parsing options.
 * @typeParam TSerializeOptions - Additional, format-specific serialization options.
 */
export abstract class ILanguageFileTransformer<
  TFormat extends LanguageFileFormat = LanguageFileFormat,
  TFileExtensions extends [string, ...string[]] = [string],
  TParseOptions extends object = object,
  TSerializeOptions extends object = object,
> {
  public readonly fileFormat: TFormat;
  public readonly fileExtensions: TFileExtensions;

  public constructor(fileFormat: TFormat, fileExtensions: TFileExtensions) {
    this.fileFormat = fileFormat;
    this.fileExtensions = fileExtensions;
  }

  /**
   * The file extensions (including the leading dot) associated with this
   * format, e.g. `['.yaml', '.yml']` for YAML.
   */
  public get extensions(): string[] {
    return getFileExtensionsFromFormat(this.fileFormat);
  }

  /**
   * Whether this transformer can handle a file with the given extension.
   *
   * Accepts bare extensions (`'json'`, `'.json'`) as well as full filenames
   * (`'labels.json'`), and is case-insensitive.
   */
  public canParse(extension: string): boolean {
    const normalized = extension.toLowerCase().trim();

    return this.extensions.some(ext => {
      const candidate = ext.toLowerCase();

      return (
        normalized === candidate ||
        normalized === candidate.replace(/^\./, '') ||
        normalized.endsWith(candidate)
      );
    });
  }

  /**
   * Parses a single source file into a {@link TranslationDataset}.
   */
  public abstract parse(
    input: string,
    options: ParsingOptions<TParseOptions>
  ): TranslationDataset;

  /**
   * Parses and merges multiple locale-specific source files into a single
   * {@link TranslationDataset}.
   *
   * The default implementation parses each input independently, treating the
   * map key as the {@link ParsingOptions.referenceLocale} for that input, and
   * merges the results. Formats whose {@link parse} keys off a different locale
   * — e.g. Apple `.strings` and PO files, which use `targetLocale` — override
   * this method.
   */
  public parseAggregate(
    inputs: Partial<Record<Locale, string>>,
    options: ParsingOptions<TParseOptions>
  ): TranslationDataset {
    const builder = new DatasetBuilder();

    for (const [locale, content] of entries(inputs)) {
      builder.merge(
        this.parse(content, { ...options, referenceLocale: locale })
      );
    }

    return builder.build();
  }

  /**
   * Serializes a {@link TranslationDataset} into one or more file fragments.
   *
   * Multiple fragments are produced by formats that split their output per
   * locale, such as Apple `.strings`, Android strings and XLIFF.
   */
  public abstract serialize(
    dataset: TranslationDataset,
    options: SerializationOptions<TSerializeOptions>
  ): SerializationResult[];
}

/**
 * A transformer with its format/option type parameters erased, as stored
 * inside a {@link ParserSet}.
 */
export type AnyLanguageFileTransformer = ILanguageFileTransformer;

/**
 * An immutable registry of {@link ILanguageFileTransformer}s keyed by format,
 * providing lookup by format or file extension and convenience delegates for
 * parsing and serialization.
 *
 * Construct one with {@link ParserSetBuilder}.
 */
export class ParserSet {
  private readonly byFormat: Map<
    LanguageFileFormat,
    AnyLanguageFileTransformer
  >;

  public constructor(transformers: Iterable<AnyLanguageFileTransformer>) {
    this.byFormat = new Map();

    for (const transformer of transformers) {
      this.byFormat.set(transformer.fileFormat, transformer);
    }
  }

  /**
   * All registered transformers.
   */
  public get transformers(): AnyLanguageFileTransformer[] {
    return [...this.byFormat.values()];
  }

  /**
   * All formats covered by this set.
   */
  public get formats(): LanguageFileFormat[] {
    return [...this.byFormat.keys()];
  }

  /**
   * Whether a transformer is registered for the given format.
   */
  public has(format: LanguageFileFormat): boolean {
    return this.byFormat.has(format);
  }

  /**
   * Returns the transformer registered for a format, or `undefined`.
   */
  public get(
    format: LanguageFileFormat
  ): AnyLanguageFileTransformer | undefined {
    return this.byFormat.get(format);
  }

  /**
   * Returns the first transformer that can handle the given extension or
   * filename, or `undefined` when none match.
   */
  public getByExtension(
    extension: string
  ): AnyLanguageFileTransformer | undefined {
    return this.transformers.find(transformer =>
      transformer.canParse(extension)
    );
  }

  /**
   * Parses input using the transformer registered for the given format.
   *
   * @throws {Error} When no transformer is registered for the format.
   */
  public parse(
    input: string,
    format: LanguageFileFormat,
    options: ParsingOptions<object>
  ): TranslationDataset {
    return this.require(format).parse(input, options);
  }

  /**
   * Parses and merges multiple locale-specific inputs using the transformer
   * registered for the given format.
   *
   * @throws {Error} When no transformer is registered for the format.
   */
  public parseAggregate(
    inputs: Partial<Record<Locale, string>>,
    format: LanguageFileFormat,
    options: ParsingOptions<object>
  ): TranslationDataset {
    return this.require(format).parseAggregate(inputs, options);
  }

  /**
   * Serializes a dataset using the transformer registered for the given format.
   *
   * @throws {Error} When no transformer is registered for the format.
   */
  public serialize(
    dataset: TranslationDataset,
    format: LanguageFileFormat,
    options: SerializationOptions
  ): SerializationResult[] {
    return this.require(format).serialize(dataset, options);
  }

  private require(format: LanguageFileFormat): AnyLanguageFileTransformer {
    const transformer = this.byFormat.get(format);

    if (!transformer) {
      throw new Error(`No transformer registered for format "${format}".`);
    }

    return transformer;
  }
}

/**
 * A fluent builder for assembling a {@link ParserSet} from a collection of
 * {@link ILanguageFileTransformer}s.
 *
 * Registering a transformer for a format that already has one replaces the
 * previous registration, so later `add` calls win.
 */
export class ParserSetBuilder {
  private readonly transformers = new Map<
    LanguageFileFormat,
    AnyLanguageFileTransformer
  >();

  /**
   * Registers a single transformer, keyed by its {@link ILanguageFileTransformer.fileFormat}.
   */
  public add(transformer: AnyLanguageFileTransformer): this {
    this.transformers.set(transformer.fileFormat, transformer);
    return this;
  }

  /**
   * Registers multiple transformers in order.
   */
  public addAll(transformers: Iterable<AnyLanguageFileTransformer>): this {
    for (const transformer of transformers) {
      this.add(transformer);
    }

    return this;
  }

  /**
   * Builds an immutable {@link ParserSet} from the registered transformers.
   */
  public build(): ParserSet {
    return new ParserSet(this.transformers.values());
  }
}
