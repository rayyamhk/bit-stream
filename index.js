/**
 * Creates an encoder instance.
 * @param {number} k Number of bits per character.
 * @param {function} cb Encode a character to number.
 * @returns Encoder instance.
 */
export function Encoder(bits, cb) {
  if (typeof bits !== 'number' || bits <= 0) {
    throw new TypeError('The argument bits is required, and must be a positive integer.');
  }

  if (typeof cb !== 'function') {
    throw new TypeError('The argument cb is required.');
  }

  let encoded = '';
  let place = bits;
  let value = 0;

  /**
   * Converts an integer to k-bit unsigned binary, and appends it to the end of the bit stream.
   * 
   * Examples:
   * 1. push(33, 6): appends '100001' to the stream.
   * 2. push(33, 8): appends '00100001' to the stream.
   * 
   * @param {number} binary Unsigned binary in decimal.
   * @param {number} k Number of bits, at most 32.
   */
  function push(binary, k) {
    if (binary < 0) {
      throw new TypeError('Binary must be unsigned.');
    }
    if (k === undefined) {
      k = 8;
    }
    if (binary >= 2 ** k) {
      throw new RangeError('Invalid bit size.');
    }
    while (k > 0) {
      if (k >= place) {
        k -= place;
        encoded += cb(value | (binary >> k & ((1 << place) - 1)));
        place = bits;
        value = 0;
      } else {
        place -= k;
        value |= (binary & ((1 << k) - 1)) << place;
        break;
      }
    }
  };

  /**
   * Encodes the bit stream, and resets the encoder.
   * @returns Encoded string.
   */
  function flush() {
    let result = encoded;
    encoded = '';
    if (place !== bits) {
      result += cb(value);
      place = bits;
      value = 0;
    }
    return result;
  };

  return {
    push,
    flush,
  };
}

/**
 * Creates an decoder instance.
 * @param {number} bits Number of bits per character.
 * @param {function} cb Decode a number to character.
 * @returns Decoder instance.
 */
export function Decoder(bits, cb) {
  if (typeof bits !== 'number' || bits <= 0) {
    throw new TypeError('The argument bits is required, and must be a positive integer.');
  }

  if (typeof cb !== 'function') {
    throw new TypeError('The argument cb is required.');
  }

  let availableBits = 0,
      encoded = '',
      pos = 0,
      residual = bits;

  /**
   * Loads an encoded string to the decoder, and replaces the existing one.
   * @param {string} input Encoded string.
   */
  function from(input) {
    if (typeof input !== 'string') {
      throw new TypeError('Invalid encoded string.');
    }
    for (let i = 0; i < input.length; i++) {
      if (typeof cb(input.charAt(i)) !== 'number') {
        throw new TypeError('Encounter invalid symbol.');
      }
    }
    availableBits = input.length * bits;
    encoded = input;
    pos = 0;
    residual = bits;
  }

  /**
   * Pops the next k bits and converts it to decimal.
   * @param {number} k The number of bits, at most 32.
   * @returns The next k bits in decimal, or null if no more available bits.
   */
  function pop(k) {
    if (availableBits <= 0) {
      return null;
    }
    if (k === undefined) {
      k = 8;
    }
    let binary = 0, value = cb(encoded.charAt(pos));
    k = Math.min(k, availableBits);
    availableBits -= k;
    while (k > 0) {
      if (k >= residual) {
        k -= residual;
        binary |= (value & ((1 << residual) - 1)) << k;

        if (pos < encoded.length - 1) {
          residual = bits;
          pos += 1;
          value = cb(encoded.charAt(pos));
        }
      } else {
        binary |= (value & ((1 << residual) - 1)) >> (residual - k);
        residual -= k;
        break;
      }
    }
    return binary;
  }

  /**
   * Resets the bit position by skipping the first k bits.
   * @param {number} k The number of bits to be skipped.
   */
  function offset(k) {
    if (k === undefined) {
      k = 0;
    }
    if (typeof k !== 'number' || k < 0) {
      throw new TypeError('The offset must be a non-negative integer.');
    }
    pos = Math.floor(k / bits);
    residual = bits - k % bits;
    availableBits = residual + (encoded.length - 1 - pos) * bits;
  };

  return {
    from,
    pop,
    offset,
  };
}
