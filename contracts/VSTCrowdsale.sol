pragma solidity ^0.5.0;

import "@openzeppelin/contracts/crowdsale/Crowdsale.sol";
import "@openzeppelin/contracts/crowdsale/emission/MintedCrowdsale.sol";

contract VSTCrowdsale is Crowdsale, MintedCrowdsale {
    constructor (uint256 _rate, address payable _wallet, IERC20 _token)
        Crowdsale(_rate, _wallet, _token) public {

        }

        /* When the user i (Crowdsale will increment this value each time when someone buy VST)
        will buy n VST tokens, the Crowdsale contract will sell the product Stock + i with the price n VST
        (e.g.: Stock23 will cost 20 VST)
        **/
}
