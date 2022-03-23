import { task } from "hardhat/config";
import { TaskArguments } from "hardhat/types";

import { AuthVerifier } from "../../src/types/AuthVerifier";
import { AuthVerifier__factory } from "../../src/types/factories/AuthVerifier__factory";

task("deploy:Auth")
  .addParam("root", "Root key")
  .setAction(async function (taskArguments: TaskArguments, { ethers }) {
    const authFactory: AuthVerifier__factory = <AuthVerifier__factory>await ethers.getContractFactory("AuthVerifier");
    const auth: AuthVerifier = <AuthVerifier>await authFactory.deploy(taskArguments.root);
    await auth.deployed();
    console.log("Auth deployed to: ", auth.address);
  });
