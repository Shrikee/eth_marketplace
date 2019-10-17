const Crowdsale = artifacts.require('VSTCrowdsale');
const VSTToken = artifacts.require('VSTToken');
const Store = artifacts.require('Store');

contract('Crowdsale', async accounts => {
    let crowdsale;
    let token;
    let store;
    let wallet;

    before(async () => {
        // create new crowdsale
        crowdsale = await Crowdsale.deployed();
        token = await VSTToken.deployed();
        store = await Store.deployed();
        // add minting roles to crowdsale contract
        await token.addMinter(crowdsale.address);
        // get wallet address
        wallet = await crowdsale.wallet();
    });
    // minting
    it('can mint tokens', async () => {
        await token.mint(crowdsale.address, 1);
        let balance = await token.balanceOf(crowdsale.address);
        balance = balance.toString();
        assert.equal(balance, '1', 'Tokens are not minted')
    })
    it('can display the wallet address', async () => {
        assert.equal(wallet, accounts[0], 'Wallet is not correct');
    })
    it('can accept funds', async () => {
        let finney = web3.utils.toWei('1', 'finney');
        let walletBalanceBefore = await web3.eth.getBalance(wallet);
        walletBalanceBefore = web3.utils.toBN(walletBalanceBefore);
        await web3.eth.sendTransaction({ from: accounts[1], to: crowdsale.address, value: finney, gas: 500000 });
        let walletBalanceAfter = await web3.eth.getBalance(wallet);
        walletBalanceAfter = web3.utils.toBN(walletBalanceAfter);
        let result = walletBalanceAfter.sub(walletBalanceBefore);
        assert.equal(result.toString(), finney, 'fail');
    });
    it('can transfer tokens with expected yeld', async () => {
        let senderBalanceBefore = await token.balanceOf(accounts[2]);
        let finney = web3.utils.toWei('1', 'finney');
        await web3.eth.sendTransaction({ from: accounts[2], to: crowdsale.address, value: finney, gas: 500000 });
        let senderBalanceAfter = await token.balanceOf(accounts[2]);
        assert.equal(senderBalanceAfter.toString(), 100, 'Tokens are not transfered')
    });
    it('can display user count', async () => {
        let displayCount = await crowdsale.userCounter();
        console.log('Users: ' + displayCount.toString());
    });
    it('can display token counter', async () => {
        let tokenCount = await crowdsale.tokensPurchased();
        console.log('Tokens: ' + tokenCount.toString())
    });
    it('gives an ammount of eth raised', async () => {
        let fundsRaised = await crowdsale.weiRaised();
        fundsRaised = web3.utils.fromWei(fundsRaised);
        console.log('Raised funds: ' + fundsRaised.toString())
        assert(fundsRaised);
    });
    it('gives a concString', async () => {
        let result = await crowdsale.concString();
        console.log('String: ' + result);
    })
    it('can sell the product', async () => {
        let productCount = await store.productCount();
        console.log('Store product count: ' + productCount);
    });
});