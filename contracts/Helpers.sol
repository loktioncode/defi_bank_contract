// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
// Import this file to use console.log
import "hardhat/console.sol";
import "./Save.sol";

contract Main is Save {
    uint LoanInterestFee;
    mapping(address => bool) _approvedForLoan;
    mapping(address => uint256) _loanAmountAppliedFor;
    mapping(address => uint256) _debtors;


    //calculate the interest on the loan amount
    function calculateIntrest(uint amount, address account)
        public
        view
        returns (uint256)
    {
        require(
            block.timestamp >= _savingsPeriod[account],
            "You do not qualify for loan"
        );
        uint interest = amount * LoanInterestFee;
        return interest;
    }

    function calculateEligibleAmount(address account)
        internal
        view
        returns (uint256)
    {
        require(
            block.timestamp >= _savingsPeriod[account],
            "You do not qualify for loan"
        );

        return _savings[account] - (_savings[account] * LoanInterestFee);
    }

    function setLoanInterestFee(uint interest)
        public
        onlyOwner
        onlyWhenNotPaused
    {
        LoanInterestFee = interest / 100;
    }

    function applyForLoan(uint256 amount) public payable onlyWhenNotPaused {
        require(msg.value == withdrawalFee);
        require(_savings[msg.sender] > amount, "You do not qualify for loan");
        _loanAmountAppliedFor[msg.sender] = amount;
        _approvedForLoan[msg.sender] = false;
    }

    function approveLoan(address account) public onlyOwner onlyWhenNotPaused {
        require(
            _approvedForLoan[account] == false,
            "You have already approved for loan"
        );
        uint256 amount = calculateEligibleAmount(account);
        _approvedForLoan[account] = true;
        setSavingsPeriod(block.timestamp + 30 * 24 * 60 * 60);
        _balances[account] += amount;
        _debtors[account] += amount;
    }

    function payLoan(address account) public onlyWhenNotPaused {
        require(
            _approvedForLoan[account] == true,
            "You have not been approved for loan"
        );
        require(
            _debtors[account] > 0,
            "You have not yet paid off your loan"
        );
        uint256 interest = calculateIntrest(_debtors[account], account);
        _balances[account] -= (_debtors[account] + interest);
        _debtors[account] = 0;
    }

    //force payback
     function badDebtorLoanPayBack(address account) public onlyOwner onlyWhenNotPaused {
        uint savingsPeriod = getSavingsLockUpPeriod(account);

        require(
            savingsPeriod == (block.timestamp + 2 * 24 * 60 * 60),
            "only 2 days left to pay back"
        );
        uint256 interest = calculateIntrest(_debtors[account], account);

        _balances[account] -= (_debtors[account] + interest);

        _debtors[account] = 0;
    }
}
