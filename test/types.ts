import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import type { Fixture } from "ethereum-waffle";

import type { KeyInfrastructure } from "../src/types/KeyInfrastructure";

declare module "mocha" {
  export interface Context {
    keyInfrastructure: KeyInfrastructure;
    loadFixture: <T>(fixture: Fixture<T>) => Promise<T>;
    signers: Signers;
  }
}

export interface Signers {
  admin: SignerWithAddress;
  user0: SignerWithAddress;
  user1: SignerWithAddress;
  user2: SignerWithAddress;
}
