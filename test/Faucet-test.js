const { expect } = require("chai");
//const { ethers } = require("hardhat");
//const hre = require("hardhat");
const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");

// Test suite for the TokenFaucet contract
describe("Token Faucet", function () {
  console.log("Faucet Ready for: ");
  async function deployFaucetFixture() {
    // Initial values for testing
    const initialSupply = 1000000;
    const requestLimit = 100;
    const requestCooldown = 60;

    // default signer
    const [signer, user1, user2] = await ethers.getSigners();

    const TokenFaucet = await ethers.getContractFactory("TokenFaucet");
    const tokenFaucet = await TokenFaucet.deploy(
      initialSupply,
      requestLimit,
      requestCooldown,
      { from: signer }
    );

    //await tokenFaucet.waitForDeployment();

    return {
      tokenFaucet,
      signer,
      user1,
      user2,
      initialSupply,
      requestLimit,
      requestCooldown,
    };
  }
  describe("Deployment", function () {
    //test #1
    it("Should set the right owner of the faucet", async function () {
      const { tokenFaucet, signer } = await loadFixture(deployFaucetFixture);
      expect(await tokenFaucet.owner()).to.equal(signer.address);
    });
    //test#2
    it("should set initial supply greater than request limit and assign owner", async function () {
      const { tokenFaucet, signer } = await loadFixture(deployFaucetFixture);
      const initialSupply = await tokenFaucet.balanceOf(signer.address);
      expect(await tokenFaucet.requestTokens()).to.be.lessThan(initialSupply);
    });
  });

  // Additional test cases can be added to cover edge cases, security checks, and additional features.
});
