const { ethers } = require("hardhat");

const path = require("path");

async function main() {
  // This is just a convenience check
  if (network.name === "hardhat") {
    console.warn(
      "You are trying to deploy a contract to the Hardhat Network, which" +
        "gets automatically created and destroyed every time. Use the Hardhat" +
        " option '--network localhost'"
    );
  }

  // ethers is available in the global scope
  const [deployer] = await ethers.getSigners();
  console.log(
    "Deploying the contracts with the account:",
    await deployer.getAddress()
  );

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const Bank = await ethers.getContractFactory("Main");
  const bank = await Bank.deploy();
  await bank.deployed();

  console.log("Bank address:", bank.address);

  // We also save the contract's artifacts and address in the frontend directory
  saveFrontendFiles(bank);
}

function saveFrontendFiles(bank) {
  const fs = require("fs");
  const contractsDir = path.join(__dirname, "..", "ui", "contracts");

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    path.join(contractsDir, "contract-address.json"),
    JSON.stringify({ Bank: bank.address }, undefined, 2)
  );

  const BankArtifact = artifacts.readArtifactSync("Bank");

  fs.writeFileSync(
    path.join(contractsDir, "Bank.json"),
    JSON.stringify(BankArtifact, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });