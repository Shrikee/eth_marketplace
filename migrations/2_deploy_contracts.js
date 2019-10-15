const VSTToken = artifacts.require("./VSTToken.sol");
const Store = artifacts.require("./Store.sol");
const VSTCrowdsale = artifacts.require("./VSTCrowdsale.sol");

module.exports = async (deployer, network, accounts) => {
    const _name = "Virtual Store Token";
    const _symbol = "VST";
    const _decimals = 2; // 1 wei = 0.01 VST
    // const initialSupply = 1000 ** _decimals; removed instant minting 
    const _rate = 1000000000000000; // 1 VST =  0.001 ETH
    const _wallet = accounts[0];
    // deploy token
    await deployer.deploy(VSTToken, _name, _symbol, _decimals);
    const _token = await VSTToken.deployed();
    // deploy store with token address
    await deployer.deploy(Store, _token.address);
    // deploy crowdsale
    await deployer.deploy(VSTCrowdsale, _rate, _wallet, _token.address)
};