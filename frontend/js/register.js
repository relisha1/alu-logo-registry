// register page

const fileInput = document.getElementById("file-input");
const preview = document.getElementById("preview");
const hashText = document.getElementById("hash-text");
const contentHash = document.getElementById("content-hash");
const fileType = document.getElementById("file-type");
const registerBtn = document.getElementById("register-btn");
const statusBox = document.getElementById("status");

function showStatus(type, text) {
  statusBox.innerHTML = '<div class="status ' + type + '">' + text + "</div>";
}

function updateButton() {
  registerBtn.disabled = !userAddress || contentHash.value == "";
  if (!userAddress) {
    showStatus("info", "Connect your wallet to register a logo.");
  } else {
    statusBox.innerHTML = "";
  }
}

document.addEventListener("walletchange", updateButton);
updateButton();

fileInput.onchange = async function () {
  const file = fileInput.files[0];
  if (!file) return;

  preview.src = URL.createObjectURL(file);
  preview.hidden = false;

  const hash = await hashFile(await file.arrayBuffer());
  hashText.innerText = "SHA-256: " + hash;
  hashText.hidden = false;
  contentHash.value = hash;

  if (fileType.value == "") {
    fileType.value = file.name.split(".").pop().toUpperCase();
  }
  updateButton();
};

document.getElementById("register-form").onsubmit = async function (event) {
  event.preventDefault();
  const name = document.getElementById("asset-name").value.trim();
  const type = fileType.value.trim();
  const hash = contentHash.value;

  if (name == "" || type == "") {
    showStatus("error", "Please enter a name and a file type.");
    return;
  }

  registerBtn.disabled = true;
  try {
    // check first so we can show a clear message
    if (await readRegistry.isHashRegistered(hash)) {
      showStatus("error", "This file is already registered, so it can't be registered again.");
      registerBtn.disabled = false;
      return;
    }

    showStatus("info", "Approve the transaction in your wallet...");
    const tx = await registry.registerAsset(name, type, hash);
    showStatus("info", "Waiting for confirmation...");
    await tx.wait();

    const tokenId = await readRegistry.totalAssets();
    showStatus("success", "&#10004; Registered! Your logo is token #" + tokenId +
      '. <a href="' + CONFIG.explorer + "/tx/" + tx.hash + '" target="_blank">View on Etherscan</a>');
  } catch (err) {
    console.log(err);
    showStatus("error", errorMessage(err));
  }
  registerBtn.disabled = false;
};
