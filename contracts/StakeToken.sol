// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract StakeToken is IERC20 {
    using SafeMath for uint256;

    string public name;
    string public symbol;
    uint8 public decimals;
    uint256 override public totalSupply;
    address admin;
    uint256 public rewardRate;

    mapping(address => uint256) private balances;
    mapping(address => mapping(address => uint256)) private allowances;
    
    event RewardsClaimed(address indexed staker, uint256 amount);

    struct Staker {
        uint256 stakedAmount;
        uint256 startTime;
        uint256 rewardsEarned;
    }
    mapping(address => Staker) private stakers;

    constructor( string memory _name, string memory _symbol, uint8 _decimals, uint256 _rewardRate, uint _totalSupply )
    {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        totalSupply = _totalSupply;
        rewardRate = _rewardRate;
        balances[msg.sender] = _totalSupply;
        admin = msg.sender;
    }

    function balanceOf(address account) external view override returns (uint256)
    {
        return balances[account];
    }

    function transfer(address recipient, uint256 amount) external override returns (bool)
    {
        require(amount <= balances[msg.sender], "Insufficient balance");
        balances[msg.sender] = balances[msg.sender].sub(amount);
        balances[recipient] = balances[recipient].add(amount);
        emit Transfer(msg.sender, recipient, amount);
        return true;
    }

    function transferFrom( address sender, address recipient, uint256 amount) external override returns (bool) 
    {
        require(amount <= balances[sender], "Insufficient balance");
        require(amount <= allowances[sender][msg.sender], "Insufficient allowance");

        balances[sender] = balances[sender].sub(amount);
        balances[recipient] = balances[recipient].add(amount);
        allowances[sender][msg.sender] = allowances[sender][msg.sender].sub(amount);
        emit Transfer(sender, recipient, amount);
        return true;
    }

    function approve(address spender, uint256 amount) external override returns (bool)
    {
        allowances[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function allowance(address owner, address spender) external view override returns (uint256)
    {
        return allowances[owner][spender];
    }
    
    modifier onlyAdmin{
        require( msg.sender == admin, "Only Admin can run this function");
        _;
    }

    function mint(uint _qty) public onlyAdmin returns(uint){
        totalSupply += _qty;
        balances[msg.sender] += _qty;
        return totalSupply;
    }

    function burn(uint _qty) public onlyAdmin returns(uint){
        require(balances[msg.sender] >= _qty);
        totalSupply -= _qty;
        balances[msg.sender] = _qty;
        return totalSupply;
    }

    function stake(uint256 amount) external {
        require(amount > 0, "Staked amount must be greater than 0");
        require(balances[msg.sender] >= amount, "Insufficient balance");
        
        if (stakers[msg.sender].stakedAmount == 0) {
            stakers[msg.sender].startTime = block.timestamp;
        }

        balances[msg.sender] = balances[msg.sender].sub(amount);
        stakers[msg.sender].stakedAmount = stakers[msg.sender].stakedAmount.add(amount);

        emit Transfer(msg.sender, address(this), amount);
    }

    function unstake() external {
        require(stakers[msg.sender].stakedAmount > 0, "No staked amount");

        uint256 stakedAmount = stakers[msg.sender].stakedAmount;
        uint256 stakedDuration = (block.timestamp).sub(stakers[msg.sender].startTime);

        uint256 rewards = calculateRewards(stakedAmount, stakedDuration);
        uint256 totalAmount = stakedAmount.add(rewards);

        balances[msg.sender] = balances[msg.sender].add(totalAmount);

        delete stakers[msg.sender];

        emit Transfer(address(this), msg.sender, totalAmount);
    }

    function calculateRewards(uint256 amount, uint256 duration) internal view returns (uint256) {
        return amount.mul(rewardRate).mul(duration).div(1 days);
    }

    function claimRewards() external {
        require(stakers[msg.sender].stakedAmount > 0, "No staked amount");

        uint256 stakedAmount = stakers[msg.sender].stakedAmount;
        uint256 stakedDuration = block.timestamp.sub(stakers[msg.sender].startTime);

        uint256 rewards = calculateRewards(stakedAmount, stakedDuration);
        stakers[msg.sender].rewardsEarned = stakers[msg.sender].rewardsEarned.add(rewards);

        emit RewardsClaimed(msg.sender, rewards);
    }

    function getStakerData(address staker) external view returns (uint256, uint256, uint256) {
        Staker memory stakerData = stakers[staker];
        return (stakerData.stakedAmount, stakerData.startTime, stakerData.rewardsEarned);
    }
}

