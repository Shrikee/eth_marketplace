pragma solidity ^0.5.0;

import './VSTToken.sol';
import '@openzeppelin/contracts/math/SafeMath.sol';

contract Store {
    using SafeMath for uint;
    // No need to store both tokenAddress and Token in Store contract
    VSTToken Token;
    constructor(address _tokenAddress) public {
        require(_tokenAddress != address(0x0), "zero address");
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
        uint256 price;
        address payable owner;
        bool purchased;
    }

    struct Deal {
        string name;
        uint256 price;
        address payable seller;
        address payable buyer;
        bool isDone;
    }

    event ProductCreated(
        string name,
        uint256 price,
        address payable owner,
        bool purchased
    );

    event ProductPurchased(
        string name,
        uint256 price,
        address payable owner,
        bool purchased
    );

    event DealCreated(
        string name,
        uint256 price,
        address seller,
        address buyer
    );

    // fallback function
    function () external payable {
    }

    function checkBalance(address _address) public view returns (uint256 _balance) {
        return Token.balanceOf(_address);
    }
    //Takes name and price as arguments
    //will throw if: name or price is not passed
    //Adds product to products mapping, key is the product name
    //Stores name in keys array
    //Triggers ProductCreated event
    function sellProduct(string memory  _name, uint256 _price) public {
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
        uint256 _price,
        uint256 _time
    )
        public
        returns (bool)
    {
        require(bytes(_name).length > 0, "Invalid name");
        require(_price > 0, "Invalid price");

        uint256 startBlock = block.number;
        uint256 auctionDuration = _time;
        // @TODO check gas limit when doing complex calc
        // to seconds
        auctionDuration = auctionDuration.mul(60);
        // avg block time is 14 seconds
        // number of block will be created during _time
        uint256 auctDurationInBlocks = auctionDuration.div(14);
        uint256 endBlock = startBlock.add(auctDurationInBlocks);
        // factory function that creates auction for the product
        auctionFactory(startBlock, endBlock, _name, _price, msg.sender, contractAddress, tokenAddress);
    }
    //Takes product name arg
    //Will throw if sellerr buys his own product
    //Emits Deal event that indicates that sender wants to buy
    function purchaseProduct(string memory _name) public payable returns (bool) {
        // Fetch the product
        Product memory _product = products[_name];
        // Fetch the owner
        address payable _seller = _product.owner;
        address payable _buyer = msg.sender;
        // Require that the buyer is not the seller
        require(_seller != _buyer, "Cant buy your own product");
        // Check buyer token balance
        uint256 buyerBalance = checkBalance(_buyer);
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
// When seller confirms he sold a product this method called with msg.sender arg
// Will throw if callee is not a seller
    function clearDeal(address payable _seller) public {
        address payable seller = deals[_seller].seller;
        require(_seller == seller, "Sender is not a seller");
        delete deals[_seller];
    }

    function auctionFactory(
        uint256 _startBlock,
        uint256 _endBlock,
        string memory _name,
        uint256 _price,
        address _beneficiary,
        address _owner,
        address _token
    )
        internal
    {
        // creates auction contract and adds its address to an array
        address NewAuction = address(new ProductAutcion(_startBlock, _endBlock, _name, _price, _beneficiary, _owner, _token));
        auctionsMapping[_name] = NewAuction;
        auctions.push(NewAuction);
    }
}

contract ProductAutcion {
    using SafeMath for uint256;

    VSTToken Token;
    address public productAuction;
    // Auction state
    uint256 public startBlock;
    uint256 public endBlock;
    string  public name;
    uint256 public price;
    address public highestBidder;
    uint256 public highestBid;
    address owner;
    address public beneficiary;
    address store;
    // bidders funds
    mapping(address => uint256) public pendingReturns;

    constructor(
        uint256 _startBlock,
        uint256 _endBlock,
        string memory _name,
        uint256 _price,
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
    // user can Bid on auction
    // takes tokens amount as a bid
    // will throw if sender is auction owner, has not enough balance,
    // bid is less then highest bid, bid is less then start bid
    // stores bid by address value inside a mapping
    // can be invoked only when auction is active
    function placeBid(uint256 tokenAmount) public onlyBeforeEnd {
        // check balance
        require(Token.balanceOf(msg.sender) >= price, 'Not enough funds');
        // check highest bid, if less => revert
        require(tokenAmount > highestBid, 'Bid is less then highest bid');
        // bid should be > then price
        require(tokenAmount > price, "Bid should be bigger then initial price");
        // seller can't bid
        require(msg.sender != beneficiary, 'Cant bid on own product');

        Token.transferFrom(msg.sender, productAuction, tokenAmount);
        highestBid = tokenAmount;
        highestBidder = msg.sender;
        pendingReturns[msg.sender] += tokenAmount;

    }
    //Allows bidders to withdraw their bids
    //throw if address balance is 0
    //can be invoked only when auction is finished
    //Highest bidder can withdraw previous bids (excluding winner bid)
    function claimTokens() public onlyAfterAuction {
        uint256 balance = pendingReturns[msg.sender];
        require(balance > 0, "Nothing to transfer");
        pendingReturns[msg.sender] = 0;
        if (msg.sender == highestBidder) {
            if(balance.sub(highestBid) > 0) {
                Token.transfer(msg.sender, balance.sub(highestBid));
            }

        }
        else {
            Token.transfer(msg.sender, balance);
        }
    }
    //Seller withdraw
    //will throw if not the seller
    //Can be invoked only after auction
    //5% commission will be transfered to Store contract
    function beneficiaryWithdraw() public onlyAfterAuction {
        require(msg.sender == beneficiary, "Only seller can claim tokens");
        // calc 5% commission
        uint256 commission = highestBid.mul(5);
        commission = commission.div(100);
        // send to seller
        Token.transfer(msg.sender, highestBid.sub(commission));
        // send 5% to store
        Token.transfer(owner, commission);
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