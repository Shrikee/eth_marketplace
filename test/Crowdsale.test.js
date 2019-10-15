const Crowdsale = artifacts.require('Crowdsale');
const VSTToken = artifacts.require('VSTToken');

contract('Crowdsale', async accounts => {
    let instance;

    beforeEach(async () => {
        // create new instance
        instance = await Crowdsale.deployed();
        // transfer minting roles to crowdsale contract
    });
    // test ETH transfer
    // test ammount given in tokens for 1 ETH
    // test wallet transactions
});