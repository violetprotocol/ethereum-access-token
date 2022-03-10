import { artifacts, ethers, waffle } from "hardhat";
import type { Artifact } from "hardhat/types";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { Signers } from "./types";
import { KeyInfrastructure } from "../src/types/KeyInfrastructure";
import { Auth } from "../src/types/Auth";
import { AuthMessageToken } from "../src/types/messages/auth";
import signAuthMessage from "../src/utils/signAuthMessage";
import { Domain } from "domain";

const chai = require("chai");
const web3 = require("web3");
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
  });

  it("sign and verify", async function () {
    const domain = {
      name: "Ethereum Authorization Token",
      version: "1",
      chainId: await this.signers.admin.getChainId(),
      verifyingContract: this.auth.address,
    };

    const expiry = Math.floor(new Date().getTime() / 1000);

    const values: AuthMessageToken = {
      expiry,
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

    const signature = await signAuthMessage(this.signers.admin, domain, values);

    const token: Auth.TokenStruct = {
      expiry: BigNumber.from(expiry),
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
    expect(
      await this.auth.callStatic.verify(
        token,
        parseInt(signature.substring(0, 2), 16), // v uint8
        "0x".concat(signature.substring(2, 66)), // r bytes32
        "0x".concat(signature.substring(66, 130)), // s bytes32
      ),
    ).to.be.true;
  });
});
