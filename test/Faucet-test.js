const { expect } = require("chai");
const hre = require("hardhat");
const { ethers } = require("hardhat");

describe("TokenFaucet contract", function () {
  let TokenFaucet;
  let hardhatTokenFaucet;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  beforeEach(async function () {
    TokenFaucet = await ethers.getContractFactory("TokenFaucet");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    hardhatTokenFaucet = await TokenFaucet.deploy(
      "TokenFaucet",
      "TF",
      1000000,
      1000,
      60
    );

    await hardhatTokenFaucet.waitForDeployment();
    console.log(
      "HardhatTokenFaucet Contract Address:",
      await hardhatTokenFaucet.getAddress()
    );
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await hardhatTokenFaucet.owner()).to.equal(owner.address);
    });

    it("Should assign the total supply of tokens to the owner", async function () {
      const ownerBalance = await hardhatTokenFaucet.balanceOf(owner.address);
      expect(await hardhatTokenFaucet.totalSupply()).to.equal(ownerBalance);
    });
  });

  describe("Token request", function () {
    it("Should transfer tokens to the user", async function () {
      const initialOwnerBalance = await hardhatTokenFaucet.balanceOf(
        owner.address
      );
      const initialContractBalance = await hardhatTokenFaucet.balanceOf(
        hardhatTokenFaucet.address
      );

      await hardhatTokenFaucet.connect(addr1).requestTokens();

      const finalOwnerBalance = await hardhatTokenFaucet.balanceOf(
        owner.address
      );
      const finalContractBalance = await hardhatTokenFaucet.balanceOf(
        hardhatTokenFaucet.address
      );

      expect(finalOwnerBalance).to.equal(initialOwnerBalance.sub(1000));
      expect(finalContractBalance).to.equal(initialContractBalance.add(1000));
    });

    it("Should update the last request timestamp", async function () {
      await hardhatTokenFaucet.connect(addr1).requestTokens();

      const lastRequestTimestamp =
        await hardhatTokenFaucet.lastRequestTimestamp(addr1.address);
      expect(lastRequestTimestamp).to.be.gt(0);
    });

    it("Should emit an event when tokens are requested", async function () {
      await expect(hardhatTokenFaucet.connect(addr1).requestTokens())
        .to.emit(hardhatTokenFaucet, "TokensRequested")
        .withArgs(addr1.address, 1000);
    });

    it("Should not allow a user to request tokens within the cooldown period", async function () {
      await hardhatTokenFaucet.connect(addr1).requestTokens();
      await hardhatTokenFaucet.connect(addr1).requestTokens();
    });

    it("Should not allow a user to request tokens if the faucet has insufficient tokens", async function () {
      await hardhatTokenFaucet.connect(owner).setRequestLimit(1000001);
      await hardhatTokenFaucet.connect(addr1).requestTokens();
    });
  });

  describe("Owner-only functions", function () {
    it("Should set a new request limit", async function () {
      await hardhatTokenFaucet.connect(owner).setRequestLimit(2000);
      expect(await hardhatTokenFaucet.requestLimit()).to.equal(2000);
    });

    it("Should set a new request cooldown period", async function () {
      await hardhatTokenFaucet.connect(owner).setRequestCooldown(120);
      expect(await hardhatTokenFaucet.requestCooldown()).to.equal(120);
    });

    it("Should not allow a non-owner to set a new request limit", async function () {
      await expect(
        hardhatTokenFaucet.connect(addr1).setRequestLimit(2000)
      ).to.be.revertedWith("Not the owner");
    });

    it("Should not allow a non-owner to set a new request cooldown period", async function () {
      await expect(
        hardhatTokenFaucet.connect(addr1).setRequestCooldown(120)
      ).to.be.revertedWith("Not the owner");
    });
  });

  describe("Edge cases", function () {
    it("Should not allow a user to request 0 tokens", async function () {
      await hardhatTokenFaucet.connect(owner).setRequestLimit(0);
      await expect(
        hardhatTokenFaucet.connect(addr1).requestTokens()
      ).to.be.revertedWith("Not enough tokens in the faucet");
    });

    it("Should not allow a user to request more tokens than the total supply", async function () {
      await hardhatTokenFaucet.connect(owner).setRequestLimit(1000001);
      await expect(
        hardhatTokenFaucet.connect(addr1).requestTokens()
      ).to.be.revertedWith("Not enough tokens in the faucet");
    });

    it("Should not allow the owner to set a request limit greater than the total supply", async function () {
      await expect(
        hardhatTokenFaucet.connect(owner).setRequestLimit(1000001)
      ).to.be.revertedWith("Request limit must be less than the total supply");
    });

    it("Should not allow the owner to set a request cooldown period of 0", async function () {
      await expect(
        hardhatTokenFaucet.connect(owner).setRequestCooldown(0)
      ).to.be.revertedWith("Cooldown period must be greater than 0");
    });
  });
});
