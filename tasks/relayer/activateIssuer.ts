import { task } from "hardhat/config";
import { TaskArguments } from "hardhat/types";
import { DefenderRelaySigner, DefenderRelayProvider } from "@openzeppelin/defender-relay-client/lib/ethers";
import { AccessTokenVerifier } from "../../src/types";

task("relay:activateIssuers", "Uses OZ Relayer to activate issuers")
  .addParam("verifiercontract", "Address of the verifier contract")
  .addParam("newissuer", "Address of the issuer to add")
  .setAction(async (taskArguments: TaskArguments, hre) => {
    if (!process.env.OZ_RELAY_API_KEY || !process.env.OZ_RELAY_API_SECRET)
      throw new Error("Please set OZ_RELAY_API_KEY and OZ_RELAY_API_KEY env vars");

    const credentials = { apiKey: process.env.OZ_RELAY_API_KEY, apiSecret: process.env.OZ_RELAY_API_SECRET };
    const provider = new DefenderRelayProvider(credentials);
    const signer = new DefenderRelaySigner(credentials, provider, { speed: "fast" });

    const accessTokenVerifier = <AccessTokenVerifier>(
      await hre.ethers.getContractAt("AccessTokenVerifier", taskArguments.verifiercontract, signer)
    );
    const tx = await accessTokenVerifier.activateIssuers([taskArguments.newissuer]);
    const mined = await tx.wait();
    console.log("Transaction has been mined.");
    console.log(`Activated issuer ${taskArguments.newissuer}`);
    console.log("Transaction hash", mined.transactionHash);
  });
