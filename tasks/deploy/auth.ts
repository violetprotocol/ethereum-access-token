import { task } from "hardhat/config";
import { TaskArguments } from "hardhat/types";
import { LedgerSigner } from "@anders-t/ethers-ledger";

import { AccessTokenVerifier } from "../../src/types/AccessTokenVerifier";
import { AccessTokenVerifier__factory } from "../../src/types/factories/AccessTokenVerifier__factory";

task("deploy:AccessTokenVerifier")
  .addParam("root", "Root key")
  .setAction(async function (taskArguments: TaskArguments, { ethers, run }) {
    console.log(`Deploying Access Token Verifier...`);

    const accessTokenVerifierFactory: AccessTokenVerifier__factory = <AccessTokenVerifier__factory>(
      await ethers.getContractFactory("AccessTokenVerifier")
    );
    const accessTokenVerifier: AccessTokenVerifier = <AccessTokenVerifier>(
      await accessTokenVerifierFactory.deploy(taskArguments.root)
    );
    await accessTokenVerifier.deployed();
    console.log("AccessTokenVerifier deployed to: ", accessTokenVerifier.address);

    console.log("Verifying contract...");

    await run("verify:verify", {
      address: accessTokenVerifier.address,
      constructorArguments: [taskArguments.root],
    });
  });

task("hd:deploy:AccessTokenVerifier")
  .addParam("root", "Root key")
  .setAction(async function (taskArguments: TaskArguments, { ethers, network, run }) {
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
        console.log("accessTokenVerifier", accessTokenVerifier);
      } else {
        accessTokenVerifier = <AccessTokenVerifier>(
          await accessTokenVerifierFactory.connect(ledger).deploy(taskArguments.root)
        );
      }

      console.log("accessTokenVerifier", accessTokenVerifier);
      await accessTokenVerifier.deployed();
      console.log("AccessTokenVerifier deployed to: ", accessTokenVerifier.address);

      console.log("Verifying contract...");

      await run("verify:verify", {
        address: accessTokenVerifier.address,
        constructorArguments: [taskArguments.root],
      });
    } catch (error) {
      console.log(error);
    }
  });
