import { artifacts, ethers, waffle } from "hardhat";
import type { Artifact } from "hardhat/types";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { Signers } from "./types";
import { KeyInfrastructure } from "../src/types/KeyInfrastructure";
import { Auth } from "../src/types/Auth";
import { AuthMessageToken, AuthMessageTypes } from "../src/messages/auth";
import signAuthMessage from "../src/utils/signAuthMessage";
import { recoverTypedSignature, SignTypedDataVersion } from "@metamask/eth-sig-util";
import { Domain } from "domain";

const chai = require("chai");
const web3 = require("web3");
const sigUtil = require("@metamask/eth-sig-util");
const { solidity } = waffle;
chai.use(solidity);
const { expect, assert } = chai;
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
    const authArtifact: Artifact = await artifacts.readArtifact("Auth");
    this.auth = <Auth>await waffle.deployContract(this.signers.admin, authArtifact, [this.signers.admin.address]);
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
        name: "test",
        target: this.auth.address,
        caller: this.signers.admin.address,
        parameters: [
          {
            typ: "uint256",
            value: "0xff",
          },
        ],
      },
    };
  });

  describe("sign and verify", async () => {
    it("should succeed", async function () {
      const expiry = Math.floor(new Date().getTime() / 1000) + 10;

      // The data to sign
      const value = { ...this.value, expiry };

      const signature = await signAuthMessage(this.signers.admin, this.domain, value);

      const token: Auth.TokenStruct = { ...value, expiry: BigNumber.from(expiry) };

      expect(
        await this.auth.callStatic.verify(
          token,
          BigNumber.from("0x".concat(signature.substring(130, 132))), // v uint8
          "0x".concat(signature.substring(2, 66)), // r bytes32
          "0x".concat(signature.substring(66, 130)), // s bytes32
        ),
      ).to.be.true;
    });

    it("should fail with expired token", async function () {
      const expiry = Math.floor(new Date().getTime() / 1000);

      // The data to sign
      const value = { ...this.value, expiry };

      const signature = await signAuthMessage(this.signers.admin, this.domain, value);

      const token: Auth.TokenStruct = { ...value, expiry: BigNumber.from(expiry) };

      await expect(
        this.auth.verify(
          token,
          BigNumber.from("0x".concat(signature.substring(130, 132))), // v uint8
          "0x".concat(signature.substring(2, 66)), // r bytes32
          "0x".concat(signature.substring(66, 130)), // s bytes32
        ),
      ).to.be.revertedWith("Auth: token has expired");
    });
  });
});
