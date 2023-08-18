import { task } from "hardhat/config";
import { TaskArguments } from "hardhat/types";

import { AccessTokenVerifier } from "../../src/types/AccessTokenVerifier";
import { AccessTokenVerifier__factory } from "../../src/types/factories/AccessTokenVerifier__factory";

// Before running this task, make sure that you have specified the right Etherscan API key in .env.
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

// Before running this task, make sure that you have specified the right Etherscan API key in .env.
task("hd:deploy:AccessTokenVerifier")
  .addParam("root", "Root key")
  .addOptionalParam("gasPrice", "Gas price to use, in gwei")
  .setAction(async function (taskArguments: TaskArguments, { ethers, network, run }) {
    const gasPrice = taskArguments.gasPrice || "2";
    const DEFAULT_GAS_PRICE = ethers.utils.parseUnits(gasPrice, "gwei");
    const POLYGON_GAS_PRICE = ethers.utils.parseUnits("35", "gwei");

    const signer = ethers.provider.getSigner();
    const signerAddress = await signer.getAddress();
    console.log(`Deploying AccessTokenVerifier with signer ${signerAddress}.`);

    const accessTokenVerifierFactory: AccessTokenVerifier__factory = <AccessTokenVerifier__factory>(
      await ethers.getContractFactory("AccessTokenVerifier")
    );

    try {
      console.log("Deploying...");

      let accessTokenVerifier: AccessTokenVerifier;
      if (network.name === "polygon") {
        accessTokenVerifier = <AccessTokenVerifier>(
          await accessTokenVerifierFactory.connect(signer).deploy(taskArguments.root, { gasPrice: POLYGON_GAS_PRICE })
        );
        console.log("accessTokenVerifier", accessTokenVerifier);
      } else {
        accessTokenVerifier = <AccessTokenVerifier>(
          await accessTokenVerifierFactory.connect(signer).deploy(taskArguments.root, { gasPrice: DEFAULT_GAS_PRICE })
        );
      }

      await accessTokenVerifier.deployTransaction.wait(5);
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
