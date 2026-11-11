// verify page, works without a wallet

const fileInput = document.getElementById("file-input");
const preview = document.getElementById("preview");
const resultBox = document.getElementById("result");

fileInput.onchange = async function () {
  const file = fileInput.files[0];
  if (!file) return;

  preview.src = URL.createObjectURL(file);
  preview.hidden = false;

  const data = await file.arrayBuffer();
  const hash = await hashFile(data);
  await runCheck(hash);
};

document.getElementById("hash-btn").onclick = async function () {
  const hash = cleanHash(document.getElementById("hash-input").value);
  if (!hash) {
    showResult("bad", "&#9888;", "That is not a valid hash", "A SHA-256 hash has 64 letters and numbers.");
    return;
  }
  await runCheck(hash);
};

async function runCheck(hash) {
  resultBox.innerHTML = '<div class="status info">Checking...</div>';
  try {
    const result = await checkLogo(readRegistry, CONFIG.logoTokenId, hash);
    if (result.authentic) {
      const d = result.details;
      const info =
        "<p><b>Name:</b> " + d.name + "<br>" +
        "<b>Registered on:</b> " + d.registeredOn + "<br>" +
        "<b>Registered by:</b> " + shortAddress(d.registeredBy) + "</p>";
      showResult("good", "&#10004;", result.title, result.message + info);
    } else {
      showResult("bad", "&#9888;", result.title, result.message);
    }
  } catch (err) {
    console.log(err);
    showResult("bad", "&#9888;", "Could not check right now", "Check your internet connection and try again.");
  }
}

function showResult(type, icon, title, message) {
  resultBox.innerHTML =
    '<div class="result ' + type + '">' +
    '<div class="icon">' + icon + "</div>" +
    "<h2>" + title + "</h2>" +
    "<p>" + message + "</p>" +
    "</div>";
}
