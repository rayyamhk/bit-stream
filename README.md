# bit-stream

This library provides a decoder and encoder for you to manipulate bits in **nanoseconds**.

## Features
- Decoder allows you to pop bits from the k-bit encoded string.
- Encoder allows you to push bits to form k-bit encoded string.
- Highly optimized, bits manipulation can be done in **nanoseconds**.
- No dependencies.
- TypeScript supported.
- Tree-shakeable.
- Browser compatability: IE6+.

## Usage

### CommonJS
```javascript
const { Decoder, Encoder } = require('bit-stream');
```

### ES Module
```javascript
import { Decoder, Encoder } from 'bit-stream';
```

### Browser
```javascript
<script src="https://cdn.jsdelivr.net/npm/bit-stream/dist/index.min.js"></script> // From CDN
<script src="/path/to/node_modules/bit-stream/dist/index.min.js"></script> // From node_modules
const decoder = BitStream.Decoder(6, cb);
const encoder = BitStream.Encoder(6, cb);
```

## APIs

### Decoder(k, cb)
Creates a decoder that can decode k-bit encoded strings. You need to provide a callback to map a symbol to a number. You can find some common decoders [here](#examples). The following example uses a base64 decoder.
```javascript
// 010101_000110_100001_100111_011100_110010_111000
decoder.from('VGhncy4');

decoder.pop(8); //Extracts the first 8 bits, returns 84 (01010100).

decoder.pop(32); // Extracts the next 32 bits, returns 1751610158 (01101000 01100111 01110011 00101110).

decoder.pop(2); // Extracts the last 2 bits, returns 0.

decoder.pop(1); // null as no more available bits.

// Resets the bit position and pops the next 6 bits (000110).
decoder.offset(6);
decoder.pop(6); // 6
```

#### decoder.from(input)
Loads an encoded string to the decoder, and replaces the existing one.

*Remark:* Since the input is k-bit encoded, if the number of bits encoded is not a multiple of k, 0s are padded at the end of the stream. It is very likely that the total bits you pushed is less than `input.length * k`. Therefore, you are recommended to push a preserved bits to indicate the end of the stream, otherwise you may pop unnecessary bits.

#### decoder.pop(k = 8)
Extracts the next k bits and converts it to decimal, k should be at most 32.

#### decoder.offset(k = 0)
Resets the bit position by skipping the first k bits.

### Encoder(k, cb)
Creates an encoder that can convert bits to k-bit encoded string. You need to provide a callback to map a number to a symbol. You can find some common encoders [here](#examples). The following example uses a base64 encoder.
```javascript
encoder.push(46, 8); // Appends 00101110.
encoder.push(46, 16); // Appends 00000000_00101110.
encoder.push(1, 3); // Appends 001.
encoder.push(0, 1); // Appends 0.
encoder.push(-1, 8); // Error thrown, only unsigned binary is allowed.
encoder.push(255, 4); // Error thrown, as 255 cannot be represented by 4 bits.

// Encodes the bitstream (001011_100000_000000_101110_0010) to base64 format,
const encoded = encoder.flush(); // LgAuI
```

#### encoder.push(binary, k = 8)
Converts an integer to k-bit unsigned binary, and appends it to the end of the bit stream. k should be at most 32.

#### encoder.flush()
Encodes the bitstream, and resets the encoder.

## Examples
### Base64
```javascript
const symbols = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.split('');
const dictionary = {};
symbols.forEach((symbol, i) => dictionary[symbol] = i);

const decoder = Decoder(6, (symbol) => dictionary[symbol]);
const encoder = Encoder(6, (i) => symbols[i]);
```

### Base16 (Hex)
```javascript
const symbols = '0123456789ABCDEF'.split('');
const dictionary = {};
symbols.forEach((symbol, i) => dictionary[symbol] = i);

const decoder = Decoder(4, (symbol) => dictionary[symbol]);
const encoder = Encoder(4, (i) => symbols[i]);
```

### UTF-16
```javascript
const decoder = Decoder(16, (symbol) => symbol.charCodeAt(0));
const encoder = Encoder(16, (i) => String.fromCharCode(i));
```

## Performance
```
npm run benchmark
```
| Operation      | Benchmark (ops/sec)  | Time (ns/ops)  |
| :------------: | ------------: | ------------: |
| Push 1 bit     | 147,115,982   | 6.80   |
| Pop 1 bit      | 84,702,022    | 11.81  |
| Push 8 bits    | 106,736,041   | 9.37   |
| Pop 8 bits     | 51,118,344    | 19.56  |
| Push 16 bits   | 53,374,346    | 18.74  |
| Pop 16 bits    | 36,004,238    | 27.77  |
| Push 32 bits   | 20,496,482    | 48.79  |
| Pop 32 bits    | 19,224,379    | 52.02  |

*Base64 encoder/decoder, M1 Macbook Air 8GB*

## Build
The following command creates `index.cjs`, `index.mjs` and `index.min.js` in `./dist` directory.
```
npm run build
```

## Test
The following command runs all tests in `./tests` directory.
```
npm run test
```