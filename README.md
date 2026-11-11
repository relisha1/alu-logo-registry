# ALU Logo Registry dApp

This project protects the official ALU logo on Ethereum and gives people a website to use it.

In Formative 1 I wrote two smart contracts. `ALUAssetRegistry` is an ERC-721 (NFT) contract that stores the SHA-256 hash of the logo file, who registered it and when. `ALULogoToken` is an ERC-20 contract that splits ownership of the logo into 1,000,000 ALUT tokens (shares).

In Formative 2 I added a dApp in the `frontend/` folder so anyone can use the contracts from a browser:

- **Verify a Logo** (`index.html`): upload a logo or paste a hash and see if it's the real ALU logo. No wallet needed. It hashes the file in the browser and calls `verifyLogoIntegrity()` and `getAsset()` on ALUAssetRegistry.
- **Register** (`register.html`): hash a file in the browser and register it with `registerAsset()` on ALUAssetRegistry. Needs a wallet.
- **Token Dashboard** (`dashboard.html`): shows the total supply, your balance and ownership %, and a list of holders using `totalSupply()`, `balanceOf()` and `ownershipPercentage()` on ALULogoToken. The contract owner can send shares with `distributeShares()`.

### How the frontend connects to the contracts

The frontend uses ethers.js with the contract ABIs (`frontend/js/abi.js`, copied from the Hardhat artifacts) and the Sepolia addresses in `frontend/js/config.js`.

- **Reading data** (verify page, dashboard numbers) goes through a public Sepolia node with `ethers.JsonRpcProvider`, so it works without a wallet and costs no gas.
- **Sending transactions** (register, distribute shares) goes through the user's wallet with `ethers.BrowserProvider`, so the user approves and signs every transaction in MetaMask.

## ALU logo hash

File: `alu-logo.png`

```
SHA-256: 102109d75b09daff117165acb7a2c5d062f252bdab6e9fc83f460b475f957ea5
```

To check it yourself: `npm run hash`, or on Windows PowerShell `Get-FileHash alu-logo.png -Algorithm SHA256`.

## Sepolia testnet deployment

I deployed both contracts to Sepolia using Remix IDE and MetaMask (compiler 0.8.24, EVM version cancun, optimizer on with 200 runs). The dApp uses these addresses.

