# ALU Logo Registry

This project protects the official ALU logo on Ethereum. I built and tested it on a local Hardhat blockchain and also deployed it to the Sepolia testnet. It has two contracts. `ALUAssetRegistry` is an ERC-721 (NFT) contract that stores the SHA-256 hash of the logo file, who registered it and when. Anyone can hash their own copy of the logo and check it against the stored hash to see if it is the real one. `ALULogoToken` is an ERC-20 contract that splits ownership of the logo into 1,000,000 ALUT tokens (shares). The NFT proves *which file* is the official logo, and the tokens show *who owns how much* of it.

## ALU logo hash

File: `alu-logo.png`

```
SHA-256: 102109d75b09daff117165acb7a2c5d062f252bdab6e9fc83f460b475f957ea5
```

To check it yourself:

```bash
node scripts/hash-logo.js
```

or on Windows PowerShell: `Get-FileHash alu-logo.png -Algorithm SHA256`

## Sepolia testnet deployment

Besides the local Hardhat network, I deployed both contracts to the Sepolia testnet using Remix IDE and MetaMask.

| | Address |
| --- | --- |
| ALUAssetRegistry | [0x134eD2C5d179CcE082fE0A3823BDC63e99F24944](https://sepolia.etherscan.io/address/0x134eD2C5d179CcE082fE0A3823BDC63e99F24944) |
| ALULogoToken | [0x852207366C6e07F8bDad37817957F80e2Ca88e60](https://sepolia.etherscan.io/address/0x852207366C6e07F8bDad37817957F80e2Ca88e60) |
| Deployer / logo owner wallet | [0xa8d2f2f9c46021c7dac6e7ba450a39e1b5775ff7](https://sepolia.etherscan.io/address/0xa8d2f2f9c46021c7dac6e7ba450a39e1b5775ff7) |

Remix settings: compiler 0.8.24, EVM version cancun, optimization on (200 runs).

## Versions

- Solidity: 0.8.24
- Hardhat: 2.29.1
- OpenZeppelin Contracts: 5.6.1
- Node.js: 22.17.1

## How to run it

1. Install Node.js (v18 or newer) from nodejs.org.
2. Clone the repo and go into the folder:
   ```bash
   git clone https://github.com/relisha1/alu-logo-registry.git
   cd alu-logo-registry
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Compile the contracts:
   ```bash
   npx hardhat compile
   ```
5. Run the 8 tests:
   ```bash
   npx hardhat test
   ```
6. Start a local blockchain (leave this terminal open):
   ```bash
   npx hardhat node
   ```
   It prints 20 test wallets, each with 10,000 fake ETH.
7. In a second terminal, deploy both contracts and register the logo:
   ```bash
   npx hardhat run scripts/deploy.js --network localhost
   ```

## Project structure

```
contracts/ALUAssetRegistry.sol   ERC-721 logo registry
contracts/ALULogoToken.sol       ERC-20 ownership shares (ALUT)
scripts/deploy.js                deploys both and registers the logo
scripts/hash-logo.js             prints the SHA-256 of alu-logo.png
test/ALUAssetRegistry.test.js    8 tests
alu-logo.png                     the logo file that was hashed
```

## Notes on the contracts

- `registerAsset` updates the mappings before calling `_safeMint`, so the hash is already marked as used if the receiver contract tries to call back in.
- `verifyLogoIntegrity` and `getAsset` revert if the token ID does not exist, instead of returning empty data.
- `ALULogoToken` uses 0 decimals, so 1 token = 1 share. This keeps `ownershipPercentage` simple (500,000 tokens returns 50).
- There is no mint function after the constructor, so the supply can never go above 1,000,000.

## Problems I ran into

- **Logo file type.** The logo I downloaded from the ALU website was saved as `alu-logo.png`, but it is really a WebP image (the website serves WebP). I kept the original file unchanged so the hash matches what ALU publishes, and registered it with the file type `image/webp` instead of `image/png`.
- **Two "Documents" folders.** My project ended up in `C:\Users\Elisha\Documents` while File Explorer was showing `OneDrive\Documents`. I moved the project next to the logo in the OneDrive folder.
- **`Function "mcopy" not found` when compiling.** The latest OpenZeppelin 5.x uses the `mcopy` opcode, which only exists from the Cancun EVM upgrade. Hardhat was compiling for an older EVM version, so I added `evmVersion: "cancun"` to the Solidity settings in `hardhat.config.js`.
- **New VS Code terminal couldn't find `npx`.** VS Code was opened before Node was added to my PATH, so new terminals didn't see it. I added it to the current terminal with `$env:Path += ";$HOME\nodejs\node-v22.17.1-win-x64"`, and restarting VS Code fixes it for good.
- **`npm` not recognised / scripts disabled in PowerShell.** Node.js wasn't installed and the Windows Installer service was broken, so I used the Node.js zip version and added it to my PATH. Then I ran `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` so PowerShell would allow `npm` to run.
