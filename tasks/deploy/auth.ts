import { task } from "hardhat/config";
import { TaskArguments } from "hardhat/types";
import { LedgerSigner } from "@anders-t/ethers-ledger";

import { AccessTokenVerifier } from "../../src/types/AccessTokenVerifier";
import { AccessTokenVerifier__factory } from "../../src/types/factories/AccessTokenVerifier__factory";

task("deploy:AccessTokenVerifier")
  .addParam("root", "Root key")
  .setAction(async function (taskArguments: TaskArguments, { ethers, waffle }) {
    const accessTokenVerifierFactory: AccessTokenVerifier__factory = <AccessTokenVerifier__factory>(
      await ethers.getContractFactory("AccessTokenVerifier")
    );
    const accessTokenVerifier: AccessTokenVerifier = <AccessTokenVerifier>(
      await accessTokenVerifierFactory.deploy(taskArguments.root)
    );
    await accessTokenVerifier.deployed();
    console.log("AccessTokenVerifier deployed to: ", accessTokenVerifier.address);
  });

task("hd:deploy:AccessTokenVerifier")
  .addParam("root", "Root key")
  .setAction(async function (taskArguments: TaskArguments, { ethers, network, waffle }) {
    // Change me
    const POLYGON_GAS_PRICE = ethers.utils.parseUnits("35", "gwei");

    const ledger = new LedgerSigner(ethers.provider);

    const accessTokenVerifierFactory: AccessTokenVerifier__factory = <AccessTokenVerifier__factory>(
      await ethers.getContractFactory("AccessTokenVerifier")
    );

    try {
      console.log("Deploying...");

      let accessTokenVerifier: AccessTokenVerifier;
      if (network.name === "polygon") {
        accessTokenVerifier = <AccessTokenVerifier>(
          await accessTokenVerifierFactory.connect(ledger).deploy(taskArguments.root, { gasPrice: POLYGON_GAS_PRICE })
        );
      } else {
        accessTokenVerifier = <AccessTokenVerifier>(
          await accessTokenVerifierFactory.connect(ledger).deploy(taskArguments.root)
        );
      }

      await accessTokenVerifier.deployed();
      console.log("AccessTokenVerifier deployed to: ", accessTokenVerifier.address);
    } catch (error) {
      console.log(error);
    }
  });
