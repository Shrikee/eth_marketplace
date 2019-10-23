const VSTToken = artifacts.require('VSTToken');

contract('VSTToken test', async accounts => {
    let token
    const name = "Virtual Store Token";
    const symbol = "VST";
    const decimals = 2;
    // const initialSupply = 1000000;
    before(async () => {
        token = await VSTToken.deployed();
        await token.mint(accounts[0], 1000)
    });
    it('name check', async () => {
        let result = await token.name.call();
        assert.equal(name, result, 'Name is not correct')
    });
    it('symbol check', async () => {
        let result = await token.symbol.call();
        assert.equal(symbol, result, 'Symbol not correct');
    });
    it('decimals check', async () => {
        let result = await token.decimals.call();
        assert.equal(decimals, result, 'Decimals not correct')
    })
    // it('initial supply check', async () => {
    //     let result = await instance.totalSupply.call();
    //     assert.equal(initialSupply, result, 'totalSupply not correct')
    // })
    // it('should transfer tokens to contract creator', async () => {
    //     let balance = await instance.balanceOf.call(accounts[0]);
    //     assert.equal(balance, 1000000);
    // });
    it('can transfer', async () => {
        let amount = 50
        let balanceReciever = await token.balanceOf(accounts[1])
        console.log('Before ' + balanceReciever)
        await token.transfer(accounts[1], amount);
        balanceReciever = await token.balanceOf(accounts[1])
        console.log('After ' + balanceReciever)
        assert.equal(balanceReciever, amount, 'Ammount not transfered')
    })
});