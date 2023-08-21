import { artifacts, ethers, waffle, upgrades } from "hardhat";
import type { Artifact } from "hardhat/types";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import chai from "chai";

import { shouldBehaveLikeAccessTokenConsumer } from "../AccessTokenConsumer.behaviour";
import {
  AccessTokenVerifier,
  UpgradeableConsumerMock,
  DummyDappUpgradeable__factory,
  DummyDappUpgradeable,
  UpgradeableConsumerMock__factory,
} from "../../../src/types";
import { Signers } from "../../types";

const { solidity } = waffle;
chai.use(solidity);

describe("AccessTokenConsumerUpgradeable", function () {
  before("setup accounts", async function () {
    this.signers = {} as Signers;

    const signers: SignerWithAddress[] = await ethers.getSigners();
    this.signers.admin = signers[0];
    this.signers.user0 = signers[1];
    this.signers.user1 = signers[2];
    this.signers.user2 = signers[3];
  });

  before("deploy new", async function () {
    const authArtifact: Artifact = await artifacts.readArtifact("AccessTokenVerifier");
    const dummyDappFactory: DummyDappUpgradeable__factory = <DummyDappUpgradeable__factory>(
      await ethers.getContractFactory("DummyDappUpgradeable")
    );
    const mockFactory: UpgradeableConsumerMock__factory = <UpgradeableConsumerMock__factory>(
      await ethers.getContractFactory("UpgradeableConsumerMock")
    );

    this.auth = <AccessTokenVerifier>(
      await waffle.deployContract(this.signers.admin, authArtifact, [this.signers.admin.address])
    );
    await this.auth.rotateIntermediate(this.signers.admin.address);
    await this.auth.activateIssuers([this.signers.admin.address]);

    this.dapp = <DummyDappUpgradeable>(
      await upgrades.deployProxy(dummyDappFactory, [this.auth.address], { initializer: "initialize" })
    );
    await this.dapp.deployed();

    this.mock = <UpgradeableConsumerMock>(
      await upgrades.deployProxy(mockFactory, [this.auth.address], { initializer: "initialize" })
    );
    await this.mock.deployed();

    this.fakeMock = <UpgradeableConsumerMock>(
      await upgrades.deployProxy(mockFactory, [this.auth.address], { initializer: "initialize" })
    );
    await this.fakeMock.deployed();
  });

  before("construct test values", async function () {
    this.domain = {
      name: "Ethereum Access Token",
      version: "1",
      chainId: await this.signers.admin.getChainId(),
      verifyingContract: this.auth.address,
    };
  });

  shouldBehaveLikeAccessTokenConsumer();
});
