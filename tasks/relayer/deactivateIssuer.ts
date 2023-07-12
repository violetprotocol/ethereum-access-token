import { task } from "hardhat/config";
import { TaskArguments } from "hardhat/types";
import { DefenderRelaySigner, DefenderRelayProvider } from "@openzeppelin/defender-relay-client/lib/ethers";
import { AccessTokenVerifier } from "../../src/types";

task("relay:deactivateIssuers", "Uses OZ Relayer to deactivate issuers")
  .addParam("verifiercontract", "Address of the verifier contract")
  .addParam("oldissuer", "Address of the issuer to remove")
  .setAction(async (taskArguments: TaskArguments, hre) => {
    if (!process.env.OZ_RELAY_API_KEY || !process.env.OZ_RELAY_API_SECRET)
      throw new Error("Please set OZ_RELAY_API_KEY and OZ_RELAY_API_KEY env vars");

    const credentials = { apiKey: process.env.OZ_RELAY_API_KEY, apiSecret: process.env.OZ_RELAY_API_SECRET };
    const provider = new DefenderRelayProvider(credentials);
    const signer = new DefenderRelaySigner(credentials, provider, { speed: "fast" });

    const accessTokenVerifier = <AccessTokenVerifier>(
      await hre.ethers.getContractAt("AccessTokenVerifier", taskArguments.verifiercontract, signer)
    );
    const checksummedIssuer = hre.ethers.utils.getAddress(taskArguments.oldissuer);
    const tx = await accessTokenVerifier.deactivateIssuers([checksummedIssuer]);
    const mined = await tx.wait();
    console.log("Transaction has been mined.");
    console.log(`Deactivated issuer ${checksummedIssuer}`);
    console.log("Transaction hash", mined.transactionHash);
  });
