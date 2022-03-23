import { artifacts, ethers, waffle } from "hardhat";
import type { Artifact } from "hardhat/types";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { Signers } from "./types";
import { KeyInfrastructure } from "../src/types/KeyInfrastructure";

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
  });

  before("deploy new", async function () {
    const keyInfraArtifact: Artifact = await artifacts.readArtifact("KeyInfrastructure");
    this.keyInfrastructure = <KeyInfrastructure>(
      await waffle.deployContract(this.signers.admin, keyInfraArtifact, [this.signers.admin.address])
    );
  });

  it("key infrastructure should have been initialised correctly", async function () {
    expect(await this.keyInfrastructure.callStatic.getRootKey()).to.equal(this.signers.admin.address);
  });

  describe("Rotate Intermediate", async () => {
    it("should succeed", async function () {
      await expect(this.keyInfrastructure.rotateIntermediate(this.signers.user0.address)).to.not.be.reverted;

      expect(await this.keyInfrastructure.callStatic.getIntermediateKey()).to.equal(this.signers.user0.address);
    });

    it("from wrong key should fail", async function () {
      await expect(
        this.keyInfrastructure.connect(this.signers.user1).rotateIntermediate(this.signers.user1.address),
      ).to.be.revertedWith("unauthorised: must be root");

      expect(await this.keyInfrastructure.callStatic.getIntermediateKey()).to.equal(this.signers.user0.address);
    });
  });

  describe("Rotate Issuer", async () => {
    it("should succeed", async function () {
      await expect(this.keyInfrastructure.connect(this.signers.user0).rotateIssuer(this.signers.admin.address)).to.not
        .be.reverted;

      expect(await this.keyInfrastructure.callStatic.getIssuerKey()).to.equal(this.signers.admin.address);
    });

    it("from new key should succeed", async function () {
      await expect(this.keyInfrastructure.rotateIntermediate(this.signers.user1.address)).to.not.be.reverted;
      await expect(this.keyInfrastructure.connect(this.signers.user1).rotateIssuer(this.signers.user0.address)).to.not
        .be.reverted;

      expect(await this.keyInfrastructure.callStatic.getIssuerKey()).to.equal(this.signers.user0.address);
    });

    it("from wrong key should fail", async function () {
      await expect(
        this.keyInfrastructure.connect(this.signers.user0).rotateIssuer(this.signers.user0.address),
      ).to.be.revertedWith("unauthorised: must be intermediate");

      expect(await this.keyInfrastructure.callStatic.getIssuerKey()).to.equal(this.signers.user0.address);
    });
  });
});
