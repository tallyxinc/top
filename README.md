# Reputation Book
## Overview

Reputation book is a registry of users from Tallyx system, it stores user internal system rate, his metadata, and avatarId, which is like the primary key to all platform data.
## Internal process

The entry point to all functionality of Reputation Book is a call of 'createUser' function, which mints for selected user ERC721 token extended with user data presented by hashed internal information, avatarId and system reputation. Once the user is created, his reputation could be increased or decreased, ERC721 token initial features was trimmed, regarding that fact that avatarId is unique and may be tied only to 1 Ethereum address.

## Functions

1.  **setPermission( address _address, uint256 _permission)**
Allow/Disallow(depends on _permission value) function call permissions for selected address _address - receiver of permissions
**Return value:** void

2. **createAvatar( string _avatarId, address _user, string _topId, string _entityId, string _entityType, string _entityName, string _IdVerifierId)**
Adds new user to registry, by minting ERC721 token extended with user metadata _avatarId - unique identifier of user inside Tallyx system. 
_user - address 
(_topId, _entityId, _entityType, _entityName, _IdVerifierId, _reputationScore) - internal Tallyx system metadata
**Return value:** bool
**Sample return value:** true

3.  **getAvatar(uint256 _avatarId)**
Returns user(avatar) information from registry (user address, his reputation and metadata) _avatarId - unique identifier of user inside Tallyx system
**Return value:**  (address, string, string, string, bytes32[3])
**Sample return value**: (0xb9dcbf8a52edc0c8dd9983fcc1d97b1f5d975ed7, "1500", "034dfcf3", "c1eed55c", ["Partner", "Xi-Wong Trading", "034dfcf3"])

4.  **updateReputationScore( string _avatarId, string _newReputationScore)**
Updates user(avatar) reputation and hashed metadata in registry _avatarId - unique identifier of user inside Tallyx system 
_reputation - reputation value of user inside Tallyx system 
_newReputationScore - new reputation score 
**Return value:** bool
**Sample return value:** false
