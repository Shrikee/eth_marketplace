const Store = artifacts.require('Store');
const VSTToken = artifacts.require('VSTToken');
const Auction = artifacts.require('ProductAutcion');

contract('Store', async accounts => {
    let store;
    let token;
    let auction;
    const prodName = 'Product';
    const prodPrice = 10;
    // auction related
    const auctionProduct = 'auctProd';
    const auctionDuration = 30;
    const auctPrice = 1000;

    before(async () => {
        store = await Store.deployed();
        token = await VSTToken.deployed();
        await token.addMinter(store.address);
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
        let userBalance = await store.checkBalance(accounts[1]);
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
        console.log(beneficiary);
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
        await token.mint(accounts[0], 100000);
        await token.mint(store.address, 100000)

        // token.transfer(auction.address, 1000);
        let bid = 1000
        // console.log(typeof (bid))
        let transaction = await auction.placeBid(bid);
        let auctionBalance = await token.balanceOf(auction.address);
        console.log('Auction balance: ' + auctionBalance.toString());
        let tokenBalance = await token.balanceOf(accounts[0]);
        console.log('Account[0] balance: ' + tokenBalance.toString());
        //     let res = await auction.placeBid(bid);
        //     console.log('Res: ' + res);
        //     let highestBid = await auction.highestBid();
        //     console.log('Highest bid: ' + highestBid);
    });
})