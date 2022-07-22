// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
import "./Bank.sol";

contract Save is Bank {
  
    event Withdrawal(uint amount, uint when);
    mapping(address => uint256) _savings;
    mapping(address => uint) _savingsPeriod;


    //gets balance of savings wallet account
    function getSavingsLockUpPeriod(address account) public view returns (uint256) {
        return _savingsPeriod[account];
    }

    function setSavingsPeriod (uint unlockTime) public {
        require(block.timestamp < unlockTime, "Unlock time should be in the future");
        _savingsPeriod[msg.sender] = unlockTime;
    }

    //transfer x amount from account balance to savings
    function transferToSavings (uint256 amount) public onlyWhenNotPaused {
        require(balanceOf(msg.sender) >= amount, "You don't have enough to save");
        require(_savingsPeriod[msg.sender] < block.timestamp, "please set savings period");
        _balances[msg.sender] -= amount;
        _savings[msg.sender] += amount;
    }

    //gets balance of savings wallet account
    function savingsBalance(address account) public view returns (uint256) {
        return _savings[account];
    }

    //withdraw savings
    function withdrawFromSavings() public payable onlyWhenNotPaused {
        require(msg.value == withdrawalFee);
        require(block.timestamp >= _savingsPeriod[msg.sender], "You can't withdraw yet");
        _balances[msg.sender] += _savings[msg.sender];

        emit Withdrawal(_savings[msg.sender], block.timestamp);

    }


}
