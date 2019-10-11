const VSTToken = artifacts.require('VSTToken');

contract('VSTToken test', async accounts => {
    let instance
    const name = "Virtual Store Token";
    const symbol = "VST";
    const decimals = 2;
    const initialSupply = 1000000;
    before(async () => {
        instance = await VSTToken.deployed();
    });
    it('name check', async () => {
        let result = await instance.name.call();
        assert.equal(name, result, 'Name is not correct')
    });
    it('symbol check', async () => {
        let result = await instance.symbol.call();
        assert.equal(symbol, result, 'Symbol not correct');
    });
    it('decimals check', async () => {
        let result = await instance.decimals.call();
        assert.equal(decimals, result, 'Decimals not correct')
    })
    it('initial supply check', async () => {
        let result = await instance.totalSupply.call();
        assert.equal(initialSupply, result, 'totalSupply not correct')
    })
    it('should transfer tokens to contract creator', async () => {        
        let balance = await instance.balanceOf.call(accounts[0]);
        assert.equal(balance, 1000000);
    });
    it('can transfer', async () => {
        let ammount = 50
        let balanceReciever = await instance.balanceOf(accounts[1])         
        await instance.transfer(accounts[1], ammount); 
        balanceReciever = await instance.balanceOf.call(accounts[1])
        assert.equal(balanceReciever, ammount, 'Ammount not transfered')
    })
});