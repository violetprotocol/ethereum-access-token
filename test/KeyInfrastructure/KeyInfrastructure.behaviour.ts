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
    context("using activateIssuers", async function () {
      after("reset", async function () {
        await expect(this.keyInfrastructure.rotateIntermediate(this.signers.user0.address)).to.not.be.reverted;
        await expect(
          this.keyInfrastructure
            .connect(this.signers.user0)
            .deactivateIssuers(await this.keyInfrastructure.getActiveIssuers()),
        ).to.not.be.reverted;
      });

      it("should succeed", async function () {
        await expect(this.keyInfrastructure.connect(this.signers.user0).activateIssuers([this.signers.admin.address]))
          .to.emit(this.keyInfrastructure, "IssuerActivated")
          .withArgs(this.signers.admin.address);

        expect(await this.keyInfrastructure.callStatic.isActiveIssuer(this.signers.admin.address)).to.be.true;
        expect(await this.keyInfrastructure.callStatic.getActiveIssuers()).to.deep.equal([this.signers.admin.address]);
      });

      it("should not add existing issuer to list again", async function () {
        await expect(
          this.keyInfrastructure.connect(this.signers.user0).activateIssuers([this.signers.admin.address]),
        ).to.not.emit(this.keyInfrastructure, "IssuerActivated");

        expect(await this.keyInfrastructure.callStatic.isActiveIssuer(this.signers.admin.address)).to.be.true;
        expect(await this.keyInfrastructure.callStatic.getActiveIssuers()).to.deep.equal([this.signers.admin.address]);
      });

      it("from new intermediate key should succeed", async function () {
        await expect(this.keyInfrastructure.rotateIntermediate(this.signers.user1.address)).to.not.be.reverted;
        await expect(this.keyInfrastructure.connect(this.signers.user1).activateIssuers([this.signers.user0.address]))
          .to.emit(this.keyInfrastructure, "IssuerActivated")
          .withArgs(this.signers.user0.address);

        expect(await this.keyInfrastructure.callStatic.isActiveIssuer(this.signers.user0.address)).to.be.true;
        expect(await this.keyInfrastructure.callStatic.getActiveIssuers()).to.deep.equal([
          this.signers.admin.address,
          this.signers.user0.address,
        ]);
      });

      it("from wrong key should fail", async function () {
        await expect(
          this.keyInfrastructure.connect(this.signers.user0).activateIssuers([this.signers.user0.address]),
        ).to.be.revertedWith("unauthorised: must be intermediate");

        expect(await this.keyInfrastructure.callStatic.isActiveIssuer(this.signers.user0.address)).to.be.true;
        expect(await this.keyInfrastructure.callStatic.getActiveIssuers()).to.deep.equal([
          this.signers.admin.address,
          this.signers.user0.address,
        ]);
      });
    });

    context("using deactivateIssuers", async function () {
      context("with activated issuers", async function () {
        beforeEach("activate issuers", async function () {
          await expect(
            this.keyInfrastructure.connect(this.signers.user0).activateIssuers([this.signers.admin.address]),
          ).to.not.be.reverted;
        });

        it("should succeed", async function () {
          await expect(
            this.keyInfrastructure.connect(this.signers.user0).deactivateIssuers([this.signers.admin.address]),
          )
            .to.emit(this.keyInfrastructure, "IssuerDeactivated")
            .withArgs(this.signers.admin.address);

          expect(await this.keyInfrastructure.callStatic.isActiveIssuer(this.signers.admin.address)).to.be.false;
          expect(await this.keyInfrastructure.callStatic.getActiveIssuers()).to.deep.equal([]);
        });

        it("from new intermediate key should succeed", async function () {
          await expect(this.keyInfrastructure.rotateIntermediate(this.signers.user1.address)).to.not.be.reverted;
          await expect(
            this.keyInfrastructure.connect(this.signers.user1).deactivateIssuers([this.signers.admin.address]),
          )
            .to.emit(this.keyInfrastructure, "IssuerDeactivated")
            .withArgs(this.signers.admin.address);

          expect(await this.keyInfrastructure.callStatic.isActiveIssuer(this.signers.admin.address)).to.be.false;
          expect(await this.keyInfrastructure.callStatic.getActiveIssuers()).to.deep.equal([]);

          await expect(this.keyInfrastructure.rotateIntermediate(this.signers.user0.address)).to.not.be.reverted;
        });

        it("from wrong key should fail", async function () {
          await expect(
            this.keyInfrastructure.connect(this.signers.user1).deactivateIssuers([this.signers.user0.address]),
          ).to.be.revertedWith("unauthorised: must be intermediate");

          expect(await this.keyInfrastructure.callStatic.isActiveIssuer(this.signers.admin.address)).to.be.true;
          expect(await this.keyInfrastructure.callStatic.getActiveIssuers()).to.deep.equal([
            this.signers.admin.address,
          ]);
        });
      });
    });
  });
};

export { shouldBehaveLikeKeyInfrastructure };
