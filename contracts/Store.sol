pragma solidity ^0.5.0;

import './VSTToken.sol';

/**
Write a Store contract with following methods:
 sell(_productName, _price) and buy(_productName).
 Invoking of sell method will record in smart contract the price of the product at which you can buy this product.
 Invoking the buy method will remove the product from smart contract and will transfer the corresponding amount of VST tokens from buyer to seller.
 */
contract Store {
    VSTToken internal Token;
    constructor(address tokenAddress) public {
        Token = VSTToken(tokenAddress);
        contractAddress = address(this);
    }
    address public contractAddress;
    mapping(string => Product) public products;
    mapping(address => Deal ) public deals;
    string[] public productIndex;

    struct Product {
        string name;
        uint price;
        address payable owner;
        bool purchased;
    }

    struct Deal {
        string name;
        uint price;
        address payable seller;
        address payable buyer;
        bool isDone;
    }

    event ProductCreated(
        string name,
        uint price,
        address payable owner,
        bool purchased
    );

    event ProductPurchased(
        string name,
        uint price,
        address payable owner,
        bool purchased
    );

    event DealCreated(
        string name,
        uint price,
        address seller,
        address buyer
    );

    function checkBalance(address _address) public view returns (uint _balance) {
        return Token.balanceOf(_address);
    }

    function sellProduct(string memory _name, uint _price) public {
        // Require a valid name
        require(bytes(_name).length > 0, "Invalid name");
        // Require a valid price
        require(_price > 0, "Invalid price");
        // Increment product count
        // Create the product
        products[_name] = Product(_name, _price, msg.sender, false);
        // add index to an array
        productIndex.push(_name);
        // Trigger an event
        emit ProductCreated(_name, _price, msg.sender, false);
    }

    function purchaseProduct(string memory _name) public payable returns (bool) {
        // Fetch the product
        Product memory _product = products[_name];
        // Fetch the owner
        address payable _seller = _product.owner;
        address payable _buyer = msg.sender;
        // Require that the buyer is not the seller
        require(_seller != _buyer, "Cant buy your own product");
        // Check buyer token balance
        uint buyerBalance = checkBalance(_buyer);
        require(buyerBalance >= _product.price, "Not enough funds");
        // Trigger an event
        emit ProductPurchased(_product.name, _product.price, _buyer, true);
        // Delete the product => set its values to 0
        delete products[_name];
        // remove _name from an array
        // @dev delete productIndex[uint key]
        // add product to deals mapping
        deals[_seller] = Deal(_name, _product.price, _seller, _buyer, false);
        emit DealCreated(_name, _product.price, _seller, _buyer);
        return true;
    }

    function productCount() public view returns (uint count) {
        count = productIndex.length;
    }

    function clearDeal(address _seller) public {
        return delete deals[_seller];
    }
}