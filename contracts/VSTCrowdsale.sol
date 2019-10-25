pragma solidity ^0.5.0;

import "@openzeppelin/contracts/crowdsale/Crowdsale.sol";
import "@openzeppelin/contracts/crowdsale/emission/MintedCrowdsale.sol";
import "./Store.sol";

contract VSTCrowdsale is Crowdsale, MintedCrowdsale {
        Store internal StoreContract;
          // User transactions counter
        uint256 public userCounter;

        // Token ammount purchased
        uint256 public tokensPurchased;

        string public concString;

    constructor (uint256 _rate, address payable _wallet, IERC20 _token, address payable storeAddress)
    Crowdsale(_rate, _wallet, _token)

    public {
        StoreContract = Store(storeAddress);
    }
        /* When the user i (Crowdsale will increment this value each time when someone buy VST)
        will buy n VST tokens, the Crowdsale contract will sell the product Stock + i with the price n VST
        (e.g.: Stock23 will cost 20 VST)
        **/

    // overriding Crowdsale token issue rate
    function _getTokenAmount(uint256 weiAmount) internal view returns (uint256) {
        return weiAmount.div(_rate);
    }

    function _updatePurchasingState(address beneficiary, uint256 weiAmount) internal {
        userCounter++;
        tokensPurchased = weiAmount.div(_rate);
        // invoke Store.sell method with _name, _price;
        // where string _name = 'userCounter' + 'tokensPurchased'
        string memory userCounterString = uint2str(userCounter);
        concString = appendValues('Stock', userCounterString);
        sellProductOnTokenPurchase(concString, tokensPurchased);
    }
    // concatinate 2 strings
    function appendValues(string memory _str1, string memory _str2) internal pure returns (string memory) {
        return string(abi.encodePacked(_str1, _str2));
    }

    function sellProductOnTokenPurchase(string memory _name, uint256 _price) internal {
        StoreContract.sellProduct(_name, _price);
    }
    // helper function transform uint to sting for concatination
    function uint2str(uint _i) internal pure returns (string memory _uintAsString) {
        if (_i == 0) {
            return "0";
        }
        uint j = _i;
        uint len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint k = len - 1;
        while (_i != 0) {
            bstr[k--] = byte(uint8(48 + _i % 10));
            _i /= 10;
        }
        return string(bstr);
    }
}
