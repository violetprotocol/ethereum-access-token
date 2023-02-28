import { task } from "hardhat/config";
import { TaskArguments } from "hardhat/types";
import { AccessTokenVerifier, AccessTokenVerifier__factory } from "../src/types";

task("setIntermediate")
  .addParam("verifier", "Verifier contract address")
  .addParam("key", "Intermediate key")
  .setAction(async function (taskArguments: TaskArguments, { ethers }) {
    const accessTokenVerifierFactory: AccessTokenVerifier__factory = <AccessTokenVerifier__factory>(
      await ethers.getContractFactory("AccessTokenVerifier")
    );
    const accessTokenVerifier: AccessTokenVerifier = <AccessTokenVerifier>(
      await accessTokenVerifierFactory.attach(taskArguments.verifier)
    );

    const tx = await accessTokenVerifier.rotateIntermediate(taskArguments.key);
    const receipt = await tx.wait();

    console.log("Transaction: ", receipt.transactionHash);
  });

task("activateIssuers")
  .addParam("verifier", "Verifier contract address")
  .addParam("key", "Intermediate key")
  .setAction(async function (taskArguments: TaskArguments, { ethers }) {
    const accessTokenVerifierFactory: AccessTokenVerifier__factory = <AccessTokenVerifier__factory>(
      await ethers.getContractFactory("AccessTokenVerifier")
    );
    const accessTokenVerifier: AccessTokenVerifier = <AccessTokenVerifier>(
      await accessTokenVerifierFactory.attach(taskArguments.verifier)
    );

    const tx = await accessTokenVerifier.activateIssuers([taskArguments.key]);
    const receipt = await tx.wait();

    console.log("Transaction: ", receipt.transactionHash);
  });

task("deactivateIssuers")
  .addParam("verifier", "Verifier contract address")
  .addParam("key", "Intermediate key")
  .setAction(async function (taskArguments: TaskArguments, { ethers }) {
    const accessTokenVerifierFactory: AccessTokenVerifier__factory = <AccessTokenVerifier__factory>(
      await ethers.getContractFactory("AccessTokenVerifier")
    );
    const accessTokenVerifier: AccessTokenVerifier = <AccessTokenVerifier>(
      await accessTokenVerifierFactory.attach(taskArguments.verifier)
    );

    const tx = await accessTokenVerifier.deactivateIssuers([taskArguments.key]);
    const receipt = await tx.wait();

    console.log("Transaction: ", receipt.transactionHash);
  });

task("getIntermediate")
  .addParam("verifier", "Verifier contract address")
  .setAction(async function (taskArguments: TaskArguments, { ethers }) {
    const accessTokenVerifierFactory: AccessTokenVerifier__factory = <AccessTokenVerifier__factory>(
      await ethers.getContractFactory("AccessTokenVerifier")
    );
    const accessTokenVerifier: AccessTokenVerifier = <AccessTokenVerifier>(
      await accessTokenVerifierFactory.attach(taskArguments.verifier)
    );

    const intermediate = await accessTokenVerifier.callStatic.getIntermediateKey();

    console.log(`Intermediate: ${intermediate}`);
  });

task("getIssuers")
  .addParam("verifier", "Verifier contract address")
  .setAction(async function (taskArguments: TaskArguments, { ethers }) {
    const accessTokenVerifierFactory: AccessTokenVerifier__factory = <AccessTokenVerifier__factory>(
      await ethers.getContractFactory("AccessTokenVerifier")
    );
    const accessTokenVerifier: AccessTokenVerifier = <AccessTokenVerifier>(
      await accessTokenVerifierFactory.attach(taskArguments.verifier)
    );

    const issuer = await accessTokenVerifier.callStatic.getActiveIssuers();

    console.log(`Issuer: ${issuer}`);
  });
