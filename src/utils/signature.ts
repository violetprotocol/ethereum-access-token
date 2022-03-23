interface Signature {
  v: number;
  r: string;
  s: string;
}

const splitSignature = (signature: string): Signature => {
  return {
    v: parseInt(signature.substring(130, 132)),
    r: signature.substring(2, 66),
    s: signature.substring(66, 130),
  };
};

export { Signature, splitSignature };
