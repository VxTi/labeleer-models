import type { ParserFn, SerializerFn } from '@labeleer/models';
import poParser from 'gettext-parser';

export const parsePo: ParserFn = input => {
  try {
    const output = poParser.po.parse(input);
  }
};

export const serializePo: SerializerFn = input => {};



