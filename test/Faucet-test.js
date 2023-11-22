const { expect, assert } = require("chai");
const { ethers } = require("hardhat");
const hre = require("hardhat");
const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");

// Test suite for the TokenFaucet contract
describe("TokenFaucet", function () {
  let tokenFaucet, owner, user1, user2;

  before("Deploy the contract instance", async function () {
    const TokenFaucet = await ethers.getContractFactory("TokenFaucet");
    const tokenFaucet = await ethers.deployContract();
    //await tokenFaucet.deployed();
    // default signer
    const [owner, user1, user2] = await ethers.provider.getSigner();
    //signer address
    //[ownerAddress] = await ethers.provider.listAccounts();
  });
  //only the owner can deploy the contract
  it("Owner should be the deployer of the contract", async function () {
    expect(await tokenFaucet.owner()).to.equal(owner.address);
  });

  // Additional test cases can be added to cover edge cases, security checks, and additional features.
});
