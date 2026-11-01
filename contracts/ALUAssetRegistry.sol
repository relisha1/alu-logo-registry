// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

// Registers the ALU logo as an NFT by storing its SHA-256 hash
contract ALUAssetRegistry is ERC721 {
    struct AssetMetadata {
        string name;
        string fileType;
        bytes32 contentHash;
        address registeredBy;
        uint256 timestamp;
    }

    uint256 private _tokenIdCounter;

    mapping(uint256 => AssetMetadata) private _assets;
    mapping(bytes32 => bool) private _hashRegistered; // used to block duplicates

    event AssetRegistered(
        uint256 indexed tokenId,
        address indexed owner,
        bytes32 contentHash,
        string name,
        uint256 timestamp
    );

    constructor() ERC721("ALU Asset Registry", "ALUAR") {}

    function registerAsset(
        string memory name,
        string memory fileType,
        bytes32 contentHash
    ) public returns (uint256) {
        require(contentHash != bytes32(0), "Content hash cannot be empty");
        require(!_hashRegistered[contentHash], "This asset has already been registered");

        _tokenIdCounter++;
        uint256 tokenId = _tokenIdCounter;

        // save state before minting since _safeMint can call the receiver
        _hashRegistered[contentHash] = true;
        _assets[tokenId] = AssetMetadata({
            name: name,
            fileType: fileType,
            contentHash: contentHash,
            registeredBy: msg.sender,
            timestamp: block.timestamp
        });

        _safeMint(msg.sender, tokenId);

        emit AssetRegistered(tokenId, msg.sender, contentHash, name, block.timestamp);
        return tokenId;
    }

    // compares a given hash with the stored one (view, so no gas)
    function verifyLogoIntegrity(uint256 tokenId, bytes32 contentHash)
        public
        view
        returns (bool, string memory)
    {
        _requireOwned(tokenId);

        if (_assets[tokenId].contentHash == contentHash) {
            return (true, "Logo is authentic.");
        }
        return (false, "Warning: logo does not match.");
    }

    function getAsset(uint256 tokenId) public view returns (AssetMetadata memory) {
        _requireOwned(tokenId);
        return _assets[tokenId];
    }

    function isHashRegistered(bytes32 contentHash) public view returns (bool) {
        return _hashRegistered[contentHash];
    }

    function totalAssets() public view returns (uint256) {
        return _tokenIdCounter;
    }
}
