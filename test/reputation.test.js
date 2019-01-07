const ReputationBook = artifacts.require('./ReputationBook');
const { decodeLogs } = require('./decodeLogs');
const abi = require('ethereumjs-abi');
const BigNumber = require('bignumber.js');
const Utils = require('./utils');

let ALLOWED_CREATOR = 1;
let ALLOWED_MODIFIER = 2;

contract('ReputationBook', accounts => {

    let reputationBook;
    let owner = accounts[0];
    let allowedAddress = accounts[1];

    beforeEach(async () => {
        let name = "TallyxReputationBook";
        let symbol = "TLX";
        reputationBook = await ReputationBook.new(name, symbol, { from: owner });
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

    it('should check that owner has permission to create avatar and modify avatar', async () => {
        let permissionSet = await reputationBook.permissions.call(owner);
        assert.equal(new BigNumber(permissionSet).valueOf(), new BigNumber('7').valueOf(), "permissions are not equal");
    });

    it('should check that random address has not permission to create avatar and modify avatar', async () => {
        let permissionSet = await reputationBook.permissions.call(allowedAddress);
        assert.equal(new BigNumber(permissionSet).valueOf(), new BigNumber('0').valueOf(), "permissions are not equal");
    });

    it('should update permission for avatar creating', async () => {
        await reputationBook.setPermission(allowedAddress, 2, { from: owner })
            .then(Utils.receiptShouldSucceed);

        let permissionSet = await reputationBook.permissions.call(allowedAddress);
        assert.equal(new BigNumber(permissionSet).valueOf(), new BigNumber('2').valueOf(), "permissions are not equal");
    });

    it('should not update permission for avatar creating cause _address == address(0)', async () => {
        await reputationBook.setPermission(0x0, 2, { from: owner })
            .then(Utils.receiptShouldFailed)
            .catch(Utils.catchReceiptShouldFailed);

        let permissionSet = await reputationBook.permissions.call(allowedAddress);
        assert.equal(new BigNumber(permissionSet).valueOf(), new BigNumber('0').valueOf(), "permissions are not equal");
    });

    it('should not update permission for avatar creating cause msg.sender != owner', async () => {
        await reputationBook.setPermission(allowedAddress, 2, { from: accounts[2] })
            .then(Utils.receiptShouldFailed)
            .catch(Utils.catchReceiptShouldFailed);

        let permissionSet = await reputationBook.permissions.call(allowedAddress);
        assert.equal(new BigNumber(permissionSet).valueOf(), new BigNumber('0').valueOf(), "permissions are not equal");
    });

    it('should update permission for avatar creating', async () => {
        await reputationBook.setPermission(allowedAddress, 4, { from: owner })
            .then(Utils.receiptShouldSucceed);

        let permissionSet = await reputationBook.permissions.call(allowedAddress);
        assert.equal(new BigNumber(permissionSet).valueOf(), new BigNumber('4').valueOf(), "permissions are not equal");
    });

    it('should not update permission for avatar creating cause _address == address(0)', async () => {
        await reputationBook.setPermission(0x0, 4, { from: owner })
            .then(Utils.receiptShouldFailed)
            .catch(Utils.catchReceiptShouldFailed);

        let permissionSet = await reputationBook.permissions.call(allowedAddress);
        assert.equal(new BigNumber(permissionSet).valueOf(), new BigNumber('0').valueOf(), "permissions are not equal");
    });

    it('should not update permission for avatar creating cause msg.sender != owner', async () => {
        await reputationBook.setPermission(allowedAddress, 4, { from: accounts[2] })
            .then(Utils.receiptShouldFailed)
            .catch(Utils.catchReceiptShouldFailed);

        let permissionSet = await reputationBook.permissions.call(allowedAddress);
        assert.equal(new BigNumber(permissionSet).valueOf(), new BigNumber('0').valueOf(), "permissions are not equal");
    });

    it('should create avatar', async () => {
        let avatarId = "CAsRZ28251QdhgOe5533QmjrsvJ030LsHWhDbME439"
        let user = accounts[2];
        let topId = "034dfcf3-066a-459b-ab62-3b8dbfa0ca76";
        let entityId = "c1eed55c-990e-464e-9a6e-d755ebc29145";
        let entityType = "Partner";
        let entityName = "Xi-Wong Trading";
        let IdVerifierId = "034dfcf3-066a-459b-ab62-3b8dbfa0ca76";

        await reputationBook.createAvatar(
            avatarId,
            user,
            topId,
            entityId,
            entityType,
            entityName,
            IdVerifierId,
            { from: owner }
        )
            .then(Utils.receiptShouldSucceed);

        let events = await reputationBook.AvatarCreated({}, { fromBlock: '0', toBlock: 'latest' });

        events.get((err, logs) => {
            assert.equal(logs.length, 1, "were emitted less or more than 1 event");
            assert.equal(logs[0].event, "AvatarCreated", "event type is not equal");
            assert.equal(logs[0].args._avatarId, avatarId, "avatarId is not equal");
            assert.equal(logs[0].args._topId, topId, "topId is not equal");
            assert.equal(logs[0].args._userAddress, user, "user is not equal");
            assert.equal(logs[0].args._reputationScore, '0', "reputation score is not equal");

            logs.forEach(log => console.log(log.args));
        });
    });

    it('should create avatar', async () => {
        let avatarId = "CAsRZ28251QdhgOe5533QmjrsvJ030LsHWhDbME439"
        let user = accounts[2];
        let topId = "034dfcf3-066a-459b-ab62-3b8dbfa0ca76";
        let entityId = "c1eed55c-990e-464e-9a6e-d755ebc29145";
        let entityType = "Partner";
        let entityName = "Xi-Wong Trading";
        let IdVerifierId = "034dfcf3-066a-459b-ab62-3b8dbfa0ca76";

        await reputationBook.createAvatar(
            avatarId,
            user,
            topId,
            entityId,
            entityType,
            entityName,
            IdVerifierId,
            { from: owner }
        )
            .then(Utils.receiptShouldSucceed);

        let events = await reputationBook.AvatarCreated({}, { fromBlock: '0', toBlock: 'latest' });

        events.get((err, logs) => {
            assert.equal(logs.length, 1, "were emitted less or more than 1 event");
            assert.equal(logs[0].event, "AvatarCreated", "event type is not equal");
            assert.equal(logs[0].args._avatarId, avatarId, "avatarId is not equal");
            assert.equal(logs[0].args._topId, topId, "topId is not equal");
            assert.equal(logs[0].args._userAddress, user, "user is not equal");
            assert.equal(logs[0].args._reputationScore, '0', "reputation score is not equal");

            logs.forEach(log => console.log(log.args));
        });

    });

    it('should not create avatar cause msg.sender != allowed avatar creator', async () => {
        let avatarId = "CAsRZ28251QdhgOe5533QmjrsvJ030LsHWhDbME439"
        let user = accounts[2];
        let topId = "034dfcf3-066a-459b-ab62-3b8dbfa0ca76";
        let entityId = "c1eed55c-990e-464e-9a6e-d755ebc29145";
        let entityType = "Partner";
        let entityName = "Xi-Wong Trading";
        let IdVerifierId = "034dfcf3-066a-459b-ab62-3b8dbfa0ca76";

        await reputationBook.createAvatar(
            avatarId,
            user,
            topId,
            entityId,
            entityType,
            entityName,
            IdVerifierId,
            { from: accounts[2] }
        )
            .then(Utils.receiptShouldFailed)
            .catch(Utils.catchReceiptShouldFailed);
    });

    it('should not create avatar cause user == address(0)', async () => {
        let avatarId = "CAsRZ28251QdhgOe5533QmjrsvJ030LsHWhDbME439"
        let user = accounts[2];
        let topId = "034dfcf3-066a-459b-ab62-3b8dbfa0ca76";
        let entityId = "c1eed55c-990e-464e-9a6e-d755ebc29145";
        let entityType = "Partner";
        let entityName = "Xi-Wong Trading";
        let IdVerifierId = "034dfcf3-066a-459b-ab62-3b8dbfa0ca76";

        await reputationBook.createAvatar(
            avatarId,
            0x0,
            topId,
            entityId,
            entityType,
            entityName,
            IdVerifierId,
            { from: owner }
        )
            .then(Utils.receiptShouldFailed)
            .catch(Utils.catchReceiptShouldFailed);
    });

    it('should not create avatar cause such avatar already exist', async () => {
        let avatarId = "CAsRZ28251QdhgOe5533QmjrsvJ030LsHWhDbME439"
        let user = accounts[2];
        let topId = "034dfcf3-066a-459b-ab62-3b8dbfa0ca76";
        let entityId = "c1eed55c-990e-464e-9a6e-d755ebc29145";
        let entityType = "Partner";
        let entityName = "Xi-Wong Trading";
        let IdVerifierId = "034dfcf3-066a-459b-ab62-3b8dbfa0ca76";

        await reputationBook.createAvatar(
            avatarId,
            user,
            topId,
            entityId,
            entityType,
            entityName,
            IdVerifierId,
            { from: owner }
        )
            .then(Utils.receiptShouldSucceed);

        await reputationBook.createAvatar(
            avatarId,
            user,
            topId,
            entityId,
            entityType,
            entityName,
            IdVerifierId,
            { from: owner }
        )
            .then(Utils.receiptShouldFailed)
            .catch(Utils.catchReceiptShouldFailed);
    });

    it('should get avatar', async () => {
        let avatarId = "CAsRZ28251QdhgOe5533QmjrsvJ030LsHWhDbME439"
        let user = accounts[2];
        let topId = "034dfcf3-066a-459b-ab62-3b8dbfa0ca76";
        let entityId = "c1eed55c-990e-464e-9a6e-d755ebc29145";
        let entityType = "Partner";
        let entityName = "Xi-Wong Trading";
        let IdVerifierId = "034dfcf3-066a-459b-ab62-3b8dbfa0ca76";

        await reputationBook.createAvatar(
            avatarId,
            user,
            topId,
            entityId,
            entityType,
            entityName,
            IdVerifierId,
            { from: owner }
        )
            .then(Utils.receiptShouldSucceed);

        let avatar = await reputationBook.getAvatar(avatarId);
        assert.equal(avatar[0], user, "userAddress is not equal");
        assert.equal(avatar[1], topId, "topId is not equal");
        assert.equal(avatar[2], entityId, "entityId is not equal");
        assert.equal(avatar[3], IdVerifierId, "IdVerifierId is not equal");

        assert.equal(web3.toAscii(avatar[5][0])[0], "0", "reputationScore is not equal");
    });

    it('should not get avatar cause such avatar was not created', async () => {
        let avatarId = "CAsRZ28251QdhgOe5533QmjrsvJ030LsHWhDbME439"

        await reputationBook.getAvatar(avatarId)
            .then(Utils.receiptShouldFailed)
            .catch(Utils.catchReceiptShouldFailed);
    });

    it('should update avatar reputation score', async () => {
        let avatarId = "CAsRZ28251QdhgOe5533QmjrsvJ030LsHWhDbME439"
        let user = accounts[2];
        let topId = "034dfcf3-066a-459b-ab62-3b8dbfa0ca76";
        let entityId = "c1eed55c-990e-464e-9a6e-d755ebc29145";
        let entityType = "Partner";
        let entityName = "Xi-Wong Trading";
        let IdVerifierId = "034dfcf3-066a-459b-ab62-3b8dbfa0ca76";

        await reputationBook.createAvatar(
            avatarId,
            user,
            topId,
            entityId,
            entityType,
            entityName,
            IdVerifierId,
            { from: owner }
        )
            .then(Utils.receiptShouldSucceed);

        await reputationBook.updateReputationScore("CAsRZ28251QdhgOe5533QmjrsvJ030LsHWhDbME439", "2")
            .then(Utils.receiptShouldSucceed);

        // let avatar = await reputationBook.getAvatar(avatarId);
        // assert.equal(avatar[0], user, "userAddress is not equal");
        // assert.equal(avatar[1], topId, "topId is not equal");
        // assert.equal(avatar[2], entityId, "entityId is not equal");
        // assert.equal(avatar[3], IdVerifierId, "IdVerifierId is not equal");

        // assert.equal(web3.toAscii(avatar[4][0])[0], "2", "reputationScore is not equal");  


        let events = await reputationBook.ReputationScoreUpdated({}, { fromBlock: '0', toBlock: 'latest' });

        events.get((err, logs) => {
            assert.equal(logs.length, 1, "were emitted less or more than 1 event");
            assert.equal(logs[0].event, "ReputationScoreUpdated", "event type is not equal");
            assert.equal(logs[0].args._reputationScore, '2', "reputation score is not equal");

            logs.forEach(log => console.log(log.args));
        });

    });

    it('should not update avatar reputation score cause there are not such avatar', async () => {
        let avatarId = "CAsRZ28251QdhgOe5533QmjrsvJ030LsHWhDbME439"
        let user = accounts[2];
        let topId = "034dfcf3-066a-459b-ab62-3b8dbfa0ca76";
        let entityId = "c1eed55c-990e-464e-9a6e-d755ebc29145";
        let entityType = "Partner";
        let entityName = "Xi-Wong Trading";
        let IdVerifierId = "034dfcf3-066a-459b-ab62-3b8dbfa0ca76";

        await reputationBook.createAvatar(
            avatarId,
            user,
            topId,
            entityId,
            entityType,
            entityName,
            IdVerifierId,
            { from: owner }
        )
            .then(Utils.receiptShouldSucceed);

        await reputationBook.updateReputationScore("123123", "2", { from: owner })
            .then(Utils.receiptShouldFailed)
            .catch(Utils.catchReceiptShouldFailed);

        let avatar = await reputationBook.getAvatar(avatarId);
        assert.equal(avatar[0], user, "userAddress is not equal");
        assert.equal(avatar[1], topId, "topId is not equal");
        assert.equal(avatar[2], entityId, "entityId is not equal");
        assert.equal(avatar[3], IdVerifierId, "IdVerifierId is not equal");

        assert.equal(web3.toAscii(avatar[5][0])[0], "0", "reputationScore is not equal");
    });
});