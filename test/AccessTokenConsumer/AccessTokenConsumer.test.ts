import { artifacts, ethers, waffle } from "hardhat";
import type { Artifact } from "hardhat/types";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import chai from "chai";

import { DummyDapp } from "../../src/types/DummyDapp";
import { shouldBehaveLikeAccessTokenConsumer } from "./AccessTokenConsumer.behaviour";
import { AccessTokenVerifier, ConsumerMock } from "../../src/types";
import { Signers } from "../types";

const { solidity } = waffle;
chai.use(solidity);

describe("AccessTokenConsumer", function () {
  before("setup accounts", async function () {
    this.signers = {} as Signers;

    const signers: SignerWithAddress[] = await ethers.getSigners();
    this.signers.admin = signers[0];
    this.signers.user0 = signers[1];
    this.signers.user1 = signers[2];
    this.signers.user2 = signers[3];
  });

  before("deploy new", async function () {
    const authArtifact: Artifact = await artifacts.readArtifact("AccessTokenVerifier");
    const dappArtifact: Artifact = await artifacts.readArtifact("DummyDapp");
    const mockArtifact: Artifact = await artifacts.readArtifact("ConsumerMock");
    this.auth = <AccessTokenVerifier>(
      await waffle.deployContract(this.signers.admin, authArtifact, [this.signers.admin.address])
    );
    this.dapp = <DummyDapp>await waffle.deployContract(this.signers.admin, dappArtifact, [this.auth.address]);
    await this.auth.rotateIntermediate(this.signers.admin.address);
    await this.auth.rotateIssuer(this.signers.admin.address);
    this.mock = <ConsumerMock>await waffle.deployContract(this.signers.admin, mockArtifact, [this.auth.address]);
    this.fakeMock = <ConsumerMock>await waffle.deployContract(this.signers.admin, mockArtifact, [this.auth.address]);
  });

  before("construct test values", async function () {
    this.domain = {
      name: "Ethereum Access Token",
      version: "1",
      chainId: await this.signers.admin.getChainId(),
      verifyingContract: this.auth.address,
    };
  });

  shouldBehaveLikeAccessTokenConsumer();
});
