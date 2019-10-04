const VSTToken = artifacts.require("./VSTToken.sol");
const Store = artifacts.require("./Store.sol");

module.exports = function (deployer) {
    const initialSupply = 100;
    const _name = "Virtual Store Token";
    const _symbol = "VST";
    const _decimals = 18;
    deployer.deploy(VSTToken, initialSupply, _name, _symbol, _decimals);
    deployer.deploy(Store);
};