import { Decoder, Encoder } from '../index';

describe('Base64', () => {
  const symbols = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.split('');
  const dictionary = {};
  symbols.forEach((symbol, i) => dictionary[symbol] = i);
  const decoder = Decoder(6, (symbol) => dictionary[symbol]);
  const encoder = Encoder(6, (i) => symbols[i]);

  describe('Decoder', () => {
    /**
     * V      G      h      n      c      y      4
     * 010101 000110 100001 100111 011100 110010 111000
     */
    const input = 'VGhncy4';
    test('sequential pop: 1-bit', () => {
      decoder.from(input);
      expect(decoder.pop(1)).toBe(0);
      expect(decoder.pop(1)).toBe(1);
      expect(decoder.pop(1)).toBe(0);
      expect(decoder.pop(1)).toBe(1);
      expect(decoder.pop(1)).toBe(0);
      expect(decoder.pop(1)).toBe(1);
      decoder.offset(24);
      expect(decoder.pop(1)).toBe(0);
      expect(decoder.pop(1)).toBe(1);
      expect(decoder.pop(1)).toBe(1);
      expect(decoder.pop(1)).toBe(1);
      expect(decoder.pop(1)).toBe(0);
    });

    test('sequential pop: 3-bit', () => {
      decoder.from(input);
      decoder.offset(12);
      expect(decoder.pop(3)).toBe(4);
      expect(decoder.pop(3)).toBe(1);
      expect(decoder.pop(3)).toBe(4);
      expect(decoder.pop(3)).toBe(7);
      expect(decoder.pop(3)).toBe(3);
      expect(decoder.pop(3)).toBe(4);
      decoder.offset(24);
      expect(decoder.pop(3)).toBe(3);
      expect(decoder.pop(3)).toBe(4);
      expect(decoder.pop(3)).toBe(6);
      expect(decoder.pop(3)).toBe(2);
      expect(decoder.pop(3)).toBe(7);
    });

    test('sequential pop: 8-bit', () => {
      decoder.from(input);
      expect(decoder.pop(8)).toBe(84);
      expect(decoder.pop(8)).toBe(104);
      expect(decoder.pop(8)).toBe(103);
    });

    test('sequential pop: 32-bit', () => {
      decoder.from('VGhlIHF1aWNrIGJyb3duIGZveCBqdW1wcyBvdmVyIDEzIGxhenkgZG9ncy4');
      expect(decoder.pop(32)).toBe(1416127776);
      expect(decoder.pop(32)).toBe(1903520099);
      expect(decoder.pop(32)).toBe(1797284466);
      expect(decoder.pop(32)).toBe(1870097952);
      expect(decoder.pop(32)).toBe(1718581280);
      expect(decoder.pop(32)).toBe(1786080624);
      expect(decoder.pop(32)).toBe(1931505526);
      expect(decoder.pop(32)).toBe(1701978161);
      expect(decoder.pop(32)).toBe(857762913);
      expect(decoder.pop(32)).toBe(2054758500);
      expect(decoder.pop(32)).toBe(1869050670);
    });

    test('sequential pop: mixed bits', () => {
      decoder.from(input);
      expect(decoder.pop(1)).toBe(0);
      expect(decoder.pop(1)).toBe(1);
      expect(decoder.pop(2)).toBe(1);
      expect(decoder.pop(3)).toBe(2);
      expect(decoder.pop(4)).toBe(3);
      expect(decoder.pop(5)).toBe(8);
      expect(decoder.pop(6)).toBe(25);
      expect(decoder.pop(7)).toBe(110);
      expect(decoder.pop(8)).toBe(101);
      expect(decoder.pop(9)).toBe(24);
      expect(decoder.pop(10)).toBe(null);
    });

    test('sequential pop: mixed bits 2', () => {
      decoder.from(input);
      expect(decoder.pop(8)).toBe(84);
      expect(decoder.pop(32)).toBe(1751610158);
      expect(decoder.pop(1)).toBe(0);
      expect(decoder.pop(1)).toBe(0);
      expect(decoder.pop(1)).toBe(null);
      decoder.offset(6);
      expect(decoder.pop(6)).toBe(6);
    });

    test('pop maximum bits', () => {
      decoder.from(input);
      expect(decoder.pop(32)).toBe(1416128371);
    });

    test('pop without loading data', () => {
      const newDecoder = Decoder(6, (c) => dict[c]);
      expect(newDecoder.pop(1)).toBe(null);
    });

    test('offset pop', () => {
      decoder.from(input);
      decoder.offset(6);
      expect(decoder.pop(6)).toBe(6);
      decoder.offset(30);
      expect(decoder.pop(6)).toBe(50);
    });

    test('pop overflow', () => {
      decoder.from(input);
      decoder.offset(15);
      expect(decoder.pop(100000)).toBe(27118776);
    });

    test('offset overflow', () => {
      decoder.from(input);
      decoder.offset(10000000);
      expect(decoder.pop(1)).toBe(null);
    });
  });

  describe('Encoder', () => {

    /**
     * 84       104      103      115      46
     * 01010100 01101000 01100111 01110011 00101110
     */
    test('sequential push: 8-bit', () => {
      encoder.push(84, 8);
      expect(encoder.flush()).toBe('VA');

      encoder.push(84, 8);
      encoder.push(104, 8);
      expect(encoder.flush()).toBe('VGg');

      encoder.push(84, 8);
      encoder.push(104, 8);
      encoder.push(103, 8);
      expect(encoder.flush()).toBe('VGhn');

      encoder.push(84, 8);
      encoder.push(104, 8);
      encoder.push(103, 8);
      encoder.push(115, 8);
      expect(encoder.flush()).toBe('VGhncw');

      encoder.push(84, 8);
      encoder.push(104, 8);
      encoder.push(103, 8);
      encoder.push(115, 8);
      encoder.push(46, 8);
      expect(encoder.flush()).toBe('VGhncy4');
    });

    test('sequential push: 3-bit', () => {
      encoder.push(7, 3); // 111(000) -> 56 -> 4
      expect(encoder.flush()).toBe('4');

      encoder.push(7, 3);
      encoder.push(5, 3); // 111101 -> 61 -> 9
      expect(encoder.flush()).toBe('9');

      encoder.push(7, 3);
      encoder.push(5, 3);
      encoder.push(3, 3); // 111101 011(000) -> 61 24 -> 9Y
      expect(encoder.flush()).toBe('9Y');

      encoder.push(7, 3);
      encoder.push(5, 3);
      encoder.push(3, 3);
      encoder.push(1, 3); // 111101 011001 -> 61 25 -> 9Z
      expect(encoder.flush()).toBe('9Z');
    });

    test('sequential push: 1-bit', () => {
      encoder.push(0, 1); // 0(00000) -> 0 -> A
      expect(encoder.flush()).toBe('A');

      encoder.push(1, 1);
      encoder.push(1, 1);
      encoder.push(0, 1); // 110(000) -> 48 -> w
      expect(encoder.flush()).toBe('w');

      encoder.push(1, 1);
      encoder.push(1, 1);
      encoder.push(0, 1);
      encoder.push(1, 1);
      encoder.push(0, 1);
      encoder.push(1, 1); // 110101 -> 53 -> 1
      expect(encoder.flush()).toBe('1');

      encoder.push(1, 1);
      encoder.push(1, 1);
      encoder.push(0, 1);
      encoder.push(1, 1);
      encoder.push(0, 1);
      encoder.push(1, 1);
      encoder.push(1, 1); // 110101 1(00000) -> 53 32 -> 1g
      expect(encoder.flush()).toBe('1g');
    });

    test('sequential push: 32-bit', () => {
      encoder.push(1416127776, 32);
      encoder.push(1903520099, 32);
      encoder.push(1797284466, 32);
      encoder.push(1870097952, 32);
      encoder.push(1718581280, 32);
      encoder.push(1786080624, 32);
      encoder.push(1931505526, 32);
      encoder.push(1701978161, 32);
      encoder.push(857762913, 32);
      encoder.push(2054758500, 32);
      encoder.push(1869050670, 32);
      expect(encoder.flush()).toBe('VGhlIHF1aWNrIGJyb3duIGZveCBqdW1wcyBvdmVyIDEzIGxhenkgZG9ncy4');
    });

    test('sequential push: mixed bits', () => {
      encoder.push(406201, 19); // 1100011001010111001
      encoder.push(387698, 22); // 0001011110101001110010
      encoder.push(0, 1); // 0
      encoder.push(7, 8); // 00000111
      encoder.push(123, 8); // 01111011
      encoder.push(65535, 16); // 1111111111111111
      // 110001 100101 011100 100010 111101 010011 100100 000001 110111 101111 111111 111111 11(0000)
      // 49     37     28     34     61     19     36     1      55     47     63     63     48
      // x      l      c      i      9      T      k      B      3      v      /      /      w
      expect(encoder.flush()).toBe('xlci9TkB3v//w');
    });

    test('sequential push: mixed bits 2', () => {
      encoder.push(46, 8);
      encoder.push(46, 16);
      encoder.push(1, 3);
      encoder.push(0, 1);
      expect(encoder.flush()).toBe('LgAuI');
    });
  });

  describe('push then pop', () => {
    test('push then pop 1', () => {
      encoder.push(0, 2);
      encoder.push(97, 8);
      encoder.push(1, 2);
      encoder.push(1234, 16);
      encoder.push(2, 2);
      encoder.push(14, 16);
      decoder.from(encoder.flush());
      expect(decoder.pop(2)).toBe(0);
      expect(decoder.pop(8)).toBe(97);
      expect(decoder.pop(2)).toBe(1);
      expect(decoder.pop(16)).toBe(1234);
      expect(decoder.pop(2)).toBe(2);
      expect(decoder.pop(16)).toBe(14);
    });

    test('push then pop 2', () => {
      encoder.push(0, 1);
      decoder.from(encoder.flush());
      expect(decoder.pop(1)).toBe(0);
    })
  });
});

