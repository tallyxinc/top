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

    it('should check that owner is statechange/mint/burn agent', async () => {
        let changeAgentStatus = await reputationBook.changeAgent.call(owner);
        assert.equal(changeAgentStatus, true, "owner is not a mint agent");
    });

    it('should check that random address is not a statechange/mint/burn agent', async () => {
        let randomUser = accounts[5];
        let changeAgentStatus = await reputationBook.changeAgent.call(randomUser);
        assert.equal(changeAgentStatus, false, "owner is not a mint agent");
    });

    it('should not update change agent cause msg.sender != owner', async () => {
        let user = accounts[3];
        let userStatus = await reputationBook.changeAgent.call(user);
        assert.equal(userStatus, false, "user is state change agent");

        await reputationBook.updateChangeAgent(user, true, {from: accounts[4]})
            .then(Utils.receiptShouldFailed)
            .catch(Utils.catchReceiptShouldFailed);

        userStatus = await reputationBook.changeAgent.call(user);
        assert.equal(userStatus, false, "user is state change agent");
    });

    it('should not update change agent cause agent == address(0)', async () => {
        let user = 0x0;
        let userStatus = await reputationBook.changeAgent.call(user);
        assert.equal(userStatus, false, "user is state change agent");

        await reputationBook.updateChangeAgent(user, true, {from: owner})
            .then(Utils.receiptShouldFailed)
            .catch(Utils.catchReceiptShouldFailed);

        userStatus = await reputationBook.changeAgent.call(user);
        assert.equal(userStatus, false, "user is state change agent");
    });

    it('should update change agent', async () => {
        let user = accounts[3];

        let userStatus = await reputationBook.changeAgent.call(user);
        assert.equal(userStatus, false, "user is state change agent");

        await reputationBook.updateChangeAgent(user, true, {from: owner})
            .then(Utils.receiptShouldSucceed);

        userStatus = await reputationBook.changeAgent.call(user);
        assert.equal(userStatus, true, "user is not state change agent");
    });

    it('should not increase reputation cause user == address(0)', async () => {
        let user = 0x0;
        let pointsToAdd = new BigNumber('10');
        let balanceOf = await reputationBook.balanceOf(user);
        assert.equal(new BigNumber(balanceOf).valueOf(), new BigNumber('0').valueOf(), "balanceOf is not equal");

        await reputationBook.increaseReputation(user, pointsToAdd, {from: owner})
            .then(Utils.receiptShouldFailed)
            .catch(Utils.catchReceiptShouldFailed);

        balanceOf = await reputationBook.balanceOf(user);
        assert.equal(new BigNumber(balanceOf).valueOf(), new BigNumber('0').valueOf(), "balanceOf is not equal");
    });

    it('should not increase reputation cause pointsToAdd == 0', async () => {
        let user = accounts[3];
        let pointsToAdd = new BigNumber('0');
        let balanceOf = await reputationBook.balanceOf(user);
        assert.equal(new BigNumber(balanceOf).valueOf(), new BigNumber('0').valueOf(), "balanceOf is not equal")

        await reputationBook.increaseReputation(user, pointsToAdd, {from: owner})
            .then(Utils.receiptShouldFailed)
            .catch(Utils.catchReceiptShouldFailed);

        balanceOf = await reputationBook.balanceOf(user);
        assert.equal(new BigNumber(balanceOf).valueOf(), new BigNumber('0').valueOf(), "balanceOf is not equal");
    });

    it('should increase reputation', async () => {
        let user = accounts[3];
        let pointsToAdd = new BigNumber('10');
        let balanceOf = await reputationBook.balanceOf(user);
        assert.equal(new BigNumber(balanceOf).valueOf(), new BigNumber('0').valueOf(), "balanceOf is not equal")

        await reputationBook.increaseReputation(user, pointsToAdd, {from: owner})
            .then(Utils.receiptShouldSucceed);

        let reputationIncreasedEvents = reputationBook.ReputationIncreased({}, {fromBlock: 0, toBlock: 'latest'})

        reputationIncreasedEvents.get((error, logs) => {
            assert.equal(logs.length, 1, "were emitted more than 1 event");
            assert.equal(logs[0].event, 'ReputationIncreased', "event type is not equal");
            assert.equal(logs[0].args._user, accounts[3], "_tokenOwner is not equal");
            assert.equal(logs[0].args._increasedBy, owner, "_increasedBy is not equal");
            assert.equal(new BigNumber(logs[0].args._pointsAdded).valueOf(), pointsToAdd.valueOf(), "_pointsAdded is not equal");
            assert.equal(new BigNumber(logs[0].args._currentReputation).valueOf(), new BigNumber('10').valueOf(), "_currentReputation is not equal");
            assert.equal(new BigNumber(logs[0].args._previousReputation).valueOf(), new BigNumber('0').valueOf(), "_previousReputation is not equal");
            
            console.log('ReputationIncreased Event:');
            logs.forEach(log => console.log(log.args));
        });

        balanceOf = await reputationBook.balanceOf(user);
        assert.equal(new BigNumber(balanceOf).valueOf(), new BigNumber('10').valueOf(), "balanceOf is not equal");
    });

    it('should not decrease reputation cause user == address(0)', async () => {
        let user = 0x0;
        let pointsToSub = new BigNumber('10');
        let balanceOf = await reputationBook.balanceOf(user);
        assert.equal(new BigNumber(balanceOf).valueOf(), new BigNumber('0').valueOf(), "balanceOf is not equal")

        await reputationBook.decreaseReputation(user, pointsToSub, {from: owner})
            .then(Utils.receiptShouldFailed)
            .catch(Utils.catchReceiptShouldFailed);

        balanceOf = await reputationBook.balanceOf(user);
        assert.equal(new BigNumber(balanceOf).valueOf(), new BigNumber('0').valueOf(), "balanceOf is not equal")
    });

    it('should not decrease reputation cause pointsToAdd == 0', async () => {
        let user = accounts[3];
        let pointsToSub = new BigNumber('0');
        let balanceOf = await reputationBook.balanceOf(user);
        assert.equal(new BigNumber(balanceOf).valueOf(), new BigNumber('0').valueOf(), "balanceOf is not equal")

        await reputationBook.decreaseReputation(user, pointsToSub, {from: owner})
            .then(Utils.receiptShouldFailed)
            .catch(Utils.catchReceiptShouldFailed);

        balanceOf = await reputationBook.balanceOf(user);
        assert.equal(new BigNumber(balanceOf).valueOf(), new BigNumber('0').valueOf(), "balanceOf is not equal")
    });

    it('should increase reputation and then decrease it', async () => {
        let user = accounts[3];
        let pointsToAdd = new BigNumber('10');
        let pointsToSub = new BigNumber('3');
        let balanceOf = await reputationBook.balanceOf(user);
        assert.equal(new BigNumber(balanceOf).valueOf(), new BigNumber('0').valueOf(), "balanceOf is not equal")

        await reputationBook.increaseReputation(user, pointsToAdd, {from: owner})
            .then(Utils.receiptShouldSucceed);

        balanceOf = await reputationBook.balanceOf(user);
        assert.equal(new BigNumber(balanceOf).valueOf(), new BigNumber('10').valueOf(), "balanceOf is not equal")

        let reputationIncreasedEvents = reputationBook.ReputationIncreased({}, {fromBlock: 0, toBlock: 'latest'})

        reputationIncreasedEvents.get((error, logs) => {
            assert.equal(logs.length, 1, "were emitted more than 1 event");
            assert.equal(logs[0].event, 'ReputationIncreased', "event type is not equal");
            assert.equal(logs[0].args._user, accounts[3], "_tokenOwner is not equal");
            assert.equal(logs[0].args._increasedBy, owner, "_increasedBy is not equal");
            assert.equal(new BigNumber(logs[0].args._pointsAdded).valueOf(), pointsToAdd.valueOf(), "_pointsAdded is not equal");
            assert.equal(new BigNumber(logs[0].args._currentReputation).valueOf(), new BigNumber('10').valueOf(), "_currentReputation is not equal");
            assert.equal(new BigNumber(logs[0].args._previousReputation).valueOf(), new BigNumber('0').valueOf(), "_previousReputation is not equal");
            
            console.log('ReputationIncreased Event:');
            logs.forEach(log => console.log(log.args));
        });

        await reputationBook.decreaseReputation(user, pointsToSub, {from: owner})
            .then(Utils.receiptShouldSucceed);

        balanceOf = await reputationBook.balanceOf(user);
        assert.equal(new BigNumber(balanceOf).valueOf(), new BigNumber('7').valueOf(), "balanceOf is not equal")
    });
});