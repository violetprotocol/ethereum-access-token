import { artifacts, ethers, waffle } from "hardhat";
import type { Artifact } from "hardhat/types";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { Signers } from "./types";
import { AuthVerifier } from "../src/types/AuthVerifier";
import { AuthTokenStruct } from "../src/types/IAuthVerifier";
import { signAuthMessage } from "../src/utils/signAuthMessage";
import { splitSignature } from "@ethersproject/bytes";

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
      expiry: Math.floor(new Date().getTime() / 1000) + 10,
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
      const signature = splitSignature(await signAuthMessage(this.signers.admin, this.domain, this.value));

      expect(await this.auth.callStatic.verify(this.value, signature.v, signature.r, signature.s)).to.be.true;
    });

    it("should fail with expired token", async function () {
      // The data to sign
      const value = { ...this.value, expiry: this.value.expiry - 10 };

      const signature = splitSignature(await signAuthMessage(this.signers.admin, this.domain, value));

      await expect(this.auth.verify(value, signature.v, signature.r, signature.s)).to.be.revertedWith(
        "AuthToken: has expired",
      );
    });

    it("should fail with incorrect expiry", async function () {
      const signature = splitSignature(await signAuthMessage(this.signers.admin, this.domain, this.value));

      const badToken: AuthTokenStruct = { ...this.value, expiry: BigNumber.from(this.value.expiry + 10) };

      expect(await this.auth.callStatic.verify(badToken, signature.v, signature.r, signature.s)).to.equal(false);
    });

    it("should fail with incorrect function signature", async function () {
      const signature = splitSignature(await signAuthMessage(this.signers.admin, this.domain, this.value));

      const badToken: AuthTokenStruct = {
        ...this.value,
        functionCall: { ...this.value.functionCall, functionSignature: "0xdeadbeef" },
      };

      expect(await this.auth.callStatic.verify(badToken, signature.v, signature.r, signature.s)).to.equal(false);
    });

    it("should fail with incorrect target address", async function () {
      const signature = splitSignature(await signAuthMessage(this.signers.admin, this.domain, this.value));

      const badToken: AuthTokenStruct = {
        ...this.value,
        functionCall: { ...this.value.functionCall, target: "0x25AF0ccA791baEe922D9fa0744880ae6E0422021" },
      };

      expect(await this.auth.callStatic.verify(badToken, signature.v, signature.r, signature.s)).to.equal(false);
    });

    it("should fail with incorrect caller address", async function () {
      const signature = splitSignature(await signAuthMessage(this.signers.admin, this.domain, this.value));

      const badToken: AuthTokenStruct = {
        ...this.value,
        functionCall: { ...this.value.functionCall, caller: "0x25AF0ccA791baEe922D9fa0744880ae6E0422021" },
      };

      expect(await this.auth.callStatic.verify(badToken, signature.v, signature.r, signature.s)).to.equal(false);
    });

    it("should fail with incorrect function parameters", async function () {
      const signature = splitSignature(await signAuthMessage(this.signers.admin, this.domain, this.value));

      const badToken: AuthTokenStruct = {
        ...this.value,
        functionCall: { ...this.value.functionCall, parameters: "0xdd" },
      };

      expect(await this.auth.callStatic.verify(badToken, signature.v, signature.r, signature.s)).to.equal(false);
    });
  });
});
