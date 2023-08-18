import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import type { Fixture } from "ethereum-waffle";
import { AccessTokenVerifier, ConsumerMock, DummyDapp, DummyDappUpgradeable, UpgradeableConsumerMock } from "../src/types";

import type { KeyInfrastructure } from "../src/types/KeyInfrastructure";

declare module "mocha" {
  export interface Context {
    keyInfrastructure: KeyInfrastructure;
    verifier: AccessTokenVerifier;
    dapp: DummyDapp | DummyDappUpgradeable;
    mock: ConsumerMock | UpgradeableConsumerMock;
    fakeMock: ConsumerMock | UpgradeableConsumerMock;
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
