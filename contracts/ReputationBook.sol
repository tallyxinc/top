pragma solidity ^0.4.24;

import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';
import 'openzeppelin-solidity/contracts/math/SafeMath.sol'; 

contract ReputationBook is Ownable {
    using SafeMath for uint256;

    string private _name;

    string private _symbol;

    mapping (address => uint256) public userReputations;

    mapping (address => bool) public changeAgent;

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

    function balanceOf(address _user) 
        public
        view
        returns (uint256)
    {
        return userReputations[_user];
    }

    function name() public view returns (string) {
        return _name;
    }

    function symbol() public view returns (string) {
        return _symbol;
    }

    constructor(
        string name_, 
        string symbol_
    ) public {
        changeAgent[msg.sender] = true;
        _name = name_;
        _symbol = symbol_;
    }

    function updateChangeAgent(
        address _agent, 
        bool _status
    )   
        public 
        onlyOwner
    {
        require(_agent != address(0));
        changeAgent[_agent] = _status;
    }

    function increaseReputation(
        address _user, 
        uint256 _pointsToAdd
    ) 
        public 
        onlyChangeAgents
    {
        require(_user != address(0));
        require(_pointsToAdd > 0);
        userReputations[_user] = userReputations[_user].add(_pointsToAdd);

        emit ReputationIncreased(
            _user,
            msg.sender,
            _pointsToAdd,
            userReputations[_user],
            userReputations[_user].sub(_pointsToAdd)
        );
    }

    function decreaseReputation(
        address _user,
        uint256 _pointsToSub
    )
        public 
        onlyChangeAgents
    {
        require(_user != address(0));
        require(_pointsToSub > 0);
        userReputations[_user] = userReputations[_user].sub(_pointsToSub);

        emit ReputationDecreased(
            _user,
            msg.sender,
            _pointsToSub,
            userReputations[_user],
            userReputations[_user].add(_pointsToSub)
        );
    }
}