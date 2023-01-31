import { artifacts, ethers, waffle } from "hardhat";
import chai from "chai";
import type { Artifact } from "hardhat/types";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { Signers } from "../types";
import { shouldBehaveLikeAccessTokenVerifier } from "./AccessTokenVerifier.behaviour";
import { AccessTokenVerifier } from "../../src/types";

const { solidity } = waffle;
chai.use(solidity);

describe("AccessTokenVerifier", function () {
  before(async function () {
    this.signers = {} as Signers;

    const signers: SignerWithAddress[] = await ethers.getSigners();
    this.signers.admin = signers[0];
    this.signers.user0 = signers[1];
    this.signers.user1 = signers[2];
    this.signers.user2 = signers[3];

    const authArtifact: Artifact = await artifacts.readArtifact("AccessTokenVerifier");
    this.auth = <AccessTokenVerifier>(
      await waffle.deployContract(this.signers.admin, authArtifact, [this.signers.admin.address])
    );
    await this.auth.rotateIntermediate(this.signers.admin.address);
    await this.auth.activateIssuers([this.signers.admin.address]);

    this.domain = {
      name: "Ethereum Access Token",
      version: "1",
      chainId: await this.signers.admin.getChainId(),
      verifyingContract: this.auth.address,
    };

    this.value = {
      expiry: Math.floor(new Date().getTime() / 1000) + 10,
      functionCall: {
        functionSignature: "0x0f694584",
        target: this.auth.address,
        caller: this.signers.admin.address,
        parameters: "0xff",
      },
    };
  });

  shouldBehaveLikeAccessTokenVerifier();
});
