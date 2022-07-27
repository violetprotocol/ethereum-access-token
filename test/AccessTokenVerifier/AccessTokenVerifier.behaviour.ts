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
      const signature = splitSignature(await signAccessToken(this.signers.admin, this.domain, this.value));

      await expect(this.auth.verify(this.value, signature.v, signature.r, signature.s)).to.not.be.reverted;
      expect(await this.auth.callStatic.verify(this.value, signature.v, signature.r, signature.s)).to.be.true;
    });

    it("should revert if signature v is invalid", async function () {
      // The data to sign
      const value = { ...this.value, expiry: this.value.expiry + 10 };

      const signature = splitSignature(await signAccessToken(this.signers.admin, this.domain, value));

      await expect(this.auth.verify(value, invalidSignatureV, signature.r, signature.s)).to.be.revertedWith(
        "AccessToken: invalid signature v",
      );
    });

    it("should revert if signature s is invalid", async function () {
      // The data to sign
      const value = { ...this.value, expiry: this.value.expiry + 10 };

      const signature = splitSignature(await signAccessToken(this.signers.admin, this.domain, value));

      await expect(this.auth.verify(value, signature.v, signature.r, invalidSignatureS)).to.be.revertedWith(
        "AccessToken: invalid signature s",
      );
    });

    it("should revert with an invalid signature", async function () {
      const bytes32Zero = "0x0000000000000000000000000000000000000000000000000000000000000000";

      // The data to sign
      const value = { ...this.value, expiry: this.value.expiry + 10 };

      const signature = splitSignature(await signAccessToken(this.signers.admin, this.domain, value));

      await expect(this.auth.verify(value, signature.v, bytes32Zero, bytes32Zero)).to.be.revertedWith(
        "AccessToken: invalid signature",
      );
    });

    it("should fail with expired token", async function () {
      // The data to sign
      const value = { ...this.value, expiry: this.value.expiry - 10 };

      const signature = splitSignature(await signAccessToken(this.signers.admin, this.domain, value));

      await expect(this.auth.verify(value, signature.v, signature.r, signature.s)).to.be.revertedWith(
        "AccessToken: has expired",
      );
    });

    it("should fail with incorrect expiry", async function () {
      const signature = splitSignature(await signAccessToken(this.signers.admin, this.domain, this.value));

      const badToken: AccessTokenStruct = { ...this.value, expiry: BigNumber.from(this.value.expiry + 10) };

      expect(await this.auth.callStatic.verify(badToken, signature.v, signature.r, signature.s)).to.equal(false);
    });

    it("should fail with incorrect function signature", async function () {
      const signature = splitSignature(await signAccessToken(this.signers.admin, this.domain, this.value));

      const badToken: AccessTokenStruct = {
        ...this.value,
        functionCall: { ...this.value.functionCall, functionSignature: "0xdeadbeef" },
      };

      expect(await this.auth.callStatic.verify(badToken, signature.v, signature.r, signature.s)).to.equal(false);
    });

    it("should fail with incorrect target address", async function () {
      const signature = splitSignature(await signAccessToken(this.signers.admin, this.domain, this.value));

      const badToken: AccessTokenStruct = {
        ...this.value,
        functionCall: { ...this.value.functionCall, target: "0x25AF0ccA791baEe922D9fa0744880ae6E0422021" },
      };

      expect(await this.auth.callStatic.verify(badToken, signature.v, signature.r, signature.s)).to.equal(false);
    });

    it("should fail with incorrect caller address", async function () {
      const signature = splitSignature(await signAccessToken(this.signers.admin, this.domain, this.value));

      const badToken: AccessTokenStruct = {
        ...this.value,
        functionCall: { ...this.value.functionCall, caller: "0x25AF0ccA791baEe922D9fa0744880ae6E0422021" },
      };

      expect(await this.auth.callStatic.verify(badToken, signature.v, signature.r, signature.s)).to.equal(false);
    });

    it("should fail with incorrect function parameters", async function () {
      const signature = splitSignature(await signAccessToken(this.signers.admin, this.domain, this.value));

      const badToken: AccessTokenStruct = {
        ...this.value,
        functionCall: { ...this.value.functionCall, parameters: "0xdd" },
      };

      expect(await this.auth.callStatic.verify(badToken, signature.v, signature.r, signature.s)).to.equal(false);
    });
  });
};

export { shouldBehaveLikeAccessTokenVerifier };
