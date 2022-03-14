import { artifacts, ethers, waffle } from "hardhat";
import type { Artifact } from "hardhat/types";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { Signers } from "./types";
import { KeyInfrastructure } from "../src/types/KeyInfrastructure";
import { EtherMail } from "../src/types/EtherMail";
import { Mail } from "../src/messages/mail";
import signMailMessage from "../src/utils/signMailMessage";
import { recoverTypedSignature, SignTypedDataVersion, signTypedData } from "@metamask/eth-sig-util";
import { Domain } from "domain";
import { MailMessageTypes } from "../src/messages/mail";

const chai = require("chai");
const web3 = require("web3");
const { solidity } = waffle;
chai.use(solidity);
const { expect, assert } = chai;
const { BigNumber } = ethers;

describe("EtherMail", function () {
  before(async function () {
    this.signers = {} as Signers;

    const signers: SignerWithAddress[] = await ethers.getSigners();
    this.signers.admin = signers[0];
    this.signers.user0 = signers[1];
    this.signers.user1 = signers[2];
    this.signers.user2 = signers[3];
  });

  before("deploy new", async function () {
    const mailArtifact: Artifact = await artifacts.readArtifact("EtherMail");
    this.mail = <EtherMail>await waffle.deployContract(this.signers.admin, mailArtifact);
  });

  it("sign and verify", async function () {
    const domain = {
      name: "Ether Mail",
      version: "1",
      chainId: await this.signers.admin.getChainId(),
      verifyingContract: this.mail.address,
    };

    // The data to sign
    const value = {
      from: {
        name: "Cow",
        wallet: web3.utils.toChecksumAddress(this.signers.admin.address),
      },
      to: {
        name: "Bob",
        wallet: "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB",
      },
      contents: "Hello, Bob!",
    };

    const signature = await signMailMessage(this.signers.admin, domain, value);

    expect(
      await this.mail.callStatic.verify(
        value,
        BigNumber.from("0x".concat(signature.substring(130, 132))), // v uint8
        "0x".concat(signature.substring(2, 66)), // r bytes32
        "0x".concat(signature.substring(66, 130)), // s bytes32
      ),
    ).to.be.true;
  });
});
