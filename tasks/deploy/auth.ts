import { task } from "hardhat/config";
import { TaskArguments } from "hardhat/types";
import { LedgerSigner } from "@anders-t/ethers-ledger";

import { AccessTokenVerifier } from "../../src/types/AccessTokenVerifier";
import { AccessTokenVerifier__factory } from "../../src/types/factories/AccessTokenVerifier__factory";
import { calcGas } from "../utils";

task("deploy:AccessTokenVerifier")
  .addParam("root", "Root key")
  .setAction(async function (taskArguments: TaskArguments, { ethers }) {
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
  .setAction(async function (taskArguments: TaskArguments, { ethers }) {
    const ledger = new LedgerSigner(ethers.provider);

    const accessTokenVerifierFactory: AccessTokenVerifier__factory = <AccessTokenVerifier__factory>(
      await ethers.getContractFactory("AccessTokenVerifier")
    );

    // Gas estimation and gas fees settings
    const estimatedGas = await ethers.provider.estimateGas(
      accessTokenVerifierFactory.getDeployTransaction(taskArguments.root),
    );
    console.log("estimatedGas", estimatedGas);
    const gasParams = await calcGas(estimatedGas);
    console.log("gasParams", gasParams);

    try {
      console.log("Deploying...");
      const accessTokenVerifier: AccessTokenVerifier = <AccessTokenVerifier>(
        await accessTokenVerifierFactory.connect(ledger).deploy(taskArguments.root, { ...gasParams })
      );
      console.log("accessTokenVerifier", accessTokenVerifier);
      await accessTokenVerifier.deployed();
      console.log("AccessTokenVerifier deployed to: ", accessTokenVerifier.address);
    } catch (error) {
      console.log(error);
    }
  });
