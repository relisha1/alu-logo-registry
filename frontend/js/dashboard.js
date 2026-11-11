// token dashboard

const holdersTable = document.getElementById("holders");
const ownerNote = document.getElementById("owner-note");
const sendBtn = document.getElementById("distribute-btn");
const statusBox = document.getElementById("status");

let owner = null;
let holders = EXAMPLE_WALLETS.slice();

function showStatus(type, text) {
  statusBox.innerHTML = '<div class="status ' + type + '">' + text + "</div>";
}

async function loadDashboard() {
  document.getElementById("total-supply").innerText = (await getTotalSupplyText(readToken)) + " ALUT";
  owner = await readToken.owner();
  await loadHolders();
  await loadMyStats();
}

async function loadHolders() {
  let rows = "";
  for (const h of holders) {
    const balance = await readToken.balanceOf(h.address);
    const percent = await readToken.ownershipPercentage(h.address);
    rows += "<tr><td>" + h.label + "</td><td>" + shortAddress(h.address) + "</td><td>" +
      formatNumber(balance) + "</td><td>" + percent + "%</td></tr>";
  }
  holdersTable.innerHTML = rows;
}

async function loadMyStats() {
  if (!userAddress) {
    document.getElementById("my-balance").innerText = "-";
    document.getElementById("my-percent").innerText = "-";
    document.getElementById("connect-hint").hidden = false;
    ownerNote.innerText = "Connect the owner wallet to distribute shares.";
    sendBtn.disabled = true;
    return;
  }

  document.getElementById("connect-hint").hidden = true;
  const balance = await readToken.balanceOf(userAddress);
  const percent = await readToken.ownershipPercentage(userAddress);
  document.getElementById("my-balance").innerText = formatNumber(balance) + " ALUT";
  document.getElementById("my-percent").innerText = percent + "%";

  if (owner == null) {
    owner = await readToken.owner();
  }
  if (owner.toLowerCase() == userAddress.toLowerCase()) {
    ownerNote.innerText = "You are the contract owner, so you can send shares.";
    sendBtn.disabled = false;
  } else {
    ownerNote.innerText = "Only the owner (" + shortAddress(owner) + ") can distribute shares. The contract would reject your wallet.";
    sendBtn.disabled = true;
  }
}

document.getElementById("lookup-btn").onclick = async function () {
  const address = document.getElementById("lookup-input").value.trim();
  if (!ethers.isAddress(address)) {
    alert("Please enter a valid wallet address.");
    return;
  }
  holders.push({ label: "Checked wallet", address: address });
  await loadHolders();
};

document.getElementById("distribute-form").onsubmit = async function (event) {
  event.preventDefault();
  const recipient = document.getElementById("recipient").value.trim();
  const amount = Number(document.getElementById("amount").value);

  if (!ethers.isAddress(recipient)) {
    showStatus("error", "Please enter a valid recipient address.");
    return;
  }
  if (!Number.isInteger(amount) || amount <= 0) {
    showStatus("error", "The amount must be a whole number bigger than 0.");
    return;
  }
  const myBalance = await readToken.balanceOf(userAddress);
  if (amount > Number(myBalance)) {
    showStatus("error", "You only have " + formatNumber(myBalance) + " ALUT.");
    return;
  }

  sendBtn.disabled = true;
  try {
    showStatus("info", "Approve the transaction in your wallet...");
    const receipt = await sendShares(token, recipient, amount);
    showStatus("success", "&#10004; Sent " + formatNumber(amount) + " ALUT to " + shortAddress(recipient) +
      '. <a href="' + CONFIG.explorer + "/tx/" + receipt.hash + '" target="_blank">View on Etherscan</a>');

    const alreadyListed = holders.some((h) => h.address.toLowerCase() == recipient.toLowerCase());
    if (!alreadyListed) {
      holders.push({ label: "New holder", address: recipient });
    }
    await loadDashboard();
    await showWallet();
  } catch (err) {
    console.log(err);
    showStatus("error", errorMessage(err));
  }
  sendBtn.disabled = false;
};

document.addEventListener("walletchange", loadMyStats);
loadDashboard();
