import { ethers, waffle } from "hardhat";
import chai from "chai";
import { AccessTokenStruct } from "../../src/types/IAccessTokenVerifier";
import { signAccessToken } from "../../src/utils/signAccessToken";
import { splitSignature } from "@ethersproject/bytes";

const { solidity } = waffle;
chai.use(solidity);
const { expect } = chai;
const { BigNumber } = ethers;

const shouldBehaveLikeAccessTokenVerifier = function () {
  const invalidSignatureV = 26;
  const invalidSignatureS = "0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF5D576E7357A4501DDFE92F46681B20A1";

  describe("sign and verify", async () => {
    it("should succeed", async function () {
      const signature = splitSignature(await signAccessToken(this.signers.admin, this.domain, this.token));

      await expect(this.auth.verify(this.token, signature.v, signature.r, signature.s)).to.not.be.reverted;
      expect(await this.auth.callStatic.verify(this.token, signature.v, signature.r, signature.s)).to.be.true;
    });

    it("should return signer address", async function () {
      const signature = splitSignature(await signAccessToken(this.signers.admin, this.domain, this.token));

      await expect(this.auth.verifySignerOf(this.token, signature.v, signature.r, signature.s)).to.not.be.reverted;
      expect(await this.auth.callStatic.verifySignerOf(this.token, signature.v, signature.r, signature.s)).to.equal(
        this.signers.admin.address,
      );
    });

    it("should not return wrong address", async function () {
      const signature = splitSignature(await signAccessToken(this.signers.user0, this.domain, this.token));

      await expect(this.auth.verifySignerOf(this.token, signature.v, signature.r, signature.s)).to.not.be.reverted;
      expect(await this.auth.callStatic.verifySignerOf(this.token, signature.v, signature.r, signature.s)).to.not.equal(
        this.signers.admin.address,
      );
    });

    it("should return different signer with malformed token", async function () {
      const signature = splitSignature(await signAccessToken(this.signers.admin, this.domain, this.token));

      const malformedSComponent = signature.s.slice(0, -1) + "E";
      await expect(this.auth.verifySignerOf(this.token, signature.v, signature.r, malformedSComponent)).to.not.be
        .reverted;
      expect(
        await this.auth.callStatic.verifySignerOf(this.token, signature.v, signature.r, malformedSComponent),
      ).to.not.equal(this.signers.admin.address);
    });

    it("should revert if signature v is invalid", async function () {
      // The data to sign
      const value = { ...this.token, expiry: this.token.expiry + 10 };

      const signature = splitSignature(await signAccessToken(this.signers.admin, this.domain, value));

      await expect(this.auth.verify(value, invalidSignatureV, signature.r, signature.s)).to.be.revertedWith(
        "AccessToken: ISV",
      );
    });

    it("should revert if signature s is invalid", async function () {
      // The data to sign
      const value = { ...this.token, expiry: this.token.expiry + 10 };

      const signature = splitSignature(await signAccessToken(this.signers.admin, this.domain, value));

      await expect(this.auth.verify(value, signature.v, signature.r, invalidSignatureS)).to.be.revertedWith(
        "AccessToken: ISS",
      );
    });

    it("should revert with an invalid signature", async function () {
      const bytes32Zero = "0x0000000000000000000000000000000000000000000000000000000000000000";

      // The data to sign
      const value = { ...this.token, expiry: this.token.expiry + 10 };

      const signature = splitSignature(await signAccessToken(this.signers.admin, this.domain, value));

      await expect(this.auth.verify(value, signature.v, bytes32Zero, bytes32Zero)).to.be.revertedWith(
        "AccessToken: IS",
      );
    });

    it.only("should fail with expired token", async function () {
      // The data to sign
      const value = { ...this.token, expiry: 1692512434 };

      const signature = splitSignature(await signAccessToken(this.signers.admin, this.domain, value));

      await expect(this.auth.verify(value, signature.v, signature.r, signature.s)).to.be.revertedWith(
        "AccessToken: HE",
      );
    });

    it("should fail with incorrect expiry", async function () {
      const signature = splitSignature(await signAccessToken(this.signers.admin, this.domain, this.token));

      const badToken: AccessTokenStruct = { ...this.token, expiry: BigNumber.from(this.token.expiry + 10) };

      expect(await this.auth.callStatic.verify(badToken, signature.v, signature.r, signature.s)).to.equal(false);
    });

    it("should fail with incorrect function signature", async function () {
      const signature = splitSignature(await signAccessToken(this.signers.admin, this.domain, this.token));

      const badToken: AccessTokenStruct = {
        ...this.token,
        functionCall: { ...this.token.functionCall, functionSignature: "0xdeadbeef" },
      };

      expect(await this.auth.callStatic.verify(badToken, signature.v, signature.r, signature.s)).to.equal(false);
    });

    it("should fail with incorrect target address", async function () {
      const signature = splitSignature(await signAccessToken(this.signers.admin, this.domain, this.token));

      const badToken: AccessTokenStruct = {
        ...this.token,
        functionCall: { ...this.token.functionCall, target: "0x25AF0ccA791baEe922D9fa0744880ae6E0422021" },
      };

      expect(await this.auth.callStatic.verify(badToken, signature.v, signature.r, signature.s)).to.equal(false);
    });

    it("should fail with incorrect caller address", async function () {
      const signature = splitSignature(await signAccessToken(this.signers.admin, this.domain, this.token));

      const badToken: AccessTokenStruct = {
        ...this.token,
        functionCall: { ...this.token.functionCall, caller: "0x25AF0ccA791baEe922D9fa0744880ae6E0422021" },
      };

      expect(await this.auth.callStatic.verify(badToken, signature.v, signature.r, signature.s)).to.equal(false);
    });

    it("should fail with incorrect function parameters", async function () {
      const signature = splitSignature(await signAccessToken(this.signers.admin, this.domain, this.token));

      const badToken: AccessTokenStruct = {
        ...this.token,
        functionCall: { ...this.token.functionCall, parameters: "0xdd" },
      };

      expect(await this.auth.callStatic.verify(badToken, signature.v, signature.r, signature.s)).to.equal(false);
    });
  });
};

export { shouldBehaveLikeAccessTokenVerifier };
