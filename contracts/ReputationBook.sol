pragma solidity ^0.4.24;

import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';
import 'openzeppelin-solidity/contracts/math/SafeMath.sol'; 
import 'openzeppelin-solidity/contracts/token/ERC721/ERC721Token.sol'; 

contract ReputationBook is ERC721Token, Ownable {
    using SafeMath for uint256;

    struct User {
        uint256 avatarId;
        bytes metadata;
        uint256 reputation;
    }

    mapping (address => uint256) public userTokenIds;

    mapping (address => uint256) public userAvatarIds;

    mapping (uint256 => User) public reputations;

    mapping (uint256 => bool) public claimedAvatarIds;

    mapping (address => bool) private changeAgent;

    modifier onlyChangeAgents() {
        require(changeAgent[msg.sender] == true);
        _;
    }

    event ReputationIncreased(
        address _user,
        address _increasedBy,
        uint256 _pointsAdded,
        uint256 _currentReputation,
        uint256 _previousReputation
    );

    event ReputationDecreased(
        address _user,
        address _decreasedBy,
        uint256 _pointsSubstracted,
        uint256 _currentReputation,
        uint256 _previousReputation
    );

    constructor(
        string _name,
        string _symbol
    ) 
        public
        ERC721Token(_name, _symbol)
    {
        changeAgent[msg.sender] = true;
    }

    function isChangeAgent(address _user)
        public
        view
        returns (bool)
    {
        return changeAgent[_user];
    }

    function updateChangeAgent(
        address _agent,
        bool _status
    )
        public
        onlyOwner
    {
        require(
            _agent != address(0) &&
            changeAgent[_agent] != _status
        );
        changeAgent[_agent] = _status;
    }

    function createUser(
        uint256 _avatarId,
        address _user,
        bytes _metadata
    )
        public
        onlyChangeAgents
        returns (bool)
    {
        require(
            _user != address(0) &&
            userAvatarIds[_user] == 0 &&
            claimedAvatarIds[_avatarId] == false &&
            balanceOf(_user) == 0 &&
            _avatarId > 0
        );

        uint256 tokenId = allTokens.length;
        super._mint(_user, tokenId);

        reputations[tokenId] = User({
            avatarId: _avatarId,
            metadata: _metadata,
            reputation: 0
        });

        claimedAvatarIds[_avatarId] = true;
        userAvatarIds[_user] = _avatarId;
        userTokenIds[_user] = tokenId;

        return true;
    }

    function getReputation(address _user)
        public
        view
        returns (uint256)
    {
        require(
            _user != address(0) &&
            userAvatarIds[_user] != 0
        );
        return reputations[userTokenIds[_user]].reputation;
    }

    function increaseReputation(
        address _user,
        uint256 _valueToAdd
    )
        public
        onlyChangeAgents
    {
        require(_user != address(0));
            
        User storage user = reputations[userTokenIds[_user]];

        require(
            _valueToAdd > 0 &&
            userAvatarIds[_user] == user.avatarId
        );

        uint256 prevReputation = user.reputation;
        user.reputation = user.reputation.add(_valueToAdd);

        emit ReputationIncreased(
            _user,
            msg.sender,
            _valueToAdd,
            user.reputation,
            prevReputation
        );
    }

    function decreaseReputation(
        address _user,
        uint256 _valueToSub
    )
        public
        onlyChangeAgents
    {
        User storage user = reputations[userTokenIds[_user]];

        require(
            _user != address(0) &&
            _valueToSub > 0 &&
            _valueToSub <= user.reputation &&
            userAvatarIds[_user] == user.avatarId
        );

        uint256 prevReputation = user.reputation;
        user.reputation = user.reputation.sub(_valueToSub);

        emit ReputationDecreased(
            _user,
            msg.sender,
            _valueToSub,
            user.reputation,
            prevReputation
        );
    }
}