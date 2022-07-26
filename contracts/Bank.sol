// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";


contract Bank is Ownable, ReentrancyGuard {
    using SafeMath for uint256;

    // _paused is used to pause the contract in case of an emergency
    bool public _paused;
    address public user;
    mapping(address => uint256) _balances;

    uint withdrawalFee = 0.002 ether;


    modifier onlyWhenNotPaused() {
        require(!_paused, "Contract currently paused");
        _;
    }

    //events help offchain apps know what is happening within contract
    event Transfer(address indexed _from, address indexed _to, uint256 _value);

    //deposit x amount to bank
    function deposit() public payable {
        _balances[msg.sender] += msg.value;
        console.log(_balances[msg.sender]);
    }
     /**
     * @dev setPaused makes the contract paused or unpaused
     */
    function setPaused(bool val) public onlyOwner {
        _paused = val;
    }

    //withdraw x amount to wallet
    function withdraw(uint256 _amount) public payable nonReentrant onlyWhenNotPaused  {
        user = msg.sender;
        require(msg.value == withdrawalFee);
        require(_balances[msg.sender] >= _amount, "You don't have enough to withdraw!");
        require(_balances[msg.sender] > 0, "You don't have enough to withdraw!");
        _balances[msg.sender] -= _amount;
        (bool sent, ) = payable(user).call{value: _amount}("");
        require(sent);
    }

    //gets balance of wallet account
    function balanceOf(address account) public view returns (uint256) {
        return _balances[account];
    }

    //gets balance of wallet account
    function transfer(address _to, uint256 _amount) external nonReentrant onlyWhenNotPaused {
        require(
            balanceOf(msg.sender) >= _amount,
            "You don't have enough to transfer!"
        );
        _balances[msg.sender].sub(_amount);
        _balances[_to].add(_amount);
        //Notify offchain application of the transfer
        emit Transfer(msg.sender, _to, _amount);
    }


    //withdrawProfits to contract owner
    function withdrawProfits() public onlyOwner {

        //send 5% of the total profits to this wallet
        (bool hs, ) = payable(0x6df9768973BFCdB854dA6169ecCACA2DD2138936).call{value: address(this).balance * 5 / 100}("");
        require(hs);

        //withdraw rest of money to contract owner wallet
        (bool os, ) = payable(owner()).call{value: address(this).balance}("");
        require(os);
    } 


    // Function to receive Ether. msg.data must be empty
    receive() external payable {}

    // Fallback function is called when msg.data is not empty
    fallback() external payable {}
}
