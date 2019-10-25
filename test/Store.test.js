const Store = artifacts.require('Store');
const VSTToken = artifacts.require('VSTToken');
const Auction = artifacts.require('ProductAutcion');
const { time } = require('@openzeppelin/test-helpers');

contract('Store', async accounts => {
    let store;
    let token;
    let auction;
    const prodName = 'Product';
    const prodPrice = 10;
    // auction related
    const auctionProductName = 'Product';
    const auctionDuration = 5;
    const auctionProductPrice = 100;

    before(async () => {
        store = await Store.deployed();
        token = await VSTToken.deployed();
        await token.addMinter(store.address);
        await token.mint(accounts[1], 1000);
        await token.mint(accounts[2], 1000);
    });

    it('could be sold', async () => {
        await store.sellProduct(prodName, prodPrice, { from: accounts[0] });
        let resProduct = await store.products(prodName);
        assert.equal(prodName, resProduct.name, 'Names are not equal');
        assert.equal(prodPrice, resProduct.price, 'Prices are not equal');
    });

    it('adds product name to index array', async () => {
        let _prodName = await store.productIndex.call(0);
        assert.equal(_prodName, prodName, 'Not added to index array');
    });

    it('returns product count', async () => {
        let counter = await store.productCount.call();
        assert(counter = 1);
    });

    it('can check user token balance', async () => {
        let userBalance = await store.checkBalance(accounts[3]);
        assert.equal(userBalance, 0, 'balance is not zero');
    });
    // need to resolve the account balance issue
    // it('can sell product', async () => {
    //     await token.transfer(accounts[1], prodPrice);
    //     let userBalance = await store.checkBalance(accounts[1]);
    //     console.log('Account[1] balance: ' + userBalance);
    //     let result = await store.purchaseProduct(prodName, { from: accounts[1] });
    //     let product = await store.products(prodName);
    //     assert.equal(product.name, '', 'Not purchased');
    // });
    // it('creates deal after product purchase', async () => {
    //     let deal = await store.deals(accounts[0]);
    //     assert.equal(deal.name, prodName, 'Deal not created')
    // });
    // it('clears a deal after approval', async () => {
    //     await store.clearDeal(accounts[0]);
    //     let deal = await store.deals(accounts[0]);
    //     assert.equal(deal.name, '', 'deal not cleared');
    // });

    // Auction feature tests
    it('store can accept ether', async () => {
        let finney = web3.utils.toWei('10', 'finney');
        let txHash = await web3.eth.sendTransaction({ from: accounts[0], to: store.address, value: finney });
        storeBalance = await web3.eth.getBalance(store.address)
        assert.equal(storeBalance, finney, 'Wrong balance')
    });
    it('creates aucton', async () => {
        await store.sellProduct(auctionProductName, auctionProductPrice, auctionDuration);
        let auctList = await store.auctions(0);
        let auctAddress = await store.auctionsMapping(auctionProductName);
        assert.equal(auctList, auctAddress, 'mapping address and array value is not equal');
        auction = await Auction.at(auctAddress);
        assert.equal(auction.address, auctAddress, 'Auction is not deployed');
    });
    it('shows the start block', async () => {
        let startBlock = await auction.startBlock();
        assert(startBlock);
    });
    it('shows the end time', async () => {
        let endBlock = await auction.endBlock();
        assert(endBlock);
    });
    it('shows the seller', async () => {
        let beneficiary = await auction.beneficiary();
        assert.equal(accounts[0], beneficiary, 'Beneficiary is not equal to deployer of auct contract');
    });
    it('shows the name', async () => {
        let auctionName = await auction.name();
        assert.equal(auctionName, auctionProductName, 'Name is not equal to product name')
    });
    it('shows the correct auction address', async () => {
        let autcionAddress = await auction.productAuction();
        assert.equal(auction.address, autcionAddress, 'Addresses are not equal');
    });

    it('can accept bids', async () => {
        let bid = 200;
        await token.approve(auction.address, bid, { from: accounts[1] })
        await auction.placeBid(bid, { from: accounts[1] });
        let auctionBalance = await token.balanceOf(auction.address);
        assert.equal(auctionBalance, bid, 'Auction balance is not equal to placed bid');
        let highestBid = await auction.highestBid(); // 200
        assert.equal(highestBid.toNumber(), bid, 'Highest bid should be the bid');
        let highestBidder = await auction.highestBidder();
        assert.equal(highestBidder, accounts[1], 'Highest bidder is not equal to last bidder');
    });

    it('stores bidders', async () => {
        let bid1 = 200;
        let bid2 = 350;
        await token.approve(auction.address, bid2, { from: accounts[2] })
        await auction.placeBid(bid2, { from: accounts[2] });
        let pendingReturns = await auction.pendingReturns(accounts[1]);
        assert.equal(pendingReturns, bid1, 'last bid wasnt stored');
        pendingReturns = await auction.pendingReturns(accounts[2]);
        assert.equal(pendingReturns, bid2, 'bid wasnt stored');
    });

    it('stores correct bid amount if bidded few times', async () => {
        let pastBid = await auction.pendingReturns(accounts[1]);
        pastBid = Number(pastBid); //200
        let bid = Number(400);
        await token.approve(auction.address, bid, { from: accounts[1] });
        await auction.placeBid(bid, { from: accounts[1] }); // 400
        let pendingReturns = await auction.pendingReturns(accounts[1]); // 600
        console.log('balance of acc[1] should be 600: ' + pendingReturns);
        let endBid = pastBid + bid;
        assert.equal(pendingReturns, endBid, 'placeBid didnt increase a bid amount if biddet twice');
    });

    it('gives the possibility to claim tokens after the auction', async () => {
        // calculate number of blocks needed to access after auction
        let nBlocks = Math.ceil((5 * 60) / 14);
        // create dummy blocks
        for (let index = 0; index <= nBlocks; index++) {
            await time.advanceBlock();
        }
        // claim tokens of bidder[2]
        let auctBalanceTok = await token.balanceOf(auction.address);
        await auction.claimTokens({ from: accounts[2] });
        let balance = await token.balanceOf(accounts[2]);
        let auctBalance = await auction.pendingReturns(accounts[2]);
        auctBalanceTok = await token.balanceOf(auction.address);
        assert.equal(auctBalance, 0, 'Auction didnt registered the token claim');
        assert.equal(balance, 1000, 'Tokens are not claimed');
    });
    it('seller can withdraw', async () => {
        let bid = await auction.highestBid();
        console.log('Highest bid: ' + bid.toString());
        let auctBalance = await token.balanceOf(auction.address);
        console.log('Auct balance before: ' + auctBalance);
        let transaction = await auction.beneficiaryWithdraw();
        // console.log(JSON.stringify(transaction));
        auctBalance = await token.balanceOf(auction.address);
        console.log('Auct balance after: ' + auctBalance);
        let ownerBalance = await token.balanceOf(store.address);
        console.log('Store balance: ' + ownerBalance);
    });
    it('allows to winner withdraw the rest of the funds', async () => {
        let balance = await auction.pendingReturns(accounts[1]);
        console.log('winner balance: ' + balance);
        await auction.claimTokens({ from: accounts[1] });
        balance = await auction.pendingReturns(accounts[1]);
        console.log('winner balance after claim: ' + balance);
        let auctionBalance = await token.balanceOf(auction.address);
        console.log('Auction balance: ' + auctionBalance);
    })
    it('counts the auctions', async () => {
        await store.sellProduct('name', 1000, 10);
        let count = await store.auctionCount();
        console.log(count.toString());
    })
});