import { assert } from "console";

// Parameters are hexadecimally represented, left-padded with 0 to multiples of 64-characters (32-bytes), and concatenated together
const packParameters = (address: string, amount: number): string => {
  assert(address.length === 42, "address must be 40 characters long in hexadecimal");
  return `0x${address.toLowerCase().substring(2).padStart(64, "0")}${amount.toString(16).padStart(64, "0")}`;
};

export default packParameters;
