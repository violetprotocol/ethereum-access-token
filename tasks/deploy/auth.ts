import { task } from "hardhat/config";
import { TaskArguments } from "hardhat/types";

import { AccessTokenVerifier } from "../../src/types/AccessTokenVerifier";
import { AccessTokenVerifier__factory } from "../../src/types/factories/AccessTokenVerifier__factory";

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
