// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// ERC-20 token where each ALUT is one ownership share of the ALU logo
contract ALULogoToken is ERC20, Ownable {
    uint256 public constant TOTAL_SUPPLY = 1_000_000;

    event SharesDistributed(address indexed recipient, uint256 amount);

    constructor(address logoOwner)
        ERC20("ALU Logo Token", "ALUT")
        Ownable(logoOwner)
    {
        // all shares go to the owner once; there's no mint function after this
        _mint(logoOwner, TOTAL_SUPPLY);
    }

    // 0 decimals so 1 token = 1 whole share
    function decimals() public pure override returns (uint8) {
        return 0;
    }

    function distributeShares(address recipient, uint256 amount) public onlyOwner {
        require(amount > 0, "Amount must be greater than zero");
        require(recipient != address(0), "Cannot send to the zero address");

        _transfer(msg.sender, recipient, amount);

        emit SharesDistributed(recipient, amount);
    }

    // returns a whole number, e.g. 500,000 tokens -> 50
    function ownershipPercentage(address holder) public view returns (uint256) {
        return (balanceOf(holder) * 100) / totalSupply();
    }
}
