import { task } from "hardhat/config";
import { TaskArguments } from "hardhat/types";

import { DummyDapp } from "../../src/types/DummyDapp";
import { DummyDapp__factory } from "../../src/types/factories/DummyDapp__factory";

task("deploy:DummyDapp")
  .addParam("verifier", "Address of the verifier contract")
  .setAction(async function (taskArguments: TaskArguments, { ethers }) {
    const dummyFactory: DummyDapp__factory = <DummyDapp__factory>await ethers.getContractFactory("DummyDapp");
    const dummyDapp: DummyDapp = <DummyDapp>await dummyFactory.deploy(taskArguments.verifier);
    await dummyDapp.deployed();
    console.log("DummyDapp deployed to: ", dummyDapp.address);
  });
