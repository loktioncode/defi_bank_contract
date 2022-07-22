const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

describe("Save", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshopt in every test.
  async function deployOneYearLockFixture() {
    const THIRTY_DAYS_IN_SECS = 30 * 24 * 60 * 60;

    const unlockTime = (await time.latest()) + THIRTY_DAYS_IN_SECS;

    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const Save = await ethers.getContractFactory("Save");
    const savings = await Save.deploy();

    return { savings, owner, otherAccount, unlockTime };
  }

 
    describe("Save funds", function () {
      it("Should save funds from bank account", async function () {
        const { savings, owner, unlockTime } = await loadFixture(deployOneYearLockFixture);

        await savings.deposit({ from: owner.address, value: 5 });
        await savings.setSavingsPeriod(unlockTime);
        await expect(savings.transferToSavings(2)).to.be.fulfilled;
      });
    });

  describe("Withdrawals", function () {
    // describe("Validations", function () {
    //   it("Should revert with the right error if called too soon", async function () {
    //     const { savings, owner, unlockTime } = await loadFixture(deployOneYearLockFixture);

    //     await savings.deposit({ from: owner.address, value: 5 });
    //     await savings.setSavingsPeriod(unlockTime);
    //     await savings.transferToSavings(2);


    //     await expect(save.withdrawFromSavings()).to.be.revertedWith(
    //       "You can't withdraw yet"
    //     );
    //   });

      // it("Should revert with the right error if called from another account", async function () {
      //   const { lock, unlockTime, otherAccount } = await loadFixture(
      //     deployOneYearLockFixture
      //   );

      //   // We can increase the time in Hardhat Network
      //   await time.increaseTo(unlockTime);

      //   // We use lock.connect() to send a transaction from another account
      //   await expect(lock.connect(otherAccount).withdraw()).to.be.revertedWith(
      //     "You aren't the owner"
      //   );
      // });

      // it("Shouldn't fail if the unlockTime has arrived and the owner calls it", async function () {
      //   const { lock, unlockTime } = await loadFixture(
      //     deployOneYearLockFixture
      //   );

      //   // Transactions are sent using the first signer by default
      //   await time.increaseTo(unlockTime);

      //   await expect(lock.withdraw()).not.to.be.reverted;
      // });
    // });

    // describe("Events", function () {
    //   it("Should emit an event on withdrawals", async function () {
    //     const { lock, unlockTime, lockedAmount } = await loadFixture(
    //       deployOneYearLockFixture
    //     );

    //     await time.increaseTo(unlockTime);

    //     await expect(lock.withdraw())
    //       .to.emit(lock, "Withdrawal")
    //       .withArgs(lockedAmount, anyValue); // We accept any value as `when` arg
    //   });
    // });

    // describe("Transfers", function () {
    //   it("Should transfer the funds to the owner", async function () {
    //     const { lock, unlockTime, lockedAmount, owner } = await loadFixture(
    //       deployOneYearLockFixture
    //     );

    //     await time.increaseTo(unlockTime);

    //     await expect(lock.withdraw()).to.changeEtherBalances(
    //       [owner, lock],
    //       [lockedAmount, -lockedAmount]
    //     );
    //   });
    // });
  });
});
