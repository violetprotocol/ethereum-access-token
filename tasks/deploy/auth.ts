import { task } from "hardhat/config";
import { TaskArguments } from "hardhat/types";

import { AccessTokenVerifier } from "../../src/types/AccessTokenVerifier";
import { AccessTokenVerifier__factory } from "../../src/types/factories/AccessTokenVerifier__factory";

task("deploy:Auth")
  .addParam("root", "Root key")
  .setAction(async function (taskArguments: TaskArguments, { ethers }) {
    const authFactory: AccessTokenVerifier__factory = <AccessTokenVerifier__factory>(
      await ethers.getContractFactory("AccessTokenVerifier")
    );
    const auth: AccessTokenVerifier = <AccessTokenVerifier>await authFactory.deploy(taskArguments.root);
    await auth.deployed();
    console.log("Auth deployed to: ", auth.address);
  });
