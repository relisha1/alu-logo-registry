// helper functions used by the pages and by the tests

// returns the sha-256 hash of a file as "0x..." (bytes32)
async function hashFile(data) {
  const digest = await crypto.subtle.digest("SHA-256", data);
  const bytes = new Uint8Array(digest);
  let hex = "";
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, "0");
  }
  return "0x" + hex;
}

// returns null if the text is not a valid hash
function cleanHash(text) {
  let hash = text.trim().toLowerCase();
  if (!hash.startsWith("0x")) {
    hash = "0x" + hash;
  }
  if (hash.length != 66) {
    return null;
  }
  return hash;
}

function shortAddress(address) {
  return address.slice(0, 6) + "..." + address.slice(-4);
}

function formatNumber(value) {
  return Number(value).toLocaleString("en-US");
}

function formatDate(timestamp) {
  return new Date(Number(timestamp) * 1000).toLocaleString("en-GB");
}

async function getTotalSupplyText(token) {
  const supply = await token.totalSupply();
  return formatNumber(supply);
}

async function checkLogo(registry, tokenId, hash) {
  const result = await registry.verifyLogoIntegrity(tokenId, hash);

  if (result[0] == false) {
    return {
      authentic: false,
      title: "Warning: This logo has been modified.",
      message: "This file does not match the official ALU logo.",
    };
  }

  const asset = await registry.getAsset(tokenId);
  return {
    authentic: true,
    title: "Logo Verified: This is the authentic ALU logo",
    message: "This file is the same as the logo ALU registered on the blockchain.",
    details: {
      name: asset.name,
      registeredOn: formatDate(asset.timestamp),
      registeredBy: asset.registeredBy,
    },
  };
}

async function sendShares(token, recipient, amount) {
  const tx = await token.distributeShares(recipient, amount);
  const receipt = await tx.wait();
  return receipt;
}

function errorMessage(err) {
  const text = String(err.message);
  if (err.code == "ACTION_REJECTED") {
    return "You cancelled the transaction.";
  }
  if (text.includes("already been registered")) {
    return "This file is already registered.";
  }
  if (text.includes("OwnableUnauthorizedAccount")) {
    return "Only the contract owner can distribute shares.";
  }
  if (text.includes("insufficient funds")) {
    return "Not enough Sepolia ETH to pay for gas.";
  }
  return "Something went wrong: " + (err.shortMessage || err.message);
}

// so the tests can use these functions
if (typeof module != "undefined") {
  module.exports = { hashFile, getTotalSupplyText, checkLogo, sendShares };
}
