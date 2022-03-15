import { artifacts, ethers, waffle } from "hardhat";
import type { Artifact } from "hardhat/types";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { Signers } from "./types";
import { AuthVerifier } from "../src/types/AuthVerifier";
import { TokenStruct } from "../src/types/IAuthVerifier";
import { DummyDapp } from "../src/types/DummyDapp";
import signAuthMessage from "../src/utils/signAuthMessage";

const chai = require("chai");
const { solidity } = waffle;
chai.use(solidity);
const { expect } = chai;
const { BigNumber } = ethers;

describe("AuthCompatible", function () {
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
    const dappArtifact: Artifact = await artifacts.readArtifact("DummyDapp");
    this.auth = <AuthVerifier>(
      await waffle.deployContract(this.signers.admin, authArtifact, [this.signers.admin.address])
    );
    this.dapp = <DummyDapp>await waffle.deployContract(this.signers.admin, dappArtifact, [this.auth.address]);
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

    this.amount = 5;

    this.value = {
      expiry: Math.floor(new Date().getTime() / 1000) + 50,
      functionCall: {
        functionSignature: "0xb50e969c",
        target: this.dapp.address.toLowerCase(),
        caller: this.signers.admin.address.toLowerCase(),
        // Parameters are hexadecimally represented, left-padded with 0 to multiples of 64-characters (32-bytes), and concatenated together
        parameters: `0x${this.dapp.address.toLowerCase().substring(2).padStart(64, "0")}${this.amount
          .toString(16)
          .padStart(64, "0")}`,
      },
    };
  });

  describe("sign and verify", async () => {
    it("should succeed", async function () {
      const signature = await signAuthMessage(this.signers.admin, this.domain, this.value);

      expect(await this.dapp.lend(signature, BigNumber.from(this.value.expiry), this.dapp.address, this.amount)).to.be
        .true;
    });

    it("should fail with expired token", async function () {
      // The data to sign
      const value = { ...this.value, expiry: this.value.expiry - 50 };

      const signature = await signAuthMessage(this.signers.admin, this.domain, value);

      await expect(
        this.dapp.lend(signature, BigNumber.from(value.expiry - 50), this.dapp.address, this.amount),
      ).to.be.revertedWith("Auth: token has expired");
    });

    it("should fail with wrong signer", async function () {
      const signature = await signAuthMessage(this.signers.user0, this.domain, this.value);

      await expect(
        this.dapp.lend(signature, BigNumber.from(this.value.expiry), this.dapp.address, this.amount),
      ).to.be.revertedWith("Auth: token verification failure");
    });

    it("should fail with incorrect expiry", async function () {
      const signature = await signAuthMessage(this.signers.admin, this.domain, this.value);

      await expect(
        this.dapp.lend(signature, BigNumber.from(this.value.expiry + 10), this.dapp.address, this.amount),
      ).to.be.revertedWith("Auth: token verification failure");
    });

    it("should fail with incorrect target contract", async function () {
      // The data to sign
      const value = { ...this.value, functionCall: { ...this.value.functionCall, target: this.auth.address } };

      const signature = await signAuthMessage(this.signers.admin, this.domain, value);

      await expect(
        this.dapp.lend(signature, BigNumber.from(value.expiry), this.dapp.address, this.amount),
      ).to.be.revertedWith("Auth: token verification failure");
    });

    it("should fail with incorrect caller", async function () {
      // The data to sign
      const value = { ...this.value, functionCall: { ...this.value.functionCall, caller: this.auth.address } };

      const signature = await signAuthMessage(this.signers.admin, this.domain, value);

      await expect(
        this.dapp.lend(signature, BigNumber.from(value.expiry), this.dapp.address, this.amount),
      ).to.be.revertedWith("Auth: token verification failure");
    });

    it("should fail with incorrect token address", async function () {
      const signature = await signAuthMessage(this.signers.admin, this.domain, this.value);

      await expect(
        this.dapp.lend(signature, BigNumber.from(this.value.expiry), this.auth.address, this.amount),
      ).to.be.revertedWith("Auth: token verification failure");
    });

    it("should fail with incorrect amount", async function () {
      const signature = await signAuthMessage(this.signers.admin, this.domain, this.value);

      await expect(
        this.dapp.lend(signature, BigNumber.from(this.value.expiry), this.dapp.address, 6),
      ).to.be.revertedWith("Auth: token verification failure");
    });
  });
});
