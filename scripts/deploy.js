const { ethers } = require("hardhat");

async function main() {
  /*
  A ContractFactory in ethers.js is an abstraction used to deploy new smart contracts,
  so mainBankContract here is a factory for instances of our Defi Bank contract.
  */
  const mainBankContract = await ethers.getContractFactory("Main");

  const deployedMainBankContract = await mainBankContract.deploy();

  await deployedMainBankContract.deployed();

  // print the address of the deployed contract
  console.log(
    "Main Bank Contract Address:",
    deployedMainBankContract.address
  );
}

// Call the main function and catch if there is any error
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });