pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/token/ERC721/ERC721Token.sol"; 
import "./Strings.sol";
import "./Permissions.sol";

contract ReputationBook is ERC721Token, Ownable, Strings, Permissions {
    using SafeMath for uint256;

    // Struct that implements Avatar (user) entity inside Tallyx system 
    struct Avatar {
        address userAddress;
        string avatarId;
        string topId;
        string entityId;
        bytes32 entityType;
        string entityName;
        string IdVerifierId;
        string reputationScore;
        bool created;
    }

    // Mapping from token id to hashed avatar id
    mapping (uint256 => bytes32) public numericIdToHashedAvatarId;

    // Mapping from hashed avatar id to token id
    mapping (bytes32 => uint256) public hashedAvatarIdToNumericId;

    // Mapping from token id to Avatar data
    mapping (uint256 => Avatar) public avatars;

    /** 
     * @dev Constructor for ReputationBook smart contract for Tallyx system
     * @param _name - Name for ERC721 based avatar assets
     * @param _symbol - Symbol for ERC721 based avatar assets
     */
    constructor(
        string _name,
        string _symbol
    ) 
        public
        ERC721Token(_name, _symbol)
        Permissions()
    {
        permissions[msg.sender] = PERMISSION_SET_PERMISSION | PERMISSION_TO_CREATE | 
            PERMISSION_TO_MODIFY;
    }

    /** 
     * @dev Disallowed transferFrom function
     */
    function transferFrom(
        address,
        address,
        uint256
    ) public {
        require(false, ERROR_DISALLOWED);
    }

    /**
     * @dev Disallowed approve function
     */
    function approve(
        address, 
        uint256
    ) public {
        require(false, ERROR_DISALLOWED);
    }

    /**
     * @dev Disallowed setApprovalForAll function
     */
    function setApprovalForAll(
        address, 
        bool
    ) public {
        require(false, ERROR_DISALLOWED);
    }

    /** 
     * @dev Adds new user to registry, by minting ERC721 token extended with user metadata
     * @param _avatarId - Unique identifier of user inside Tallyx system
     * @param _user - Address
     * @notice Other function params - ids inside Tallyx system
     */
    function createAvatar(
        string _avatarId,
        address _user,
        string _topId,
        string _entityId,
        bytes32 _entityType,
        string _entityName,
        string _IdVerifierId
    )
        public
        hasPermission(msg.sender, PERMISSION_TO_CREATE)
        returns (bool)
    {
        bytes32 hashedAvatarId = keccak256(bytes(_avatarId));
        uint256 tokenId = allTokens.length.add(1);

        require(
            _user != address(0) &&
            balanceOf(_user) == 0 &&
            numericIdToHashedAvatarId[tokenId][0] == 0 &&
            avatars[hashedAvatarIdToNumericId[hashedAvatarId]].created == false
        );
        
        super._mint(_user, tokenId);

        numericIdToHashedAvatarId[tokenId] = hashedAvatarId;
        hashedAvatarIdToNumericId[hashedAvatarId] = tokenId;

        avatars[tokenId].userAddress = _user;
        avatars[tokenId].avatarId = _avatarId;
        avatars[tokenId].topId = _topId;
        avatars[tokenId].entityId = _entityId;
        avatars[tokenId].entityType = _entityType;
        avatars[tokenId].entityName = _entityName;
        avatars[tokenId].IdVerifierId = _IdVerifierId;
        avatars[tokenId].reputationScore = "0";
        avatars[tokenId].created = true;

        return true;
    }

    /**
     * @dev Returns avatar information from registry (address,
     * avatar reputation and avatar metadata)
     * @param _avatarId - Unique identifier of Avatar entity inside Tallyx system
     */
    function getAvatar(string _avatarId)
        public
        view
        returns (
            address,
            string,
            string,
            string,
            string,
            bytes32[2]
        )
    {
        bytes32 hashedAvatarId = keccak256(bytes(_avatarId));        
        
        require(
            avatars[hashedAvatarIdToNumericId[hashedAvatarId]].created == true &&
            numericIdToHashedAvatarId[hashedAvatarIdToNumericId[hashedAvatarId]][0] != 0 
        );

        Avatar storage avatar = avatars[hashedAvatarIdToNumericId[hashedAvatarId]];
        bytes32[2] memory avatarSymbolicData;
        
        avatarSymbolicData[0] = toBytes32(avatar.reputationScore);
        avatarSymbolicData[1] = avatar.entityType;

        return (
            avatar.userAddress,
            avatar.topId,
            avatar.entityId,
            avatar.IdVerifierId,
            avatar.entityName,
            avatarSymbolicData
        );
    }

    /**
     * @dev Updates user(avatar) reputation and hashed metadata in registry 
     * @param _avatarId - Unique identifier of avatar entity
     * @param _newReputationScore - New reputation score
     */
    function updateReputationScore(
        string _avatarId,
        string _newReputationScore
    )
        public
        hasPermission(msg.sender, PERMISSION_TO_MODIFY)
        returns (bool)
    {
        bytes32 hashedAvatarId = keccak256(bytes(_avatarId));

        require(
            avatars[hashedAvatarIdToNumericId[hashedAvatarId]].created == true &&
            numericIdToHashedAvatarId[hashedAvatarIdToNumericId[hashedAvatarId]][0] != 0 &&
            exists(hashedAvatarIdToNumericId[hashedAvatarId]) == true &&
            ownerOf(hashedAvatarIdToNumericId[hashedAvatarId]) == 
                avatars[hashedAvatarIdToNumericId[hashedAvatarId]].userAddress
        );

        Avatar storage avatar = avatars[hashedAvatarIdToNumericId[hashedAvatarId]];
        avatar.reputationScore = _newReputationScore;
        return true;
    }
}