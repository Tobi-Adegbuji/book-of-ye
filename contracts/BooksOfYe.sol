// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract BooksOfYe is ERC1155, Ownable, ERC1155Burnable, ERC1155Supply {
    struct SaleEvent {
        uint256 price;
        bool isActive;
        bool isPreSale;
        bool isPublicSale;
        uint256 minCardId;
        uint256 maxCardId;
        mapping(address => bool) whitelist;
    }

    //TODO: Ensure only owner can change root
    bytes32 public root; 
    SaleEvent[] saleEvents;
    uint256[] public mintedCards;
    uint256 airdropInventory = 1000;
    uint256 airdropIdCounter = 200;
    uint256 public maxSupply = 5000;
    uint256 public mintLimit = 8;
    bool public airdropActive = false;
    string public baseURI;

    mapping(uint256 => string) private _URIS;
    mapping(address => uint256) public cardPurchaseTracker;
    mapping(address => bool) private luckTracker;
    mapping(address => bool) private claimedAirdrop;



    constructor(bytes32 _root) ERC1155(baseURI) {

        root = _root;

        SaleEvent storage saleEvent1 = saleEvents.push();
        SaleEvent storage saleEvent2 = saleEvents.push();
        SaleEvent storage saleEvent3 = saleEvents.push();
        SaleEvent storage saleEvent4 = saleEvents.push();
        SaleEvent storage saleEvent5 = saleEvents.push();
    }

    //Public Functions
     function airdropClaimMint(uint256[] memory cardIds) external{
        uint256 _maxSupply = maxSupply;
        uint256 _airdropInventory = airdropInventory;
        uint256 bonusMintAmount = cardIds.length * 5;
        uint256[] memory _cardids;

        require (airdropActive = true, "Airdrop is not active");
        // require merkle tree check here
        require(airdropInventory - _cardids.length >= 0, "No cards to claim");
        
        for (uint256 i = 0; i < bonusMintAmount; i++){
            _cardids.push(airdropIdCounter);
            airdropIdCounter++;
        }

        freeMint(msg.sender, _cardids);
        maxSupply = _maxSupply - _cardids.length;
        airdropInventory = _airdropInventory - _cardids.length;
        claimedAirdrop[msg.sender] = true;
        // figure out how to do this - mintedCards.push(cardIds);


    }


    function preSaleMint(uint256 eventNumber, uint256 cardId, bytes32[] memory proof) external payable {
        
        require(isValid(proof, keccak256(abi.encodePacked(msg.sender))), "Not a part of whitelist");

        uint256 price = saleEvents[eventNumber].price;
        uint256 _maxSupply = maxSupply;
        uint256 minCardId = saleEvents[eventNumber].minCardId;
        uint256 maxCardId = saleEvents[eventNumber].maxCardId;

        require(saleEvents[eventNumber].whitelist[msg.sender],"You Aren't On The Whitelist");
        require(tx.origin == msg.sender, "No Proxy Contracts");
        require(saleEvents[eventNumber].isActive, "Sale Is Not Active");
        require(saleEvents[eventNumber].isPreSale && !saleEvents[eventNumber].isPublicSale, "PreSale Not Live");
        require(cardId >= minCardId && cardId <= maxCardId, "Card Not For Sale");
        require(_maxSupply - 1 >= 0, "Sold Out");
        require(!exists(cardId), "Card Is Already Minted");
        require(cardPurchaseTracker[msg.sender] != mintLimit,"Mint Limit Reached");
        require(msg.value >= price, "Not Enough Ether Sent");

        _mint(msg.sender, cardId, 1, "");


        maxSupply = _maxSupply - 1;
        cardPurchaseTracker[msg.sender] = cardPurchaseTracker[msg.sender] + 1;
        mintedCards.push(cardId);
        
        
}

    function publicMint(uint256 eventNumber, uint256 cardId) external payable {
        uint256 price = saleEvents[eventNumber].price;
        uint256 _maxSupply = maxSupply;
        uint256 minCardId = saleEvents[eventNumber].minCardId;
        uint256 maxCardId = saleEvents[eventNumber].maxCardId;

        require(tx.origin == msg.sender, "No Proxy Contracts");
        require(saleEvents[eventNumber].isActive, "Sale Is Not Active");
        require(!saleEvents[eventNumber].isPreSale && saleEvents[eventNumber].isPublicSale, "Public Not Live");
        require(_maxSupply - 1 >= 0, "Sold Out");
        require(cardId >= minCardId && cardId <= maxCardId,"Card Not For Sale");
        require(!exists(cardId), "Card Is Already Minted");
        require(cardPurchaseTracker[msg.sender] != mintLimit,"Mint Limit Reached");
        require(msg.value >= price, "Not Enough Ether Sent");

        _mint(msg.sender, cardId, 1, "");

    }


    function checkWhitelist(uint256 eventNumber, address _address)
        external
        view
        returns (bool isUserWL)
    {
        isUserWL = saleEvents[eventNumber].whitelist[_address];
        return isUserWL;
    }


    function viewMintedCards() external view returns (uint256[] memory allMintedCards){
        allMintedCards = mintedCards;
        return allMintedCards;
    }

    //Only Owner Functions
    
     function presaleRootNodeChange() external onlyOwner {

    }

    function airdropRootNodeChange() external onlyOwner {
        
    }

    function setPriceAndInventory() external onlyOwner {
        
        saleEvents[0].price = 100000000000000000;
        saleEvents[1].price = 100000000000000000;
        saleEvents[2].price = 100000000000000000;
        saleEvents[3].price = 100000000000000000;
        saleEvents[4].price = 100000000000000000;
        saleEvents[0].minCardId = 0;
        saleEvents[1].minCardId = 1000;
        saleEvents[2].minCardId = 2000;
        saleEvents[3].minCardId = 3000;
        saleEvents[4].minCardId = 4000;
        saleEvents[0].maxCardId = 999;
        saleEvents[1].maxCardId = 1999;
        saleEvents[2].maxCardId = 2999;
        saleEvents[3].maxCardId = 3999;
        saleEvents[4].maxCardId = 4999;

       
    }

    function batchGiftMint(
        address[] memory _addresses,
        uint256[] memory cardId
    ) external onlyOwner {
        for (uint256 i = 0; i < _addresses.length; i++) {
            require(
                cardId[i] < 5000,
                "The Card Number Selected Does Not Exist"
            );
            require(
                maxSupply - cardId.length >= 0,
                "Sorry, There Aren't Anymore Available Cards"
            );
            require(
                !exists(cardId[i]),
                "A Card Selected Already Belongs To Someone Else"
            );

            _mint(_addresses[i], cardId[i], 1, "0x");
            maxSupply = maxSupply - cardId.length;
            mintedCards.push(cardId[i]);
        }
    }

    function editMinMaxCardId(
        uint256 eventNumber,
        uint256 _newMin,
        uint256 _newMax
    ) external onlyOwner {
        require(
            _newMin >= 0 && _newMin < 4999,
            "Your new minimum is either below 0 or over 4999"
        );
        require(
            _newMax >= 0 && _newMax < 4999,
            "Your new maximum is either below 0 or over 999"
        );
        require(
            _newMin != _newMax,
            "Your minimum and maximum cannot be the same number"
        );

        saleEvents[eventNumber].minCardId = _newMin;
        saleEvents[eventNumber].maxCardId = _newMax;
    }

    function editSaleStatus(
        uint256 eventNumber,
        bool _isActive,
        bool _isPreSale,
        bool _isPublicSale
    ) external onlyOwner {
        require(eventNumber <= 4);
        saleEvents[eventNumber].isActive = _isActive;
        saleEvents[eventNumber].isPreSale = _isPreSale;
        saleEvents[eventNumber].isPublicSale = _isPublicSale;
    }

    function alterMintLimit(uint256 newLimit) external onlyOwner {
        mintLimit = newLimit;
    }

    function viewSaleStatus(uint256 eventNumber)
        external
        view
        returns (
            uint256 price,
            bool isActive,
            bool isPreSale,
            bool isPublicSale,
            uint256 minCardId,
            uint256 maxCardId
        )
    {
        price = saleEvents[eventNumber].price;
        isActive = saleEvents[eventNumber].isActive;
        isPreSale = saleEvents[eventNumber].isPreSale;
        isPublicSale = saleEvents[eventNumber].isPublicSale;
        minCardId = saleEvents[eventNumber].minCardId;
        maxCardId = saleEvents[eventNumber].maxCardId;
        return (
            price,
            isActive,
            isPreSale,
            isPublicSale,
            minCardId,
            maxCardId
        );
    }

    function editSalePrice(uint256 eventNumber, uint256 _newPriceInWei)
        external
        onlyOwner
    {
        require(eventNumber <= 4);
        saleEvents[eventNumber].price = _newPriceInWei;
    }

    function batchAddToWhitelist(
        address[] memory _addresses,
        uint256 eventNumber
    ) external onlyOwner {
        for (uint256 i = 0; i < _addresses.length; i++) {
            saleEvents[eventNumber].whitelist[_addresses[i]] = true;
            
        }
    }

    function batchRemoveFromWhitelist(
        address[] memory _addresses,
        uint256 eventNumber
    ) external onlyOwner {
        for (uint256 i = 0; i < _addresses.length; i++) {
            require(
                saleEvents[eventNumber].whitelist[_addresses[i]] != false,
                "One of these users is already not on WL. Use the Check WhiteList function to solve"
            );
            saleEvents[eventNumber].whitelist[_addresses[i]] = false;
        
        }
    }

    function withdraw(address payable _to) public onlyOwner {
        require(_to != address(0), "Token cannot be zero address.");
        _to.transfer(address(this).balance);
    }

    function setTokenURI(string memory _newURI) public onlyOwner {
        baseURI = _newURI;
    }

    function contractURI() public pure returns (string memory) {
        return "ipfs://QmcCVnnRiy7TAgREHxKJJrcZLCSBmz2fYm1Lum5vjVY6Ge";
    }

    //Misc Functions

    function uri(uint256 _tokenId)
        public
        view
        override
        returns (string memory)
    {
        if (bytes(_URIS[_tokenId]).length != 0) {
            return string(_URIS[_tokenId]);
        }
        return
            string(
                abi.encodePacked(baseURI, Strings.toString(_tokenId), ".json")
            );
    }

     function isValid(bytes32[] memory proof, bytes32 leaf) private view returns (bool){ 
        return MerkleProof.verify(proof, root, leaf); 
    }

    function freeMint(
        address _address,
        uint256[] memory cardId
    ) private {
        for (uint256 i = 0; i < cardId.length; i++) {
            require(
                cardId[i] < 5000,
                "The Card Number Selected Does Not Exist"
            );
            require(
                maxSupply - cardId.length >= 0,
                "Sorry, There Aren't Anymore Available Cards"
            );
            require(
                !exists(cardId[i]),
                "A Card Selected Already Belongs To Someone Else"
            );

            _mint(_address, cardId[i], 1, "0x");
            maxSupply = maxSupply - cardId.length;
            mintedCards.push(cardId[i]);
        }
    }

    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal override(ERC1155, ERC1155Supply) {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
    }

    fallback() external payable {}

    receive() external payable {}
}