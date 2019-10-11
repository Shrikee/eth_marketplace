const Store = artifacts.require('Store');

contract('Store', async accounts => {
    let instance;
    const prodName = 'Product';
    const prodPrice = 10;
    before(async () => {
        instance = await Store.deployed();
    });

    it('could be sold', async () => {        
        await instance.sellProduct(prodName, prodPrice, {from: accounts[0]});        
        let resProduct = await instance.products(prodName);
        assert.equal(prodName, resProduct.name, 'Names are not equal');
        assert.equal(prodPrice, resProduct.price, 'Prices are not equal');        
    });

    it('adds product name to index array', async () => {
        let _prodName = await instance.productIndex.call(0);
        assert.equal(_prodName, prodName, 'Not added to index array');
    });

    it('returns product count', async () => {
        let counter = await instance.productCount.call();
        assert(counter = 1);
    });

    it('can check user token balance', async () => {
        let userBalance = await instance.checkBalance(accounts[1]);
        assert.equal(userBalance, 0, 'balance is not zero');
    });
    // need to resolve the account balance issue
    it('could be purchased', async () => {
        let result = await instance.purchaseProduct(prodName, {from: accounts[1]});
        assert.equal(result, true, 'Not purchased');
    });
    // test deals
}); 