| | Address |
| --- | --- |
| ALUAssetRegistry | [0x134eD2C5d179CcE082fE0A3823BDC63e99F24944](https://sepolia.etherscan.io/address/0x134eD2C5d179CcE082fE0A3823BDC63e99F24944) |
| ALULogoToken | [0x852207366C6e07F8bDad37817957F80e2Ca88e60](https://sepolia.etherscan.io/address/0x852207366C6e07F8bDad37817957F80e2Ca88e60) |
| Logo owner wallet | [0xa8d2f2f9c46021c7dac6e7ba450a39e1b5775ff7](https://sepolia.etherscan.io/address/0xa8d2f2f9c46021c7dac6e7ba450a39e1b5775ff7) |

## Versions

- Node.js: 22.17.1
- Hardhat: 2.29.1
- Solidity: 0.8.24
- OpenZeppelin Contracts: 5.6.1
- ethers.js: 6.17.0 (in the frontend and the tests)
- Frontend: plain HTML, CSS and JavaScript, no framework

## How to run it

1. Install Node.js (v18 or newer) from nodejs.org.
2. Clone the repo and install the dependencies:
   ```bash
   git clone https://github.com/relisha1/alu-logo-registry.git
   cd alu-logo-registry
   npm install
   ```
3. Compile the contracts and run all 13 tests:
   ```bash
   npx hardhat compile
   npx hardhat test
   ```
4. Start the dApp:
   ```bash
   npm run frontend
   ```
   Then open http://localhost:8080 in Chrome or Brave. The frontend has no build step and no extra dependencies, it just needs to be served over http (MetaMask doesn't work on `file://` pages). Any static server works, for example `python -m http.server 8080` inside the `frontend` folder.

## Using the dApp

### Connecting a wallet

1. Install MetaMask and switch it to the **Sepolia** test network. You need a bit of Sepolia ETH (from a faucet) to register or send shares.
2. Click **Connect Wallet** at the top of any page and approve it in MetaMask.
3. The header shows your short address (like `0xa8d2...5ff7`) and your ALUT balance.
4. If you're on the wrong network, a **Switch to Sepolia** button appears. **Disconnect** makes the site forget your wallet.

### Verify a logo (no wallet needed)

Choose a logo file, or paste a SHA-256 hash and click **Check**. A green box means it's the authentic ALU logo and shows its name, registration date and the wallet that registered it. A red box means the file has been changed.

### Register a logo

Connect your wallet, choose a file, and the hash fills in by itself. Enter a name and file type, click **Register on the blockchain** and approve it in MetaMask. When it's confirmed, the page shows the new token ID. If the file is already registered, the page tells you and doesn't send anything.

### Token dashboard

Anyone can see the total supply and the holders table, and add any wallet to the table with **Check any wallet**. If you connect the owner wallet, you can enter a recipient and an amount and click **Send shares**. Other wallets see the form disabled with a message saying only the owner can use it.

## Tests

`test/ALUAssetRegistry.test.js` has 13 tests:

- 1–5: ALUAssetRegistry (Formative 1)
- 6–8: ALULogoToken (Formative 1)
- 9–13: frontend integration. These call the same helper functions the pages use (`frontend/js/dapp.js`) against freshly deployed contracts: reading the total supply as "1,000,000", hashing the logo file to bytes32, showing the success and failure verification results, and updating the recipient's balance after `distributeShares()`.

## Project structure

```
contracts/ALUAssetRegistry.sol   ERC-721 logo registry
contracts/ALULogoToken.sol       ERC-20 ownership shares (ALUT)
scripts/deploy.js                deploys both contracts locally and registers the logo
scripts/hash-logo.js             prints the SHA-256 of alu-logo.png
test/ALUAssetRegistry.test.js    13 tests
frontend/index.html              Verify a Logo page (public)
frontend/register.html           Register page
frontend/dashboard.html          Token Dashboard
frontend/css/style.css           styles
frontend/js/config.js            Sepolia settings, contract addresses, example wallets
frontend/js/abi.js               contract ABIs from the Hardhat artifacts
frontend/js/dapp.js              shared helpers (hashing, verifying, sending shares)
frontend/js/wallet.js            wallet connection in the header
frontend/js/verify.js, register.js, dashboard.js   code for each page
frontend/js/ethers.umd.min.js    ethers.js library
alu-logo.png                     the logo file that was hashed
```

## Libraries and sources

- [ethers.js v6](https://docs.ethers.org/v6/) (MIT licence). `frontend/js/ethers.umd.min.js` is copied unchanged from the `ethers` npm package that comes with the Hardhat Toolbox.
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/5.x/) for ERC-721, ERC-20 and Ownable.
- [MDN: SubtleCrypto.digest()](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest) for in-browser SHA-256 hashing.
- [MetaMask docs](https://docs.metamask.io/wallet/) for `eth_requestAccounts`, `wallet_switchEthereumChain` and the account and network change events.

## Known issues and limitations

- The verify page only checks against token #1, the official ALU logo. Other registered assets aren't checked.
- Reading data uses a free public Sepolia node (publicnode.com). If it's down or slow, the verify page and dashboard can't load numbers until it's back.
- `ownershipPercentage()` returns whole numbers, so holders with under 1% show as 0%.
- Websites can't fully log you out of MetaMask. **Disconnect** removes the site's permission (where the wallet supports it) and forgets the wallet, but MetaMask itself stays unlocked.
- The "Students" example wallet on the dashboard is a placeholder address with no shares yet.
- Tested with MetaMask in Chrome. Other wallets that inject `window.ethereum` should work but I haven't tested them.

## Notes on the contracts

- `registerAsset` updates the mappings before calling `_safeMint`, so the hash is already marked as used if the receiver contract tries to call back in.
- `verifyLogoIntegrity` and `getAsset` revert if the token ID doesn't exist, instead of returning empty data.
- `ALULogoToken` uses 0 decimals, so 1 token = 1 share.
- There's no mint function after the constructor, so the supply can never go above 1,000,000.

## Problems I ran into

- **Logo file type.** The logo I downloaded from the ALU website was saved as `alu-logo.png`, but it's really a WebP image. I kept the file unchanged so the hash matches, and registered it as `image/webp`.
- **`Function "mcopy" not found` when compiling.** OpenZeppelin 5.x uses the `mcopy` opcode, which needs the Cancun EVM, so I added `evmVersion: "cancun"` to `hardhat.config.js`.
- **Node.js on Windows.** The Windows Installer service was broken, so I used the Node.js zip version, added it to my PATH, and ran `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` so PowerShell would run `npm`.
- **Remix lost my contracts after a refresh.** The contracts were still on Sepolia; I just had to reconnect them with "Add Contract" and their addresses.
