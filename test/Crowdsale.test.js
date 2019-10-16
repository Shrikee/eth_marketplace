const Crowdsale = artifacts.require('VSTCrowdsale');
const VSTToken = artifacts.require('VSTToken');

contract('Crowdsale', async accounts => {
    let crowdsale;
    let token;
    let wallet;

    before(async () => {
        // create new crowdsale
        crowdsale = await Crowdsale.deployed();
        token = await VSTToken.deployed();
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
    // test ETH transfer
    it('can accept funds', async () => {
        let eth = web3.utils.toWei('1', 'ether');
        let walletBalanceBefore = await web3.eth.getBalance(wallet);
        walletBalanceBefore = web3.utils.toBN(walletBalanceBefore);
        await web3.eth.sendTransaction({ from: accounts[1], to: crowdsale.address, value: eth });
        let walletBalanceAfter = await web3.eth.getBalance(wallet);
        walletBalanceAfter = web3.utils.toBN(walletBalanceAfter);
        let result = walletBalanceAfter.sub(walletBalanceBefore);
        assert.equal(result.toString(), eth, 'fail');
    });
    it('can transfer tokens with expected yeld', async () => {
        let senderBalanceBefore = await token.balanceOf(accounts[2]);
        let eth = web3.utils.toWei('1', 'finney');
        await web3.eth.sendTransaction({ from: accounts[2], to: crowdsale.address, value: eth });
        let senderBalanceAfter = await token.balanceOf(accounts[2]);
        assert.equal(senderBalanceAfter.toString(), 100, 'Tokens are not transfered')
    });
});