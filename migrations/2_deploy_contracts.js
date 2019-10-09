const VSTToken = artifacts.require("./VSTToken.sol");
const Store = artifacts.require("./Store.sol");

module.exports = async (deployer, network) => {
    const supply = 1000 ** 18;
    const initialSupply = parseInt(supply);
    const _name = "Virtual Store Token";
    const _symbol = "VST";
    const _decimals = 18;
    await deployer.deploy(VSTToken, initialSupply, _name, _symbol, _decimals)
        .then(() => {
            return deployer.deploy(Store, VSTToken.address);
        });
};