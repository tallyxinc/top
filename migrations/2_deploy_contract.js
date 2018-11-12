var ReputationBook = artifacts.require("./ReputationBook.sol");

module.exports = function(deployer) {
  deployer.deploy(ReputationBook, 'avatar', 'reputation');
};
