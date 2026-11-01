const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

// Hash of the real ALU logo in the project folder
const LOGO_HASH =
  "0x" +
  crypto
    .createHash("sha256")
    .update(fs.readFileSync(path.join(__dirname, "..", "alu-logo.png")))
    .digest("hex");

// A different hash, like a logo with one pixel changed
const FAKE_HASH = "0x" + crypto.createHash("sha256").update("not the real logo").digest("hex");

describe("ALU Logo Protection", function () {
  // ---------- Part B: ALUAssetRegistry ----------
  describe("ALUAssetRegistry", function () {
    async function deployRegistry() {
      const [owner, other] = await ethers.getSigners();
      const Registry = await ethers.getContractFactory("ALUAssetRegistry");
      const registry = await Registry.deploy();
      return { registry, owner, other };
    }

    async function deployAndRegister() {
      const { registry, owner, other } = await deployRegistry();
      await registry.registerAsset("ALU Official Logo", "image/webp", LOGO_HASH);
      return { registry, owner, other };
    }

    it("1. registers the ALU logo and returns a token ID", async function () {
      const { registry, owner } = await loadFixture(deployRegistry);

      // staticCall shows the return value without sending the transaction
      const tokenId = await registry.registerAsset.staticCall("ALU Official Logo", "image/webp", LOGO_HASH);
      expect(tokenId).to.equal(1n);

      await expect(registry.registerAsset("ALU Official Logo", "image/webp", LOGO_HASH))
        .to.emit(registry, "AssetRegistered");

      expect(await registry.ownerOf(1)).to.equal(owner.address);
    });

    it("2. rejects registering the same hash a second time", async function () {
      const { registry, other } = await loadFixture(deployAndRegister);

      await expect(
        registry.connect(other).registerAsset("Copied Logo", "image/webp", LOGO_HASH)
      ).to.be.revertedWith("This asset has already been registered");
    });

    it("3. verifyLogoIntegrity returns true for the correct hash", async function () {
      const { registry } = await loadFixture(deployAndRegister);

      const [ok, message] = await registry.verifyLogoIntegrity(1, LOGO_HASH);
      expect(ok).to.equal(true);
      expect(message).to.equal("Logo is authentic.");
    });

    it("4. verifyLogoIntegrity returns false for a wrong hash", async function () {
      const { registry } = await loadFixture(deployAndRegister);

      const [ok, message] = await registry.verifyLogoIntegrity(1, FAKE_HASH);
      expect(ok).to.equal(false);
      expect(message).to.equal("Warning: logo does not match.");
    });

    it("5. getAsset returns the right name and file type", async function () {
      const { registry, owner } = await loadFixture(deployAndRegister);

      const asset = await registry.getAsset(1);
      expect(asset.name).to.equal("ALU Official Logo");
      expect(asset.fileType).to.equal("image/webp");
      expect(asset.contentHash).to.equal(LOGO_HASH);
      expect(asset.registeredBy).to.equal(owner.address);
    });
  });

  // ---------- Part C: ALULogoToken ----------
  describe("ALULogoToken", function () {
    async function deployToken() {
      const [owner, faculty, student] = await ethers.getSigners();
      const Token = await ethers.getContractFactory("ALULogoToken");
      const token = await Token.deploy(owner.address);
      return { token, owner, faculty, student };
    }

    it("6. mints all 1,000,000 ALUT to the logo owner", async function () {
      const { token, owner } = await loadFixture(deployToken);

      expect(await token.totalSupply()).to.equal(1_000_000n);
      expect(await token.balanceOf(owner.address)).to.equal(1_000_000n);
      expect(await token.name()).to.equal("ALU Logo Token");
      expect(await token.symbol()).to.equal("ALUT");
    });

    it("7. distributeShares sends tokens to a recipient", async function () {
      const { token, owner, faculty } = await loadFixture(deployToken);

      await token.distributeShares(faculty.address, 100_000);

      expect(await token.balanceOf(faculty.address)).to.equal(100_000n);
      expect(await token.balanceOf(owner.address)).to.equal(900_000n);
    });

    it("8. ownershipPercentage returns the right percentage", async function () {
      const { token, owner, faculty, student } = await loadFixture(deployToken);

      await token.distributeShares(faculty.address, 500_000);
      await token.distributeShares(student.address, 100_000);

      expect(await token.ownershipPercentage(faculty.address)).to.equal(50n);
      expect(await token.ownershipPercentage(student.address)).to.equal(10n);
      expect(await token.ownershipPercentage(owner.address)).to.equal(40n);
    });
  });
});
