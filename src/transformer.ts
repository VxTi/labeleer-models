import type {
  ParsingOptions,
  SerializationOptions,
  SerializationResult,
  TranslationDataset,
} from '@/definitions';
import { type LanguageFileFormat } from '@/file-formats';
import type { Locale } from '@/locales';

type FileExtension<T extends string = string> = `.${T}`;

export interface LanguageFileTransformer<
  TFormat extends LanguageFileFormat = LanguageFileFormat,
  TFileExtensions extends [FileExtension, ...FileExtension[]] = [
    FileExtension,
    ...FileExtension[],
  ],
  TParseOptions extends object = object,
  TSerializeOptions extends object = object,
> {
  readonly fileFormat: TFormat;
  readonly extensions: TFileExtensions;

  canParse(extension: string): extension is NoInfer<TFileExtensions>[number];

  parse(
    input: string,
    options: ParsingOptions<TParseOptions>
  ): TranslationDataset;

  parseAggregate?(
    inputs: Partial<Record<Locale, string>>,
    options: ParsingOptions<TParseOptions>
  ): TranslationDataset;

  serialize(
    dataset: TranslationDataset,
    options: SerializationOptions<TSerializeOptions>
  ): SerializationResult;
}

export function makeLanguageTransformer<
  TFormat extends LanguageFileFormat = LanguageFileFormat,
  TFileExtensions extends [FileExtension, ...FileExtension[]] = [
    FileExtension,
    ...FileExtension[],
  ],
  TParseOptions extends object = object,
  TSerializeOptions extends object = object,
>(
  options: Omit<
    LanguageFileTransformer<
      TFormat,
      TFileExtensions,
      TParseOptions,
      TSerializeOptions
    >,
    'canParse'
  >
): LanguageFileTransformer<
  TFormat,
  TFileExtensions,
  TParseOptions,
  TSerializeOptions
> {
  return {
    ...options,
    canParse(extension: string): extension is NoInfer<TFileExtensions>[number] {
      const normalized = extension.toLowerCase().trim();

      return this.extensions.some(ext => {
        const candidate = ext.toLowerCase();

        return (
          normalized === candidate ||
          normalized === candidate.replace(/^\./, '') ||
          normalized.endsWith(candidate)
        );
      });
    },
  };
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
  ): SerializationResult {
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
