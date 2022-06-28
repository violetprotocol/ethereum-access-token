import { artifacts, ethers, waffle } from "hardhat";
import type { Artifact } from "hardhat/types";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { Signers } from "../types";
import { KeyInfrastructure } from "../../src/types/KeyInfrastructure";
import { shouldBehaveLikeKeyInfrastructure } from "./KeyInfrastructure.behaviour";

const chai = require("chai");
const { solidity } = waffle;
chai.use(solidity);
const { expect } = chai;

describe("Key Infrastructure", function () {
  before(async function () {
    this.signers = {} as Signers;

    const signers: SignerWithAddress[] = await ethers.getSigners();
    this.signers.admin = signers[0];
    this.signers.user0 = signers[1];
    this.signers.user1 = signers[2];
    this.signers.user2 = signers[3];

    const keyInfraArtifact: Artifact = await artifacts.readArtifact("KeyInfrastructure");
    this.keyInfrastructure = <KeyInfrastructure>(
      await waffle.deployContract(this.signers.admin, keyInfraArtifact, [this.signers.admin.address])
    );
  });

  shouldBehaveLikeKeyInfrastructure();
});
