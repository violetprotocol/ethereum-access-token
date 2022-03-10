import { task } from "hardhat/config";
import { TaskArguments } from "hardhat/types";

import { Auth } from "../../src/types/Auth";
import { Auth__factory } from "../../src/types/factories/Auth__factory";

task("deploy:Auth")
  .addParam("root", "Root key")
  .setAction(async function (taskArguments: TaskArguments, { ethers }) {
    const authFactory: Auth__factory = <Auth__factory>await ethers.getContractFactory("Auth");
    const auth: Auth = <Auth>await authFactory.deploy(taskArguments.root);
    await auth.deployed();
    console.log("Auth deployed to: ", auth.address);
  });
