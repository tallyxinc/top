const ReputationBook = artifacts.require('ReputationBook');
const { decodeLogs } = require('./decodeLogs');
const abi = require('ethereumjs-abi');
const BigNumber = require('bignumber.js');
const Utils = require('./utils');

contract('ReputationBook', accounts => {

    let reputationBook;
    let owner = accounts[0];
    let changeAgent = accounts[1];

    beforeEach(async () => {
        let name = "TallyxReputationBook";
        let symbol = "TLX";
        reputationBook = await ReputationBook.new(name, symbol, {from: owner});
    });

    it('should check metadata', async () => {
        let name = await reputationBook.name();
        assert.equal(name, "TallyxReputationBook", "name is not equal");
        let symbol = await reputationBook.symbol();
        assert.equal(symbol, "TLX", "symbol is not equal");
    });

    it('should return balanceOf', async () => {
        let account = accounts[3];
        let balanceOf = await reputationBook.balanceOf(account);
        assert.equal(balanceOf.valueOf(), new BigNumber('0').valueOf(), "balanceOf is not equal");
    });

    it('should not update change agent cause msg.sender != owner', async () => {
        let user = accounts[3];
        let userStatus = await reputationBook.isChangeAgent(user);
        assert.equal(userStatus, false, "user is state change agent");

        await reputationBook.updateChangeAgent(user, true, {from: accounts[4]})
            .then(Utils.receiptShouldFailed)
            .catch(Utils.catchReceiptShouldFailed);

        userStatus = await reputationBook.isChangeAgent(user);
        assert.equal(userStatus, false, "user is state change agent");
    });

    it('should not update change agent cause agent == address(0)', async () => {
        let user = 0x0;
        let userStatus = await reputationBook.isChangeAgent(user);
        assert.equal(userStatus, false, "user is state change agent");

        await reputationBook.updateChangeAgent(user, true, {from: owner})
            .then(Utils.receiptShouldFailed)
            .catch(Utils.catchReceiptShouldFailed);

        userStatus = await reputationBook.isChangeAgent(user);
        assert.equal(userStatus, false, "user is state change agent");
    });

    it('should update change agent', async () => {
        let user = accounts[3];

        let userStatus = await reputationBook.isChangeAgent(user);
        assert.equal(userStatus, false, "user is state change agent");

        await reputationBook.updateChangeAgent(user, true, {from: owner})
            .then(Utils.receiptShouldSucceed);

        userStatus = await reputationBook.isChangeAgent(user);
        assert.equal(userStatus, true, "user is not state change agent");
    });

    it('should create user', async () => {
        let avatarId = 1234;
        let user = accounts[3];
        let metadata = [0x12, 0x34];

        await reputationBook.createAvatar(avatarId, user, metadata, {from: owner})
            .then(Utils.receiptShouldSucceed);

        let userTokenIds = await reputationBook.userTokenIds.call(user);
        assert.equal(userTokenIds, 0, "token id is not equal");

        let userAvatarIds = await reputationBook.userAvatarIds.call(user);
        assert.equal(new BigNumber(userAvatarIds).valueOf(), avatarId, "avatarId is not equal");

        let tokenId = 0;
        let reputations = await reputationBook.reputations.call(tokenId);
        assert.equal(new BigNumber(reputations[0]).valueOf(), avatarId, "reputations[0] is not equal");
        assert.equal(new BigNumber(reputations[2]).valueOf(), 0, "reputations[2] is not equal");

        let claimedAvatarIds = await reputationBook.claimedAvatarIds.call(avatarId);
        assert.equal(claimedAvatarIds, true, "claimedAvatarIds is not equal");
    });

    it('should create user', async () => {
        let avatarId = 1234;
        let user = accounts[3];
        let metadata = [0x12, 0x34];

        await reputationBook.createAvatar(avatarId, user, metadata, {from: owner})
            .then(Utils.receiptShouldSucceed);

        let userTokenIds = await reputationBook.userTokenIds.call(user);
        assert.equal(userTokenIds, 0, "token id is not equal");

        let userAvatarIds = await reputationBook.userAvatarIds.call(user);
        assert.equal(new BigNumber(userAvatarIds).valueOf(), avatarId, "avatarId is not equal");

        let tokenId = 0;
        let reputations = await reputationBook.reputations.call(tokenId);
        assert.equal(new BigNumber(reputations[0]).valueOf(), avatarId, "reputations[0] is not equal");
        assert.equal(new BigNumber(reputations[2]).valueOf(), 0, "reputations[2] is not equal");

        let claimedAvatarIds = await reputationBook.claimedAvatarIds.call(avatarId);
        assert.equal(claimedAvatarIds, true, "claimedAvatarIds is not equal");
    });

    it('should not create user cause msg.sender != changeAgent', async () => {
        let avatarId = 1234;
        let user = accounts[3];
        let metadata = [0x12, 0x34];

        await reputationBook.createAvatar(avatarId, user, metadata, {from: accounts[5]})
            .then(Utils.receiptShouldFailed)
            .catch(Utils.catchReceiptShouldFailed);
    });

    it('should not create user cause user == address(0)', async () => {
        let avatarId = 1234;
        let user = accounts[3];
        let metadata = [0x12, 0x34];

        await reputationBook.createAvatar(avatarId, 0x0, metadata, {from: owner})
            .then(Utils.receiptShouldFailed)
            .catch(Utils.catchReceiptShouldFailed);
    });

    it('should not create user cause user avatarId != 0 && balanceOf(user) > 0', async () => {
        let avatarId = 1234;
        let user = accounts[3];
        let metadata = [0x12, 0x34];

        await reputationBook.createAvatar(avatarId, user, metadata, {from: owner})
            .then(Utils.receiptShouldSucceed);

        let userTokenIds = await reputationBook.userTokenIds.call(user);
        assert.equal(userTokenIds, 0, "token id is not equal");

        let userAvatarIds = await reputationBook.userAvatarIds.call(user);
        assert.equal(new BigNumber(userAvatarIds).valueOf(), avatarId, "avatarId is not equal");
        
        let tokenId = 0;
        let reputations = await reputationBook.reputations.call(tokenId);
        assert.equal(new BigNumber(reputations[0]).valueOf(), avatarId, "reputations[0] is not equal");
        assert.equal(new BigNumber(reputations[2]).valueOf(), 0, "reputations[2] is not equal");

        let claimedAvatarIds = await reputationBook.claimedAvatarIds.call(avatarId);
        assert.equal(claimedAvatarIds, true, "claimedAvatarIds is not equal");

        let newAvatarId = 1235;

        await reputationBook.createAvatar(newAvatarId, user, metadata, {from: owner})
            .then(Utils.receiptShouldFailed)
            .catch(Utils.catchReceiptShouldFailed);
    });

    it('should not create user cause claimedAvatarIds[avatarId] == true', async () => {
        let avatarId = 1234;
        let user = accounts[3];
        let metadata = [0x12, 0x34];

        await reputationBook.createAvatar(avatarId, user, metadata, {from: owner})
            .then(Utils.receiptShouldSucceed);

        let userTokenIds = await reputationBook.userTokenIds.call(user);
        assert.equal(userTokenIds, 0, "token id is not equal");

        let userAvatarIds = await reputationBook.userAvatarIds.call(user);
        assert.equal(new BigNumber(userAvatarIds).valueOf(), avatarId, "avatarId is not equal");

        let tokenId = 0;
        let reputations = await reputationBook.reputations.call(tokenId);
        assert.equal(new BigNumber(reputations[0]).valueOf(), avatarId, "reputations[0] is not equal");
        assert.equal(new BigNumber(reputations[2]).valueOf(), 0, "reputations[2] is not equal");

        let claimedAvatarIds = await reputationBook.claimedAvatarIds.call(avatarId);
        assert.equal(claimedAvatarIds, true, "claimedAvatarIds is not equal");

        let newUser = accounts[4];
        let newMetadata = [0x13, 0x45];

        await reputationBook.createAvatar(avatarId, newUser, newMetadata, {from: owner})
            .then(Utils.receiptShouldFailed)
            .catch(Utils.catchReceiptShouldFailed);
    }); 

    it('should not create user cause avatarId == 0', async () => {
        let avatarId = 1234;
        let user = accounts[3];
        let metadata = [0x12, 0x34];

        await reputationBook.createAvatar(0, user, metadata, {from: owner})
            .then(Utils.receiptShouldFailed)
            .catch(Utils.catchReceiptShouldFailed);
    });  

    it('should return reputation when execute getReputation', async () => {
        let avatarId = 1234;
        let user = accounts[3];
        let metadata = [0x12, 0x34];

        await reputationBook.createAvatar(avatarId, user, metadata, {from: owner})
            .then(Utils.receiptShouldSucceed);

        let userTokenIds = await reputationBook.userTokenIds.call(user);
        assert.equal(userTokenIds, 0, "token id is not equal");

        let userAvatarIds = await reputationBook.userAvatarIds.call(user);
        assert.equal(new BigNumber(userAvatarIds).valueOf(), avatarId, "avatarId is not equal");

        let tokenId = 0;
        let reputations = await reputationBook.reputations.call(tokenId);
        assert.equal(new BigNumber(reputations[0]).valueOf(), avatarId, "reputations[0] is not equal");
        assert.equal(new BigNumber(reputations[2]).valueOf(), 0, "reputations[2] is not equal");

        let claimedAvatarIds = await reputationBook.claimedAvatarIds.call(avatarId);
        assert.equal(claimedAvatarIds, true, "claimedAvatarIds is not equal");

        let reputation = await reputationBook.getReputation(user);
        assert.equal(new BigNumber(reputation).valueOf(), 0, "reputation is not equal");

        await reputationBook.increaseReputation(user, 1000, {from: owner})
            .then(Utils.receiptShouldSucceed);

        reputation = await reputationBook.getReputation(user);
        assert.equal(new BigNumber(reputation).valueOf(), 1000, "reputation is not equal");
    });  

    it('should not return reputation when execute getReputation cause user == address(0)', async () => {
        let user = 0x0;

        await reputationBook.getReputation(user)
            .then(Utils.receiptShouldFailed)
            .catch(Utils.catchReceiptShouldFailed);
    });  

    it('should not return reputation when execute getReputation cause user is not registered', async () => {
        let user = accounts[3];

        await reputationBook.getReputation(user)
            .then(Utils.receiptShouldFailed)
            .catch(Utils.catchReceiptShouldFailed);
    });  

    it('should increase reputation', async () => {
        let avatarId = 1234;
        let user = accounts[3];
        let metadata = [0x12, 0x34];

        await reputationBook.createAvatar(avatarId, user, metadata, {from: owner})
            .then(Utils.receiptShouldSucceed);

        let userTokenIds = await reputationBook.userTokenIds.call(user);
        assert.equal(userTokenIds, 0, "token id is not equal");

        let userAvatarIds = await reputationBook.userAvatarIds.call(user);
        assert.equal(new BigNumber(userAvatarIds).valueOf(), avatarId, "avatarId is not equal");

        let tokenId = 0;
        let reputations = await reputationBook.reputations.call(tokenId);
        assert.equal(new BigNumber(reputations[0]).valueOf(), avatarId, "reputations[0] is not equal");
        assert.equal(new BigNumber(reputations[2]).valueOf(), 0, "reputations[2] is not equal");

        let valueToAdd = new BigNumber('100');

        let reputation = await reputationBook.getReputation(user);
        assert.equal(reputation, 0, "reputation is not equal");

        await reputationBook.increaseReputation(user, valueToAdd, {from: owner})
            .then(Utils.receiptShouldSucceed);

        reputation = await reputationBook.getReputation(user);
        assert.equal(new BigNumber(reputation).valueOf(), 100, "reputation is not equal");

        let increaseReputationEvents = await reputationBook.ReputationIncreased({}, {fromBlock: '0', toBlock: 'latest'});

        increaseReputationEvents.get((err, logs) => {
            assert.equal(logs.length, 1, "more or less than 1 event emitted");
            assert.equal(logs[0].event, "ReputationIncreased", "event type is not equal");
            assert.equal(logs[0].args._user, user, "user is not equal");
            assert.equal(logs[0].args._increasedBy, owner, "increasedBy is not equal");
            assert.equal(new BigNumber(logs[0].args._pointsAdded).valueOf(), 100, "pointsAdded is not equal");
            assert.equal(new BigNumber(logs[0].args._currentReputation).valueOf(), 100, "currentReputation is not equal");
            assert.equal(new BigNumber(logs[0].args._previousReputation).valueOf(), 0, "previousReputation is not equal");
        });
    });

    it('should not increase reputation cause msg.sender != changeAgent', async () => {
        let avatarId = 1234;
        let user = accounts[3];
        let metadata = [0x12, 0x34];

        await reputationBook.createAvatar(avatarId, user, metadata, {from: owner})
            .then(Utils.receiptShouldSucceed);

        let userTokenIds = await reputationBook.userTokenIds.call(user);
        assert.equal(userTokenIds, 0, "token id is not equal");

        let userAvatarIds = await reputationBook.userAvatarIds.call(user);
        assert.equal(new BigNumber(userAvatarIds).valueOf(), avatarId, "avatarId is not equal");

        let tokenId = 0;
        let reputations = await reputationBook.reputations.call(tokenId);
        assert.equal(new BigNumber(reputations[0]).valueOf(), avatarId, "reputations[0] is not equal");
        assert.equal(new BigNumber(reputations[2]).valueOf(), 0, "reputations[2] is not equal");

        let valueToAdd = new BigNumber('100');

        let reputation = await reputationBook.getReputation(user);
        assert.equal(reputation, 0, "reputation is not equal");

        await reputationBook.increaseReputation(user, valueToAdd, {from: accounts[5]})
            .then(Utils.receiptShouldFailed)
            .catch(Utils.catchReceiptShouldFailed);

        reputation = await reputationBook.getReputation(user);
        assert.equal(new BigNumber(reputation).valueOf(), 0, "reputation is not equal");
    });

    it('should not increase reputation cause user == address(0)', async () => {
        let avatarId = 1234;
        let user = accounts[3];
        let metadata = [0x12, 0x34];

        await reputationBook.createAvatar(avatarId, user, metadata, {from: owner})
            .then(Utils.receiptShouldSucceed);

        let userTokenIds = await reputationBook.userTokenIds.call(user);
        assert.equal(userTokenIds, 0, "token id is not equal");

        let userAvatarIds = await reputationBook.userAvatarIds.call(user);
        assert.equal(new BigNumber(userAvatarIds).valueOf(), avatarId, "avatarId is not equal");

        let tokenId = 0;
        let reputations = await reputationBook.reputations.call(tokenId);
        assert.equal(new BigNumber(reputations[0]).valueOf(), avatarId, "reputations[0] is not equal");
        assert.equal(new BigNumber(reputations[2]).valueOf(), 0, "reputations[2] is not equal");

        let valueToAdd = new BigNumber('100');

        let reputation = await reputationBook.getReputation(user);
        assert.equal(reputation, 0, "reputation is not equal");

        await reputationBook.increaseReputation(0x0, valueToAdd, {from: accounts[5]})
            .then(Utils.receiptShouldFailed)
            .catch(Utils.catchReceiptShouldFailed);

        reputation = await reputationBook.getReputation(user);
        assert.equal(new BigNumber(reputation).valueOf(), 0, "reputation is not equal");
    });

    it('should not increase reputation cause valueToAdd == 0', async () => {
        let avatarId = 1234;
        let user = accounts[3];
        let metadata = [0x12, 0x34];

        await reputationBook.createAvatar(avatarId, user, metadata, {from: owner})
            .then(Utils.receiptShouldSucceed);

        let userTokenIds = await reputationBook.userTokenIds.call(user);
        assert.equal(userTokenIds, 0, "token id is not equal");

        let userAvatarIds = await reputationBook.userAvatarIds.call(user);
        assert.equal(new BigNumber(userAvatarIds).valueOf(), avatarId, "avatarId is not equal");

        let tokenId = 0;
        let reputations = await reputationBook.reputations.call(tokenId);
        assert.equal(new BigNumber(reputations[0]).valueOf(), avatarId, "reputations[0] is not equal");
        assert.equal(new BigNumber(reputations[2]).valueOf(), 0, "reputations[2] is not equal");

        let valueToAdd = new BigNumber('0');

        let reputation = await reputationBook.getReputation(user);
        assert.equal(reputation, 0, "reputation is not equal");

        await reputationBook.increaseReputation(user, valueToAdd, {from: accounts[5]})
            .then(Utils.receiptShouldFailed)
            .catch(Utils.catchReceiptShouldFailed);

        reputation = await reputationBook.getReputation(user);
        assert.equal(new BigNumber(reputation).valueOf(), 0, "reputation is not equal");
    });

    it('should decrease reputation', async () => {
        let avatarId = 1234;
        let user = accounts[3];
        let metadata = [0x12, 0x34];

        await reputationBook.createAvatar(avatarId, user, metadata, {from: owner})
            .then(Utils.receiptShouldSucceed);

        let userTokenIds = await reputationBook.userTokenIds.call(user);
        assert.equal(userTokenIds, 0, "token id is not equal");

        let userAvatarIds = await reputationBook.userAvatarIds.call(user);
        assert.equal(new BigNumber(userAvatarIds).valueOf(), avatarId, "avatarId is not equal");

        let tokenId = 0;
        let reputations = await reputationBook.reputations.call(tokenId);
        assert.equal(new BigNumber(reputations[0]).valueOf(), avatarId, "reputations[0] is not equal");
        assert.equal(new BigNumber(reputations[2]).valueOf(), 0, "reputations[2] is not equal");

        let valueToAdd = new BigNumber('100');

        let reputation = await reputationBook.getReputation(user);
        assert.equal(reputation, 0, "reputation is not equal");

        await reputationBook.increaseReputation(user, valueToAdd, {from: owner})
            .then(Utils.receiptShouldSucceed);

        reputation = await reputationBook.getReputation(user);
        assert.equal(new BigNumber(reputation).valueOf(), 100, "reputation is not equal");

        let valueToSub = new BigNumber('50');

        await reputationBook.decreaseReputation(user, valueToSub, {from: owner})
            .then(Utils.receiptShouldSucceed);

        let decreaseReputationEvents = await reputationBook.ReputationDecreased({}, {fromBlock: '0', toBlock: 'latest'});

        decreaseReputationEvents.get((err, logs) => {
            assert.equal(logs.length, 1, "more or less than 1 event emitted");
            assert.equal(logs[0].event, "ReputationDecreased", "event type is not equal");
            assert.equal(logs[0].args._user, user, "user is not equal");
            assert.equal(logs[0].args._decreasedBy, owner, "increasedBy is not equal");
            assert.equal(new BigNumber(logs[0].args._pointsSubstracted).valueOf(), 50, "pointsAdded is not equal");
            assert.equal(new BigNumber(logs[0].args._currentReputation).valueOf(), 50, "currentReputation is not equal");
            assert.equal(new BigNumber(logs[0].args._previousReputation).valueOf(), 100, "previousReputation is not equal");
        });
    });

    it('should not decrease reputation cause msg.sender != changeAgent', async () => {
        let avatarId = 1234;
        let user = accounts[3];
        let metadata = [0x12, 0x34];

        await reputationBook.createAvatar(avatarId, user, metadata, {from: owner})
            .then(Utils.receiptShouldSucceed);

        let userTokenIds = await reputationBook.userTokenIds.call(user);
        assert.equal(userTokenIds, 0, "token id is not equal");

        let userAvatarIds = await reputationBook.userAvatarIds.call(user);
        assert.equal(new BigNumber(userAvatarIds).valueOf(), avatarId, "avatarId is not equal");

        let tokenId = 0;
        let reputations = await reputationBook.reputations.call(tokenId);
        assert.equal(new BigNumber(reputations[0]).valueOf(), avatarId, "reputations[0] is not equal");
        assert.equal(new BigNumber(reputations[2]).valueOf(), 0, "reputations[2] is not equal");

        let valueToAdd = new BigNumber('100');

        let reputation = await reputationBook.getReputation(user);
        assert.equal(reputation, 0, "reputation is not equal");

        await reputationBook.increaseReputation(user, valueToAdd, {from: owner})
            .then(Utils.receiptShouldSucceed);

        reputation = await reputationBook.getReputation(user);
        assert.equal(new BigNumber(reputation).valueOf(), 100, "reputation is not equal");

        let valueToSub = new BigNumber('50');

        await reputationBook.decreaseReputation(user, valueToSub, {from: accounts[5]})
            .then(Utils.receiptShouldFailed)
            .catch(Utils.catchReceiptShouldFailed);
    });

    it('should not decrease reputation cause user == address(0)', async () => {
        let avatarId = 1234;
        let user = accounts[3];
        let metadata = [0x12, 0x34];

        await reputationBook.createAvatar(avatarId, user, metadata, {from: owner})
            .then(Utils.receiptShouldSucceed);

        let userTokenIds = await reputationBook.userTokenIds.call(user);
        assert.equal(userTokenIds, 0, "token id is not equal");

        let userAvatarIds = await reputationBook.userAvatarIds.call(user);
        assert.equal(new BigNumber(userAvatarIds).valueOf(), avatarId, "avatarId is not equal");

        let tokenId = 0;
        let reputations = await reputationBook.reputations.call(tokenId);
        assert.equal(new BigNumber(reputations[0]).valueOf(), avatarId, "reputations[0] is not equal");
        assert.equal(new BigNumber(reputations[2]).valueOf(), 0, "reputations[2] is not equal");

        let valueToAdd = new BigNumber('100');

        let reputation = await reputationBook.getReputation(user);
        assert.equal(reputation, 0, "reputation is not equal");

        await reputationBook.increaseReputation(user, valueToAdd, {from: owner})
            .then(Utils.receiptShouldSucceed);

        reputation = await reputationBook.getReputation(user);
        assert.equal(new BigNumber(reputation).valueOf(), 100, "reputation is not equal");

        let valueToSub = new BigNumber('50');

        await reputationBook.decreaseReputation(0x0, valueToSub, {from: owner})
            .then(Utils.receiptShouldFailed)
            .catch(Utils.catchReceiptShouldFailed);
    });

    it('should not decrease reputation cause valueToSub == 0', async () => {
        let avatarId = 1234;
        let user = accounts[3];
        let metadata = [0x12, 0x34];

        await reputationBook.createAvatar(avatarId, user, metadata, {from: owner})
            .then(Utils.receiptShouldSucceed);

        let userTokenIds = await reputationBook.userTokenIds.call(user);
        assert.equal(userTokenIds, 0, "token id is not equal");

        let userAvatarIds = await reputationBook.userAvatarIds.call(user);
        assert.equal(new BigNumber(userAvatarIds).valueOf(), avatarId, "avatarId is not equal");

        let tokenId = 0;
        let reputations = await reputationBook.reputations.call(tokenId);
        assert.equal(new BigNumber(reputations[0]).valueOf(), avatarId, "reputations[0] is not equal");
        assert.equal(new BigNumber(reputations[2]).valueOf(), 0, "reputations[2] is not equal");

        let valueToAdd = new BigNumber('100');

        let reputation = await reputationBook.getReputation(user);
        assert.equal(reputation, 0, "reputation is not equal");

        await reputationBook.increaseReputation(user, valueToAdd, {from: owner})
            .then(Utils.receiptShouldSucceed);

        reputation = await reputationBook.getReputation(user);
        assert.equal(new BigNumber(reputation).valueOf(), 100, "reputation is not equal");

        let valueToSub = new BigNumber('0');

        await reputationBook.decreaseReputation(user, valueToSub, {from: owner})
            .then(Utils.receiptShouldFailed)
            .catch(Utils.catchReceiptShouldFailed);
    });
});