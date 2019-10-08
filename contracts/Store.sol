pragma solidity ^0.5.0;

import './VSTToken.sol';

/**
Write a Store contract with following methods:
 sell(_productName, _price) and buy(_productName).
 Invoking of sell method will record in smart contract the price of the product at which you can buy this product.
 Invoking the buy method will remove the product from smart contract and will transfer the corresponding amount of VST tokens from buyer to seller.
 */
contract Store is VSTToken(1000 ether, "VirtStore","VST",18) {
    mapping(string => Product) public products;
    string[] public productIndex;
    struct Product {
        string name;
        uint price;
        address payable owner;
        bool purchased;
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

    function purchaseProduct(string memory _name) public payable {
        // Fetch the product
        Product memory _product = products[_name];
        // Fetch the owner
        address payable _seller = _product.owner;
        // Require that the buyer is not the seller
        require(_seller != msg.sender, "Cant buy your own product");
        address payable _buyer = msg.sender;
        uint balance = balanceOf(_buyer);
        require(balance >= _product.price, "Not enough funds");
        transfer(_seller, _product.price);
        // Trigger an event
        emit ProductPurchased(_product.name, _product.price, msg.sender, true);
        // Delete the product => set its values to 0
        delete products[_name];
        // remove _name from an array
    }

    function productCount() public view returns (uint count) {
        count = productIndex.length;
    }
}