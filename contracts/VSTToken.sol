pragma solidity ^0.5.0;

import "../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol";

contract VSTToken is ERC20, ERC20Detailed {
    constructor(uint256 initialSupply, string memory _name, string memory _symbol, uint8 _decimals)
    ERC20Detailed(_name, _symbol, _decimals) public {
        _mint(msg.sender, initialSupply);
    }
}