describe('Hex', () => {
  const symbols = '0123456789ABCDEF'.split('');
  const dictionary = {};
  symbols.forEach((symbol, i) => dictionary[symbol] = i);
  const decoder = Decoder(4, (s) => dictionary[s]);
  const encoder = Encoder(4, (i) => symbols[i]);

  test('Pop', () => {
    // 3    4    F    5    1    4    E    2    A    4    9
    // 0011 0100 1111 0101 0001 0100 1110 0010 1010 0100 1001
    decoder.from('34F514E2A49');
    expect(decoder.pop(1)).toBe(0);
    expect(decoder.pop(2)).toBe(1);
    expect(decoder.pop(3)).toBe(5);
    expect(decoder.pop(4)).toBe(3);
    expect(decoder.pop(5)).toBe(26);
    expect(decoder.pop(6)).toBe(34);
    expect(decoder.pop(7)).toBe(78);
    expect(decoder.pop(8)).toBe(42);
    expect(decoder.pop(9)).toBe(73);
    expect(decoder.pop(10)).toBe(null);
    decoder.offset(17);
    expect(decoder.pop(11)).toBe(334);
  });

  test('Push', () => {
    encoder.push(0, 1);
    encoder.push(1, 2);
    encoder.push(5, 3);
    encoder.push(3, 4);
    encoder.push(26, 5);
    encoder.push(34, 6);
    encoder.push(78, 7);
    encoder.push(42, 8);
    encoder.push(73, 8);
    expect(encoder.flush()).toBe('34F514E2A49');
  });
});

