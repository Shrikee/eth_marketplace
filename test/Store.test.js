const Store = artifacts.require('Store');
const VSTToken = artifacts.require('VSTToken')

contract('Store', async accounts => {
    let instance;
    let token;
    const prodName = 'Product';
    const prodPrice = 10;
    before(async () => {
        instance = await Store.deployed();
        token = await VSTToken.deployed();
    });

    it('could be sold', async () => {
        await instance.sellProduct(prodName, prodPrice, { from: accounts[0] });
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
    it('can sell product', async () => {
        await token.transfer(accounts[1], prodPrice);
        let result = await instance.purchaseProduct(prodName, { from: accounts[1] });
        let product = await instance.products(prodName);
        assert.equal(product.name, '', 'Not purchased');
    });
    it('creates deal after product purchase', async () => {
        let deal = await instance.deals(accounts[0]);
        assert.equal(deal.name, prodName, 'Deal not created')
    });
    it('clears a deal after approval', async () => {
        await instance.clearDeal(accounts[0]);
        let deal = await instance.deals(accounts[0]);
        assert.equal(deal.name, '', 'deal not cleared');
    });
}); 