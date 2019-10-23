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
    const auctionProduct = 'auctProd';
    const auctionDuration = 5;
    const auctPrice = 1000;

    before(async () => {
        store = await Store.deployed();
        token = await VSTToken.deployed();
        await token.addMinter(store.address);
        await token.mint(accounts[1], 100000);
        await token.mint(accounts[2], 100000);
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
        await store.sellProduct(auctionProduct, auctPrice, auctionDuration);
        let auctList = await store.auctions(0);
        let auctAddress = await store.auctionsMapping(auctionProduct);
        assert.equal(auctList, auctAddress, 'mapping address and array value is not equal');
        auction = await Auction.at(auctAddress);
        assert.equal(auction.address, auctAddress, 'Auction is not deployed');
    });
    it('shows the start block', async () => {
        let startBlock = await auction.startBlock();
        console.log(startBlock.toString());
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
        assert.equal(auctionName, auctionProduct, 'Name is not equal to product name')
    });
    it('shows the correct auction address', async () => {
        let autcionAddress = await auction.productAuction();
        assert.equal(auction.address, autcionAddress, 'Addresses are not equal');
    });

    it('can accept bids', async () => {
        let bid = 2000;
        await token.approve(auction.address, bid, { from: accounts[1] })
        await auction.placeBid(bid, { from: accounts[1] });
        let auctionBalance = await token.balanceOf(auction.address);
        assert.equal(auctionBalance, bid, 'Auction balance is not equal to placed bid');
        let highestBid = await auction.highestBid();
        console.log('Highest bid: ' + highestBid);
        assert.equal(highestBid, bid, 'Highest bid should be the bid');
        let highestBidder = await auction.highestBidder();
        assert.equal(highestBidder, accounts[1], 'Highest bidder is not equal to last bidder');
    });

    it('stores bidders', async () => {
        await token.approve(auction.address, 3000, { from: accounts[2] })
        await auction.placeBid(3000, { from: accounts[2] });
        let pendingReturns = await auction.pendingReturns(accounts[1]);
        assert.equal(pendingReturns, 2000, 'last bid wasnt stored');
        pendingReturns = await auction.pendingReturns(accounts[2]);
        assert.equal(pendingReturns, 3000, 'bid wasnt stored');
    });

    it('stores correct bid amount if bidded few times', async () => {
        let bid = 4000;
        await token.approve(auction.address, bid, { from: accounts[1] })
        await auction.placeBid(bid, { from: accounts[1] });
        let pendingReturns = await auction.pendingReturns(accounts[1]);
        console.log('balance of acc[1]: ' + pendingReturns);
        assert.equal(pendingReturns, 6000, 'placeBid didnt increase a bi dammount if biddet twice');
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
        console.log('balance before claim: ' + auctBalanceTok);
        await auction.claimTokens({ from: accounts[2] });
        let balance = await token.balanceOf(accounts[2]);
        let auctBalance = await auction.pendingReturns(accounts[2]);
        auctBalanceTok = await token.balanceOf(auction.address);
        console.log('balance after claim: ' + auctBalanceTok);
        assert.equal(auctBalance, 0, 'Auction didnt registered the token claim');
        assert.equal(balance, 100000, 'Tokens are not claimed');
    });
    it('seller can withdraw', async () => {
        let bid = await auction.highestBid();
        console.log('Highest bid: ' + bid.toString());
        let auctBalance = await token.balanceOf(auction.address);
        console.log('Auct balance before: ' + auctBalance);
        let transaction = await auction.beneficiaryWithdraw({ from: accounts[0] });
        auctBalance = await token.balanceOf(auction.address);
        console.log('Auct balance after: ' + auctBalance);

        // console.log(JSON.stringify(transaction));
    });
});