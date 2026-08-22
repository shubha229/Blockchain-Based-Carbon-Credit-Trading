import { network } from "hardhat";

const { ethers } = await network.create();

console.log("Deploying CarbonCreditTrading...");

const carbonCreditTrading = await ethers.deployContract(
  "CarbonCreditTrading"
);

await carbonCreditTrading.waitForDeployment();

const address = await carbonCreditTrading.getAddress();

console.log("====================================");
console.log("CarbonCreditTrading deployed to:");
console.log(address);
console.log("====================================");