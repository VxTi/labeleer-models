# Labeleer Translation Dataset Transformers

---

This package provides a set of tools to parse and serialize translation datasets between various file formats. It is
designed to be flexible and easy to use, supporting a wide range of localization file types.

## Getting Started

Start using the Labeleer Translation Dataset Transformers package by installing it via pnpm:

```shell
pnpm install @labeleer/translation-dataset-transformers
```

## Usage

This package exposes two main functions: `parseDataset` and `serializeDataset`.

### Parsing a dataset

You can parse a string containing a translation dataset into a standardized `TranslationDataset` object.

```typescript
import { parseDataset, SupportedFormat } from '@labeleer/translation-dataset-transformers';

const jsonString = `{
  "hello_world": {
    "translations": {
      "en_US": "Hello World!",
      "nl_NL": "Hallo Wereld!"
    }
  }
}`;


const dataset = await parseDataset(
    jsonString,
    SupportedFormat.JSON,
    { referenceLocale: 'en_US' }
  );

// Expected output:
// {
//   hello_world: {
//     translations: {
//       en_US: 'Hello World!',
//       nl_NL: 'Hallo Wereld!'
//     }
//   }
// }

```

### Serializing a dataset

You can serialize a `TranslationDataset` object into a string for a specified file format.

```typescript
import { serializeDataset, SupportedFormat, TranslationDataset } from '@labeleer/translation-dataset-transformers';

const dataset: TranslationDataset = {
  "hello_world": {
    "translations": {
      "en_US": "Hello World!",
      "nl_NL": "Hallo Wereld!"
    }
  }
};

const jsonString = await serializeDataset(
  dataset,
  SupportedFormat.JSON,
  { referenceLocale: 'en', locales: [ 'en_US', 'nl_NL' ] }
);

console.log(jsonString);
// Expected output:
// "{
//   "hello_world": {
//     "en_US": "Hello World!",
//     "nl_NL": "Hallo Wereld!"
//   }
// }"
```

## Supported Formats

The following file formats are supported for both parsing and serialization:

| Format Name     | Enum Value                        | File Extensions  |
|-----------------|-----------------------------------|------------------|
| JSON            | `SupportedFormat.JSON`            | `.json`          |
| YAML            | `SupportedFormat.YAML`            | `.yaml`, `.yml`  |
| Qt Linquist     | `SupportedFormat.TS`              | `.ts`            |
| PO (Gettext)    | `SupportedFormat.PO`              | `.po`, `.pot`    |
| Android Strings | `SupportedFormat.ANDROID_STRINGS` | `.xml`           |
| Apple Strings   | `SupportedFormat.APPLE_STRINGS`   | `.strings`       |
| XLIFF           | `SupportedFormat.XLIFF`           | `.xliff`, `.xlf` |
| Apple XCStrings | `SupportedFormat.XCSTRINGS`       | `.xcstrings`     |

## API

### `parseDataset(dataset: string, fileFormat: SupportedFormat, options: ParsingOptions): Promise<TranslationDataset>`

- `dataset`: The string content of the file to parse.
- `fileFormat`: The format of the dataset, from `SupportedFormat`.
- `options`: An object with parsing options, including `referenceLocale` and an optional `targetLocale`.

###
`serializeDataset(dataset: TranslationDataset, format: SupportedFormat, options: SerializationOptions): Promise<string>`

- `dataset`: The `TranslationDataset` object to serialize.
- `format`: The target format for serialization, from `SupportedFormat`.
- `options`: An object with serialization options, including `referenceLocale` and a list of `locales` to include.

### `TranslationDataset`

A standardized object representing the translation data, structured as follows:

```typescript
type TranslationDataset = {
  [key: string]: {
    translations?: { [locale: string]: string };
    tags?: string[];
    description?: string;
    plurals?: {
      [quantity: string]: { [locale: string]: string };
    };
  };
};
```

