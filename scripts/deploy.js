const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const TokenFaucet = await hre.ethers.getContractFactory("TokenFaucet");
  const tokenFaucet = await TokenFaucet.deploy(
    "TokenFaucet", // _name
    "TF", // _symbol
    1000000, // _initialSupply
    1000, // _requestLimit
    60 // _requestCooldown
  );

  await tokenFaucet.deployed();

  console.log("TokenFaucet contract address:", tokenFaucet.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
