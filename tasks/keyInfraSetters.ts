import { task } from "hardhat/config";
import { TaskArguments } from "hardhat/types";
import { AccessTokenVerifier } from "../src/types";

task("rotate:IntermediateKey")
  .addParam("verifiercontract", "Address of the Access Token Verifier Contract")
  .addParam("newintermediate", "Address of the new intermediate key")
  .setAction(async function (taskArguments: TaskArguments, { ethers }) {
    const newIntermediateKey = taskArguments.newintermediate;
    if (!newIntermediateKey || newIntermediateKey === ethers.constants.AddressZero) {
      throw new Error("Invalid new intermediate key");
    }

    const accessTokenVerifier = <AccessTokenVerifier>(
      await ethers.getContractAt("AccessTokenVerifier", taskArguments.verifiercontract)
    );

    const tx = await accessTokenVerifier.rotateIntermediate(taskArguments.newintermediate);

    console.log("Updated intermediate key to: ", newIntermediateKey);
    console.log("TX hash", tx.hash);
  });

task("rotate:IssuerKey")
  .addParam("verifiercontract", "Address of the Access Token Verifier Contract")
  .addParam("newissuer", "Address of the new issuer key")
  .setAction(async function (taskArguments: TaskArguments, { ethers }) {
    const newIssuerKey = taskArguments.newissuer;
    if (!newIssuerKey || newIssuerKey === ethers.constants.AddressZero) {
      throw new Error("Invalid new issuer key");
    }

    const accessTokenVerifier = <AccessTokenVerifier>(
      await ethers.getContractAt("AccessTokenVerifier", taskArguments.verifiercontract)
    );

    const tx = await accessTokenVerifier.rotateIssuer(taskArguments.newissuer);

    console.log("Updated issuer key to: ", newIssuerKey);
    console.log("TX hash", tx.hash);
  });
