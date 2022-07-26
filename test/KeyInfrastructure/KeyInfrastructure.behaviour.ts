import { waffle } from "hardhat";
import chai from "chai";

const { solidity } = waffle;
chai.use(solidity);
const { expect } = chai;

const shouldBehaveLikeKeyInfrastructure = function () {
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
};

export { shouldBehaveLikeKeyInfrastructure };
