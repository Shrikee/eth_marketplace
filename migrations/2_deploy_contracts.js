const VSTToken = artifacts.require("./VSTToken.sol");
const Store = artifacts.require("./Store.sol");

module.exports = async (deployer, network) => {
    const _name = "Virtual Store Token";
    const _symbol = "VST";
    const _decimals = 2;
    const initialSupply = 1000 ** _decimals;
    await deployer.deploy(VSTToken, initialSupply, _name, _symbol, _decimals)
        .then(() => {
            return deployer.deploy(Store, VSTToken.address);
        });
};