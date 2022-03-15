import { artifacts, ethers, waffle } from "hardhat";
import type { Artifact } from "hardhat/types";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { Signers } from "./types";
import { AuthVerifier } from "../src/types/AuthVerifier";
import { TokenStruct } from "../src/types/IAuthVerifier";
import signAuthMessage from "../src/utils/signAuthMessage";

const chai = require("chai");
const { solidity } = waffle;
chai.use(solidity);
const { expect } = chai;
const { BigNumber } = ethers;

describe("Auth", function () {
  before(async function () {
    this.signers = {} as Signers;

    const signers: SignerWithAddress[] = await ethers.getSigners();
    this.signers.admin = signers[0];
    this.signers.user0 = signers[1];
    this.signers.user1 = signers[2];
    this.signers.user2 = signers[3];
  });

  before("deploy new", async function () {
    const authArtifact: Artifact = await artifacts.readArtifact("AuthVerifier");
    this.auth = <AuthVerifier>(
      await waffle.deployContract(this.signers.admin, authArtifact, [this.signers.admin.address])
    );
    await this.auth.rotateIntermediate(this.signers.admin.address);
    await this.auth.rotateIssuer(this.signers.admin.address);
  });

  before("construct test values", async function () {
    this.domain = {
      name: "Ethereum Authorization Token",
      version: "1",
      chainId: await this.signers.admin.getChainId(),
      verifyingContract: this.auth.address,
    };

    this.value = {
      expiry: 0,
      functionCall: {
        functionSignature: "0x0f694584",
        target: this.auth.address,
        caller: this.signers.admin.address,
        parameters: "0xff",
      },
    };
  });

  describe("sign and verify", async () => {
    it("should succeed", async function () {
      const expiry = Math.floor(new Date().getTime() / 1000) + 10;

      // The data to sign
      const value = { ...this.value, expiry };

      const signature = await signAuthMessage(this.signers.admin, this.domain, value);

      const token: TokenStruct = { ...value, expiry: BigNumber.from(expiry) };

      expect(await this.auth.callStatic.verify(token, signature)).to.be.true;
    });

    it("should fail with expired token", async function () {
      const expiry = Math.floor(new Date().getTime() / 1000);

      // The data to sign
      const value = { ...this.value, expiry };

      const signature = await signAuthMessage(this.signers.admin, this.domain, value);

      const token: TokenStruct = { ...value, expiry: BigNumber.from(expiry) };

      await expect(this.auth.verify(token, signature)).to.be.revertedWith("Auth: token has expired");
    });
  });
});
