/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  type MakeOptional,
  type ParsingOptions,
  type SerializationOptions,
  type SerializationResult,
  type TranslationDataset,
} from '@/definitions';
import { type LanguageFileFormat } from '@/file-formats';
import type { Locale } from '@/locales';
import merge from 'lodash-es/merge';

type FileExtension<T extends string = string> = `.${T}`;
type FileExtensions = [FileExtension, ...FileExtension[]];

export interface LanguageFileTransformer<
  TFormat extends LanguageFileFormat,
  TFileExtensions extends FileExtensions,
  TParseOptions extends ParsingOptions,
  TSerializeOptions extends object,
> {
  readonly fileFormat: TFormat;
  readonly extensions: TFileExtensions;

  canParse(extension: string): extension is NoInfer<TFileExtensions>[number];

  parse(input: string, options: TParseOptions): TranslationDataset;

  parseAggregate(
    inputs: Partial<Record<Locale, string>>,
    options: TParseOptions
  ): TranslationDataset;

  serialize(
    dataset: TranslationDataset,
    options: SerializationOptions<TSerializeOptions>
  ): SerializationResult;
}

type SomeLanguageFileTransformer = LanguageFileTransformer<
  LanguageFileFormat,
  FileExtensions,
  any,
  any
>;

export function makeLanguageTransformer<
  TFormat extends LanguageFileFormat = LanguageFileFormat,
  TFileExtensions extends FileExtensions = FileExtensions,
  TParseOptions extends ParsingOptions = ParsingOptions,
  TSerializeOptions extends object = object,
>(
  options: MakeOptional<
    Omit<
      LanguageFileTransformer<
        TFormat,
        TFileExtensions,
        TParseOptions,
        TSerializeOptions
      >,
      'canParse'
    >,
    'parseAggregate'
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
    parseAggregate(
      inputs: Partial<Record<Locale, string>>,
      parsingOptions: NoInfer<TParseOptions> // Inferred from main parsing function
    ): TranslationDataset {
      const dataset: TranslationDataset = {};

      Object.entries(inputs).forEach(([locale, value]) => {
        const parsed = options.parse(value, {
          ...parsingOptions,
          targetLocale: locale as Locale,
        });
        merge(dataset, parsed);
      });

      return dataset;
    },
  };
}

export type InferLanguageFileFormat<T extends SomeLanguageFileTransformer> =
  T extends LanguageFileTransformer<infer Fmt, any, any, any> ? Fmt : never;

export type InferParserWithFormat<
  TTransformer extends SomeLanguageFileTransformer,
  TFmt extends LanguageFileFormat,
> =
  TTransformer extends LanguageFileTransformer<infer TSomeFmt, any, any, any> ?
    TSomeFmt extends TFmt ?
      TTransformer
    : never
  : never;

type InferParsingOptions<T> =
  T extends LanguageFileTransformer<any, any, infer Opt, any> ? Opt : never;

export interface ParserSet<TTransformers extends SomeLanguageFileTransformer> {
  formats(): InferLanguageFileFormat<NoInfer<TTransformers>>[];

  has(
    format: LanguageFileFormat
  ): format is InferLanguageFileFormat<TTransformers>;

  get<TFmt extends InferLanguageFileFormat<TTransformers>>(
    format: TFmt
  ): InferParserWithFormat<TTransformers, TFmt>;

  parse<TFmt extends InferLanguageFileFormat<TTransformers>>(
    input: string,
    format: TFmt,
    options: InferParsingOptions<
      InferParserWithFormat<NoInfer<TTransformers>, NoInfer<TFmt>>
    >
  ): TranslationDataset;

  parseAggregate<TFmt extends InferLanguageFileFormat<TTransformers>>(
    inputs: Partial<Record<Locale, string>>,
    format: TFmt,
    options: InferParsingOptions<InferParserWithFormat<TTransformers, TFmt>>
  ): TranslationDataset;

  serialize(
    dataset: TranslationDataset,
    format: InferLanguageFileFormat<TTransformers>,
    options: SerializationOptions
  ): SerializationResult;
}

export function makeParserSet<
  TTransformers extends SomeLanguageFileTransformer,
>(transformers: TTransformers[]): ParserSet<TTransformers> {
  const get = <TFmt extends InferLanguageFileFormat<TTransformers>>(
    format: TFmt
  ): InferParserWithFormat<TTransformers, TFmt> => {
    // Normally, this would yield 'T | undefined', though
    // since we statically know which types are possible,
    // this *should* always return a value
    return transformers.find(
      tfm => tfm.fileFormat === format
    ) as InferParserWithFormat<TTransformers, TFmt>;
  };

  const has = (
    format: LanguageFileFormat
  ): format is InferLanguageFileFormat<TTransformers> => {
    return transformers.find(tfm => tfm.fileFormat === format) !== undefined;
  };

  const parse = <TFmt extends InferLanguageFileFormat<TTransformers>>(
    input: string,
    format: TFmt,
    options: InferParsingOptions<InferParserWithFormat<TTransformers, TFmt>>
  ): TranslationDataset => get(format).parse(input, options);

  const parseAggregate = <TFmt extends InferLanguageFileFormat<TTransformers>>(
    inputs: Partial<Record<Locale, string>>,
    format: TFmt,
    options: InferParsingOptions<InferParserWithFormat<TTransformers, TFmt>>
  ): TranslationDataset => {
    return get(format).parseAggregate(inputs, options);
  };

  const serialize = <TOpt extends TTransformers>(
    dataset: TranslationDataset,
    format: InferLanguageFileFormat<TOpt>,
    options: SerializationOptions
  ): SerializationResult => {
    return get(format).serialize(dataset, options);
  };

  return {
    get,
    has,
    parse,
    parseAggregate,
    serialize,

    formats(): InferLanguageFileFormat<TTransformers>[] {
      return transformers.map(
        tfm => tfm.fileFormat
      ) as InferLanguageFileFormat<TTransformers>[];
    },
  };
}
