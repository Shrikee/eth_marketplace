pragma solidity ^0.5.0;

import './VSTToken.sol';
import '@openzeppelin/contracts/math/SafeMath.sol';

contract Store {
    using SafeMath for uint;
    VSTToken Token;
    constructor(address _tokenAddress) public {
        tokenAddress = _tokenAddress;
        Token = VSTToken(tokenAddress);
        contractAddress = address(this);
    }
    address payable contractAddress;
    address tokenAddress;
    mapping(string => Product) public products;
    mapping(address => Deal ) public deals;
    string[] public productIndex;

    // related with auction
    address[] public auctions;
    mapping(string => address) public auctionsMapping;

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

    // fallback function
    function () external payable {
    }

    function checkBalance(address _address) public view returns (uint _balance) {
        return Token.balanceOf(_address);
    }
// regular sale for pt1 and pt2
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

// overloaded sale method for auction feature
    function sellProduct (
        string memory _name,
        uint _price,
        uint _time
    )
        public
        returns (bool)
    {
        require(bytes(_name).length > 0, "Invalid name");
        require(_price > 0, "Invalid price");

        uint startBlock = block.number;
        uint auctionDuration = _time;
        // @TODO check gas limit when doing complex calc
        // to seconds
        auctionDuration = auctionDuration.mul(60);
        // avg block time is 14 seconds
        // number of block will be created during _time
        uint auctDurationInBlocks = auctionDuration.div(14);
        uint endBlock = startBlock.add(auctDurationInBlocks);
        // factory function that creates auction for the product
        auctionFactory(startBlock, endBlock, _name, _price, msg.sender, contractAddress, tokenAddress);
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
    function auctionCount() public view returns (uint count) {
        count = auctions.length;
    }

    function clearDeal(address _seller) public {
        return delete deals[_seller];
    }

    function auctionFactory(
        uint _startBlock,
        uint _endBlock,
        string memory _name,
        uint _price,
        address _beneficiary,
        address _owner,
        address _token
    )
        internal
    {
        // need to create contract with these parameters
        address NewAuction = address(new ProductAutcion(_startBlock, _endBlock, _name, _price, _beneficiary, _owner, _token));
        auctionsMapping[_name] = NewAuction;
        auctions.push(NewAuction);
    }
}

contract ProductAutcion {
    using SafeMath for uint;

    VSTToken Token;
    address public productAuction;
    // Auction state
    uint public startBlock;
    uint public endBlock;
    string public name;
    uint public price;
    address public highestBidder;
    uint public highestBid;
    address owner;
    address public beneficiary;
    address store;
    // bidders funds
    mapping(address => uint) pendingReturns;

    constructor(
        uint _startBlock,
        uint _endBlock,
        string memory _name,
        uint _price,
        address _beneficiary,
        address _owner,
        address _token
    )
        public
    {
        require(_startBlock < _endBlock, "Auction start time is greater than end time");
        require(_startBlock <= block.number, "Incorrect start time");
        require(_owner != address(0), "Owner not specified");

        productAuction = address(this);
        Token = VSTToken(_token);
        startBlock = _startBlock;
        endBlock = _endBlock;
        name = _name;
        price = _price;
        beneficiary = _beneficiary;
        owner = _owner;
    }
        // store users bids
    function placeBid(uint tokenAmmount) public onlyBeforeEnd {
        // check balance
        require(Token.balanceOf(msg.sender) >= price, 'Not enough funds');
        // check highest bid, if less => revert
        require(tokenAmmount > highestBid, 'Bid is less then highest bid');
        Token.transfer(productAuction, tokenAmmount);
        highestBid = tokenAmmount;
        highestBidder = msg.sender;
        // add to bidders pool
        if (pendingReturns[msg.sender] > 0) {
            uint pastBid = pendingReturns[msg.sender];
            uint newBid = pastBid.add(tokenAmmount);
            pendingReturns[msg.sender] = newBid;
        }
        else {
            pendingReturns[msg.sender] = tokenAmmount;
        }
    }

        // withdraw funds if not the winner
    function claimTokens() public onlyAfterAuction {
        require(msg.sender != highestBidder, "Can't withdraw");
        uint balance = pendingReturns[msg.sender];
        require(balance > 0, "Nothing to transfer");
        Token.approve(msg.sender, balance);
        Token.transferFrom(productAuction, msg.sender, balance);
    }

    function beneficiaryWithdraw() public onlyAfterAuction {
        require(msg.sender == beneficiary, "Only seller can claim tokens");
        Token.approve(beneficiary, highestBid);
        // calc 5% commission
        uint commission = highestBid.mul(105);
        commission = commission.div(100);
        commission = commission.sub(highestBid);
        // send to seller
        Token.transferFrom(productAuction, beneficiary, highestBid.sub(commission));
        // send 5% to store
        Token.approve(owner, commission);
        Token.transferFrom(productAuction, owner, commission);
    }

    modifier onlyBeforeEnd {
        require(block.number < endBlock, "Auction has ended");
        _;
    }

    modifier onlyAfterAuction {
        require(block.number > endBlock, "Auction is not ended");
        _;
    }



}