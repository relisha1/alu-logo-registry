// wallet connection, used on every page

// read only contracts, these work without a wallet
const readProvider = new ethers.JsonRpcProvider(CONFIG.rpcUrl);
const readRegistry = new ethers.Contract(CONFIG.registryAddress, REGISTRY_ABI, readProvider);
const readToken = new ethers.Contract(CONFIG.tokenAddress, TOKEN_ABI, readProvider);

// these get set when the user connects
let userAddress = null;
let registry = null;
let token = null;

const walletBox = document.getElementById("wallet-box");
const walletMessage = document.getElementById("wallet-message");

function showMessage(text) {
  walletMessage.innerHTML = text;
  walletMessage.hidden = text == "";
}

function showConnectButton() {
  walletBox.innerHTML = '<button id="connect-btn" class="btn">Connect Wallet</button>';
  document.getElementById("connect-btn").onclick = connectWallet;
}

async function connectWallet() {
  if (!window.ethereum) {
    showMessage('No wallet found. Install <a href="https://metamask.io" target="_blank">MetaMask</a> and refresh. You can still verify a logo without one.');
    return;
  }
  try {
    await window.ethereum.request({ method: "eth_requestAccounts" });
    localStorage.removeItem("disconnected");
    await setupWallet();
  } catch (err) {
    showMessage("Could not connect the wallet.");
  }
}

async function setupWallet() {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const network = await provider.getNetwork();

  if (Number(network.chainId) != CONFIG.chainId) {
    walletBox.innerHTML = '<button id="switch-btn" class="btn btn-warn">Switch to Sepolia</button>';
    document.getElementById("switch-btn").onclick = switchNetwork;
    showMessage("Your wallet is on the wrong network. Please switch to Sepolia.");
    return;
  }

  const signer = await provider.getSigner();
  userAddress = await signer.getAddress();
  registry = new ethers.Contract(CONFIG.registryAddress, REGISTRY_ABI, signer);
  token = new ethers.Contract(CONFIG.tokenAddress, TOKEN_ABI, signer);

  showMessage("");
  await showWallet();
  document.dispatchEvent(new Event("walletchange"));
}

async function showWallet() {
  const balance = await readToken.balanceOf(userAddress);
  walletBox.innerHTML =
    '<span class="address">' + shortAddress(userAddress) + "</span>" +
    '<span class="balance">' + formatNumber(balance) + " ALUT</span>" +
    '<button id="disconnect-btn" class="btn btn-small">Disconnect</button>';
  document.getElementById("disconnect-btn").onclick = disconnectWallet;
}

async function switchNetwork() {
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: CONFIG.chainIdHex }],
    });
  } catch (err) {
    showMessage("Please switch to Sepolia in your wallet.");
  }
}

function disconnectWallet() {
  userAddress = null;
  registry = null;
  token = null;
  localStorage.setItem("disconnected", "yes");
  showConnectButton();
  document.dispatchEvent(new Event("walletchange"));
}

async function startWallet() {
  showConnectButton();
  if (!window.ethereum) return;

  window.ethereum.on("accountsChanged", function (accounts) {
    if (accounts.length == 0) {
      disconnectWallet();
    } else {
      setupWallet();
    }
  });
  window.ethereum.on("chainChanged", function () {
    window.location.reload();
  });

  // connect again if the user was connected before
  if (localStorage.getItem("disconnected") != "yes") {
    const accounts = await window.ethereum.request({ method: "eth_accounts" });
    if (accounts.length > 0) {
      await setupWallet();
    }
  }
}

startWallet();
