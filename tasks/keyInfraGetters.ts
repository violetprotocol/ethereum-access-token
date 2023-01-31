import { task } from "hardhat/config";
import { TaskArguments } from "hardhat/types";
import { AccessTokenVerifier } from "../src/types";

task("get:RootKey")
  .addParam("verifiercontract", "Address of the Access Token Verifier Contract")
  .setAction(async function (taskArguments: TaskArguments, { ethers }) {
    const accessTokenVerifier = <AccessTokenVerifier>(
      await ethers.getContractAt("AccessTokenVerifier", taskArguments.verifiercontract)
    );
    const rootKey = await accessTokenVerifier.callStatic.getRootKey();
    console.log("Root key: ", rootKey);
  });

task("get:IntermediateKey")
  .addParam("verifiercontract", "Address of the Access Token Verifier Contract")
  .setAction(async function (taskArguments: TaskArguments, { ethers }) {
    const accessTokenVerifier = <AccessTokenVerifier>(
      await ethers.getContractAt("AccessTokenVerifier", taskArguments.verifiercontract)
    );
    const intermediateKey = await accessTokenVerifier.callStatic.getIntermediateKey();
    console.log("Intermediate key: ", intermediateKey);
  });

task("get:IssuerKey")
  .addParam("verifiercontract", "Address of the Access Token Verifier Contract")
  .setAction(async function (taskArguments: TaskArguments, { ethers }) {
    const accessTokenVerifier = <AccessTokenVerifier>(
      await ethers.getContractAt("AccessTokenVerifier", taskArguments.verifiercontract)
    );
    const issuerKey = await accessTokenVerifier.callStatic.getIssuerKeys();
    console.log("Issuer key: ", issuerKey);
  });
