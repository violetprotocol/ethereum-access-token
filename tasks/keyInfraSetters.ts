import { ContractTransaction } from "ethers";
import { task } from "hardhat/config";
import { TaskArguments } from "hardhat/types";
import { AccessTokenVerifier } from "../src/types";

task("rotate:IntermediateKey")
  .addParam("verifiercontract", "Address of the Access Token Verifier Contract")
  .addParam("newintermediate", "Address of the new intermediate key")
  .setAction(async function (taskArguments: TaskArguments, { ethers }) {
    const newIntermediateKey = taskArguments.newintermediate;
    if (
      !newIntermediateKey ||
      newIntermediateKey === ethers.constants.AddressZero ||
      !ethers.utils.isAddress(newIntermediateKey)
    ) {
      throw new Error("Invalid new intermediate key");
    }

    const accessTokenVerifier = <AccessTokenVerifier>(
      await ethers.getContractAt("AccessTokenVerifier", taskArguments.verifiercontract)
    );

    let tx: ContractTransaction | null = null;
    try {
      tx = await accessTokenVerifier.rotateIntermediate(taskArguments.newintermediate);
      const receipt = await tx.wait();

      if (receipt?.status === 1) {
        console.log("Updated intermediate key to: ", newIntermediateKey);
        console.log("TX hash", tx.hash);
      } else {
        throw new Error(`Transaction reverted. Tx hash: ${tx?.hash}`);
      }
    } catch (error) {
      if (tx?.hash) {
        console.error(`Error while rotating the intermediate key. Transaction hash: ${tx.hash}`);
      }
      throw error;
    }
  });

task("hd:rotate:IntermediateKey")
  .addParam("verifiercontract", "Address of the Access Token Verifier Contract")
  .addParam("newintermediate", "Address of the new intermediate key")
  .setAction(async function (taskArguments: TaskArguments, { ethers }) {
    const newIntermediateKey = taskArguments.newintermediate;
    if (
      !newIntermediateKey ||
      newIntermediateKey === ethers.constants.AddressZero ||
      !ethers.utils.isAddress(newIntermediateKey)
    ) {
      throw new Error("Invalid new intermediate key");
    }

    const signer = ethers.provider.getSigner();
    const signerAddress = await signer.getAddress();
    console.log(`Rotating intermediateKey with signer ${signerAddress}.`);

    const accessTokenVerifier = <AccessTokenVerifier>(
      await ethers.getContractAt("AccessTokenVerifier", taskArguments.verifiercontract)
    );

    let tx: ContractTransaction | null = null;
    try {
      tx = await accessTokenVerifier.connect(signer).rotateIntermediate(taskArguments.newintermediate);
      const receipt = await tx.wait();

      if (receipt?.status === 1) {
        console.log("Updated intermediate key to: ", newIntermediateKey);
        console.log("TX hash", tx.hash);
      } else {
        throw new Error(`Transaction reverted. Tx hash: ${tx?.hash}`);
      }
    } catch (error) {
      if (tx?.hash) {
        console.error(`Error while rotating the intermediate key. Transaction hash: ${tx.hash}`);
      }
      throw error;
    }
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

    let tx: ContractTransaction | null = null;
    try {
      tx = await accessTokenVerifier.activateIssuers([taskArguments.newissuer]);

      const receipt = await tx.wait();

      if (receipt?.status === 1) {
        console.log("Updated issuer key to: ", newIssuerKey);
        console.log("TX hash", tx.hash);
      } else {
        throw new Error(`Transaction reverted. Tx hash: ${tx?.hash}`);
      }
    } catch (error) {
      if (tx?.hash) {
        console.error(`Error while rotating the intermediate key. Transaction hash: ${tx.hash}`);
      }
      throw error;
    }
  });
