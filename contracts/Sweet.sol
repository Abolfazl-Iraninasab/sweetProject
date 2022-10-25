// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract IBNB {
    function balanceOf(address account) public view returns (uint256) {}

    function transfer(address to, uint256 amount) public returns (bool) {}

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) public returns (bool) {}

    function allowance(address owner, address spender)
        public
        view
        returns (uint256)
    {}

    function approve(address spender, uint256 amount) public returns (bool) {}
}

contract SweetToken is ERC20, Ownable {
    constructor() ERC20("SweetToken", "SWEET") {}

    function mint(address _to, uint256 _amount) public onlyOwner {
        _mint(_to, _amount);
    }

    function burn(address _from, uint256 _amount) public onlyOwner {
        _burn(_from, _amount);
    }
}

contract Factory {
    event log(string msg);

    SweetToken public sweetToken;

    constructor() {
        sweetToken = new SweetToken();
    }

    IBNB BNB = IBNB(0xB8c77482e45F1F44dE1745F52C74426C631bDD52);

    mapping(address => uint256) public balance;
    mapping(address => uint256) public withdrawalTime;

    // user should approve the amount before calling this function
    function deposit(uint256 _amount) public {
        require(
            BNB.allowance(msg.sender, address(this)) >= _amount,
            "insufficiant allowance!"
        );
        BNB.transferFrom(msg.sender, address(this), _amount);
        updateBalance(_amount);
        sweetToken.mint(msg.sender, _amount * 10);
    }

    function updateBalance(uint256 _amount) private {
        balance[msg.sender] += _amount;
        withdrawalTime[msg.sender] = block.timestamp + 7 days;
    }

    modifier checkWithdrawal() {
        require(
            balance[msg.sender] > 0,
            "You havn't deposited any BNB token! "
        );
        require(
            block.timestamp >= withdrawalTime[msg.sender],
            "please wait more! "
        );
        _;
    }

    function redeem() public checkWithdrawal {
        sweetToken.burn(msg.sender, balance[msg.sender] * 10);
        BNB.transfer(msg.sender, balance[msg.sender]) ;
    }

    function BNBbalance(address _addr) public view returns (uint256) {
        return BNB.balanceOf(_addr);
    }
}
