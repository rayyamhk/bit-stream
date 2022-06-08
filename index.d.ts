type decoderCallback = (symbol: string) => number;
type encoderCallback = (decimal: number) => string;

export declare const Decoder: (bits: number, cb: decoderCallback) => {
  from: (input: string) => void,
  pop: (k?: number) => number,
  offset: (k?: number) => void,
}

export declare const Encoder: (bits: number, cb: encoderCallback) => {
  push: (binary: number, k?: number) => void,
  flush: () => string,
};
