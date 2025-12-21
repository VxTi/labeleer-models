import { describe, expect, it } from 'vitest';
import { LocaleDecoder } from './decoders';

describe('decoders', () => {
  describe('locale decoding', () => {
    it.each`
      input       | valid    | output
      ${'en_US'}  | ${true}  | ${'en_US'}
      ${'en'}     | ${true}  | ${'en_US'}
      ${'en-US'}  | ${true}  | ${'en_US'}
      ${'enn'}    | ${false} | ${undefined}
      ${'fr_FR'}  | ${true}  | ${'fr_FR'}
      ${'fr'}     | ${true}  | ${'fr_FR'}
      ${'fr-FR'}  | ${true}  | ${'fr_FR'}
      ${'de_DE'}  | ${true}  | ${'de_DE'}
      ${'de'}     | ${true}  | ${'de_DE'}
      ${'de-DE'}  | ${true}  | ${'de_DE'}
      ${'es_ES'}  | ${true}  | ${'es_ES'}
      ${'es'}     | ${true}  | ${'es_ES'}
      ${'es-ES'}  | ${true}  | ${'es_ES'}
      ${'zz_ZZ'}  | ${false} | ${undefined}
      ${'_en_US'} | ${false} | ${undefined}
    `(
      'should decode locale $input of all formats correctly (expected: $output)',
      ({ input, valid, output }) => {
        const result = LocaleDecoder.safeParse(input);
        expect(result.success).toEqual(valid);
        expect(result.data).toEqual(output);
      }
    );
  });
});
