const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { BigNumber } = require("ethers");

describe("Deposit funds into bank", function () {
  it("Should transfer the funds to the bank account", async function () {
    const [owner] = await ethers.getSigners();

    const Bank = await ethers.getContractFactory("Bank");
    const bank = await Bank.deploy();

    const ownerBalances = await bank.balanceOf(owner.address);
    await expect(bank.deposit({ from: owner.address, value: 5 })).to.be
      .fulfilled;
  });
});

describe("Withdraw funds from bank", function () {
  it("Should withdraw funds from the bank account", async function () {
    const [owner] = await ethers.getSigners();

    const Bank = await ethers.getContractFactory("Bank");
    const bank = await Bank.deploy();

    await bank.deposit({ value: 10 });
    const ownerBalances = await bank.balanceOf(owner.address);
    
    await expect(bank.withdraw(2, { value: ethers.utils.parseEther('0.002') })).to.be.fulfilled;
    // await expect(bank.balanceOf(owner.address)).to.be.equal(8);
    await console.log(ownerBalances);
  });
});

// describe("Transfer funds between accounts", function () {
//   it("Should transfer funds between users", async function () {
//     const [owner, addr1, addr2] = await ethers.getSigners();

//     const Bank = await ethers.getContractFactory("Bank");
//     const bank = await Bank.deploy();

//     await bank.deposit({from: owner.address, value: 5});

//     expect(await bank.transfer(addr1.address, 2)).to.changeEtherBalance(bank, [owner, addr1], [-2, 2]);

//   });
// });
