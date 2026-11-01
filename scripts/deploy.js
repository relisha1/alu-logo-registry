// Deploys both contracts and registers the real ALU logo.
// Run: npx hardhat run scripts/deploy.js --network localhost
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with wallet:", deployer.address);

  // 1. Hash the actual logo file
  const logoPath = path.join(__dirname, "..", "alu-logo.png");
  if (!fs.existsSync(logoPath)) {
    throw new Error("alu-logo.png not found in the project folder");
  }
  const logoHash = "0x" + crypto.createHash("sha256").update(fs.readFileSync(logoPath)).digest("hex");
  console.log("ALU logo SHA-256:", logoHash);

  // 2. Deploy the registry
  const Registry = await hre.ethers.getContractFactory("ALUAssetRegistry");
  const registry = await Registry.deploy();
  await registry.waitForDeployment();
  console.log("ALUAssetRegistry deployed to:", await registry.getAddress());

  // 3. Register the logo straight away
  const tx = await registry.registerAsset("ALU Official Logo", "image/webp", logoHash);
  await tx.wait();
  const tokenId = await registry.totalAssets();
  console.log("Logo registered as NFT token ID:", tokenId.toString());

  const [ok, message] = await registry.verifyLogoIntegrity(tokenId, logoHash);
  console.log("Verification check:", ok, "-", message);

  // 4. Deploy the token, all 1,000,000 shares go to the deployer
  const Token = await hre.ethers.getContractFactory("ALULogoToken");
  const token = await Token.deploy(deployer.address);
  await token.waitForDeployment();
  console.log("ALULogoToken deployed to:", await token.getAddress());

  const balance = await token.balanceOf(deployer.address);
  console.log("Deployer ALUT balance:", balance.toString());
  console.log("Deployer ownership %:", (await token.ownershipPercentage(deployer.address)).toString());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