describe('Invalid input', () => {
  test('Invalid Encoder input', () => {
    expect(() => Encoder()).toThrow('The argument bits is required, and must be a positive integer.');
    expect(() => Encoder('abc')).toThrow('The argument bits is required, and must be a positive integer.');
    expect(() => Encoder(-1)).toThrow('The argument bits is required, and must be a positive integer.');
    expect(() => Encoder(6)).toThrow('The argument cb is required.');
    expect(() => Encoder(6, 'abc')).toThrow('The argument cb is required.');
  });

  test('Invalid Decoder input', () => {
    expect(() => Decoder()).toThrow('The argument bits is required, and must be a positive integer.');
    expect(() => Decoder('abc')).toThrow('The argument bits is required, and must be a positive integer.');
    expect(() => Decoder(-1)).toThrow('The argument bits is required, and must be a positive integer.');
    expect(() => Decoder(6)).toThrow('The argument cb is required.');
    expect(() => Decoder(6, 'abc')).toThrow('The argument cb is required.');
  });

  test('Invalid Encoder push', () => {
    const encoder = Encoder(6, () => {});
    expect(() => encoder.push(-1, 8)).toThrow('Binary must be unsigned.');
    expect(() => encoder.push(255, 4)).toThrow('Invalid bit size.');
  });

  test('Invalid Decoder input', () => {
    const decoder = Decoder(6, () => {});
    expect(() => decoder.from(123)).toThrow('Invalid encoded string.');
    expect(() => decoder.from('@@@@')).toThrow('Encounter invalid symbol.');
  });
});