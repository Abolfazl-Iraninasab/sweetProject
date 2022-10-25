// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

// NOTICE : this contract is only used for test and the main functionality of Sweet contract is completly independent of this contract

contract ISweetToken {
    function mint(address _to, uint256 _amount) public {}

    function burn(address _from, uint256 _amount) public {}

    function owner() public view returns (address) {}
}
