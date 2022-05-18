import { artifacts, ethers, waffle } from "hardhat";
import type { Artifact } from "hardhat/types";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { Signers } from "../types";
import { DummyDapp } from "../../src/types/DummyDapp";
import { signAccessToken } from "../../src/utils/signAccessToken";
import { packParameters } from "../../src/utils/packParameters";
import { splitSignature } from "@ethersproject/bytes";

const chai = require("chai");
const { solidity } = waffle;
chai.use(solidity);
const { expect } = chai;
const { BigNumber } = ethers;

const shouldBehaveLikeAccessTokenConsumer = function () {
  describe("sign and verify", async () => {
    it("should succeed", async function () {
      const signature = splitSignature(await signAccessToken(this.signers.admin, this.domain, this.value));

      expect(
        await this.dapp.lend(
          signature.v,
          signature.r,
          signature.s,
          BigNumber.from(this.value.expiry),
          this.testTokenAddress,
          this.amount,
        ),
      ).to.be.true;
    });

    it("should fail with expired token", async function () {
      // The data to sign
      const value = { ...this.value, expiry: this.value.expiry - 50 };

      const signature = splitSignature(await signAccessToken(this.signers.admin, this.domain, this.value));

      await expect(
        this.dapp.lend(
          signature.v,
          signature.r,
          signature.s,
          BigNumber.from(value.expiry - 50),
          this.testTokenAddress,
          this.amount,
        ),
      ).to.be.revertedWith("AuthToken: has expired");
    });

    it("should fail with wrong signer", async function () {
      const signature = splitSignature(await signAccessToken(this.signers.user0, this.domain, this.value));

      await expect(
        this.dapp.lend(
          signature.v,
          signature.r,
          signature.s,
          BigNumber.from(this.value.expiry),
          this.testTokenAddress,
          this.amount,
        ),
      ).to.be.revertedWith("AuthToken: verification failure");
    });

    it("should fail with incorrect expiry", async function () {
      const signature = splitSignature(await signAccessToken(this.signers.admin, this.domain, this.value));

      await expect(
        this.dapp.lend(
          signature.v,
          signature.r,
          signature.s,
          BigNumber.from(this.value.expiry + 10),
          this.testTokenAddress,
          this.amount,
        ),
      ).to.be.revertedWith("AuthToken: verification failure");
    });

    it("should fail with incorrect function signature", async function () {
      // The data to sign
      const value = { ...this.value, functionCall: { ...this.value.functionCall, functionSignature: "0xb50e969c" } };

      const signature = splitSignature(await signAccessToken(this.signers.admin, this.domain, value));

      await expect(
        this.dapp.lend(
          signature.v,
          signature.r,
          signature.s,
          BigNumber.from(value.expiry),
          this.testTokenAddress,
          this.amount,
        ),
      ).to.be.revertedWith("AuthToken: verification failure");
    });

    it("should fail with incorrect target contract", async function () {
      // The data to sign
      const value = { ...this.value, functionCall: { ...this.value.functionCall, target: this.auth.address } };

      const signature = splitSignature(await signAccessToken(this.signers.admin, this.domain, value));

      await expect(
        this.dapp.lend(
          signature.v,
          signature.r,
          signature.s,
          BigNumber.from(value.expiry),
          this.testTokenAddress,
          this.amount,
        ),
      ).to.be.revertedWith("AuthToken: verification failure");
    });

    it("should fail with incorrect caller", async function () {
      // The data to sign
      const value = { ...this.value, functionCall: { ...this.value.functionCall, caller: this.auth.address } };

      const signature = splitSignature(await signAccessToken(this.signers.admin, this.domain, value));

      await expect(
        this.dapp.lend(
          signature.v,
          signature.r,
          signature.s,
          BigNumber.from(value.expiry),
          this.testTokenAddress,
          this.amount,
        ),
      ).to.be.revertedWith("AuthToken: verification failure");
    });

    it("should fail with incorrect token address", async function () {
      const signature = splitSignature(await signAccessToken(this.signers.admin, this.domain, this.value));

      await expect(
        this.dapp.lend(
          signature.v,
          signature.r,
          signature.s,
          BigNumber.from(this.value.expiry),
          this.auth.address,
          this.amount,
        ),
      ).to.be.revertedWith("AuthToken: verification failure");
    });

    it("should fail with incorrect amount", async function () {
      const signature = splitSignature(await signAccessToken(this.signers.admin, this.domain, this.value));

      await expect(
        this.dapp.lend(
          signature.v,
          signature.r,
          signature.s,
          BigNumber.from(this.value.expiry),
          this.testTokenAddress,
          6,
        ),
      ).to.be.revertedWith("AuthToken: verification failure");
    });
  });
};

export { shouldBehaveLikeAccessTokenConsumer };
