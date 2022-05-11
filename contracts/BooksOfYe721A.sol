// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "erc721a/contracts/ERC721A.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";


contract BooksOfYe is ERC721A, Ownable {
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
    bytes32 public root1;
    bytes32 public root2; 
    SaleEvent[] saleEvents;
    uint256[] public mintedCards;
    uint256 public airdropInventory = 999;
    uint256 public maxSupply = 5000;
    uint256 public mintLimit = 8;
    uint256[] private cardIdsToMint;

    bool public airdropActive = true;
    string public baseURI;

    mapping(uint256 => string) private _URIS;
    mapping(address => uint256) public cardPurchaseTracker;
    mapping(address => bool) private luckTracker;
    mapping(address => uint256) public airdropTracker;
    mapping(address => bool) public claimedReimbursement;



    constructor(bytes32 _root, bytes32 _root2) ERC721A("Books of Ye", "BoY") {

        root1 = _root;
        root2 = _root2;
        SaleEvent storage saleEvent1 = saleEvents.push();
        SaleEvent storage saleEvent2 = saleEvents.push();
        SaleEvent storage saleEvent3 = saleEvents.push();
        SaleEvent storage saleEvent4 = saleEvents.push();
        SaleEvent storage saleEvent5 = saleEvents.push();
        _safeMint(msg.sender, 200);

    }

    //Public Functions
    function airdropMint(address sender, bytes32[] memory proof) external{

        require(isAirdropValid(proof, keccak256(abi.encodePacked(sender))), "Not a part of whitelist");

        uint256 _maxSupply = maxSupply;
        uint256 maxCardId = saleEvents[0].maxCardId;
        uint256 _airdropInventory = airdropInventory;
        uint256 cardsOwned = balanceOf(msg.sender);
        uint256 quantity = cardsOwned * 5;

        require (airdropActive = true, "Not yet active");
        require(!claimedReimbursement[msg.sender], "You've already been reimbursed");
        require(totalSupply() <= _maxSupply, "No more to claim");
        
        _safeMint(msg.sender, quantity);
        maxSupply = _maxSupply - quantity;
        airdropInventory = _airdropInventory - quantity;
        claimedReimbursement[msg.sender] = true;
        // figure out how to do this - mintedCards.push(cardIds);
    }

    function checkWhitelist(address sender, bytes32[] memory proof) external view returns (bool){
        return isPresaleValid(proof, keccak256(abi.encodePacked(sender))); 
    }


    function preSaleMint(uint256 eventNumber, uint256 quantity, bytes32[] memory proof) external payable {
        

        uint256 price = saleEvents[eventNumber].price;
        uint256 _maxSupply = maxSupply;
        uint256 maxCardId = saleEvents[eventNumber].maxCardId;
        
        require(isPresaleValid(proof, keccak256(abi.encodePacked(msg.sender))), "Not a part of whitelist");
        require(totalSupply() + quantity <= _maxSupply, "Sold Out");
        require(saleEvents[eventNumber].isActive, "Sale Is Not Active");
        require(saleEvents[eventNumber].isPreSale && !saleEvents[eventNumber].isPublicSale, "PreSale Not Live");
        require(totalSupply() <= maxCardId, "Card Not For Sale");
        require(cardPurchaseTracker[msg.sender] != mintLimit,"Mint Limit Reached");
        require(msg.value >= (price * quantity), "Not Enough Ether Sent");

        _safeMint(msg.sender, quantity);
        maxSupply = _maxSupply - quantity; 
    }

    function publicMint(uint256 eventNumber, uint256 quantity) external payable {
        uint256 price = saleEvents[eventNumber].price;
        uint256 _maxSupply = maxSupply;
        uint256 currentId = totalSupply();
        uint256 maxCardId = saleEvents[eventNumber].maxCardId;

        require(totalSupply() + quantity <= _maxSupply, "Sold Out");
        require(saleEvents[eventNumber].isActive, "Sale Is Not Active");
        require(!saleEvents[eventNumber].isPreSale && saleEvents[eventNumber].isPublicSale, "Public Not Live");
        require(currentId <= maxCardId, "Card Not For Sale");
        require(cardPurchaseTracker[msg.sender] != mintLimit,"Mint Limit Reached");
        require(msg.value >= (price * quantity), "Not Enough Ether Sent");

        _safeMint(msg.sender, quantity);
        maxSupply = _maxSupply - quantity; 

    }


    function viewMintedCards() external view returns (uint256[] memory allMintedCards){
        allMintedCards = mintedCards;
        return allMintedCards;
    }

    //Only Owner Functions
    
    function airdropRootNodeChange(bytes32 newRoot) external onlyOwner {
        root1 = newRoot;
    }

    function presaleRootNodeChange(bytes32 newRoot) external onlyOwner {
        root2 = newRoot;

    }

    function batchSafeTransfer(address from, address[] memory to, uint256[] memory tokenId) external onlyOwner {
        
        for(uint256 i = 0; i < to.length; i++){
            safeTransferFrom(from, to[i],tokenId[i]);
        }
    }

    function setPriceAndInventory() external onlyOwner {
        
        saleEvents[0].price = 100000000000000000;
        saleEvents[1].price = 100000000000000000;
        saleEvents[2].price = 100000000000000000;
        saleEvents[3].price = 100000000000000000;
        saleEvents[4].price = 100000000000000000;
        saleEvents[0].maxCardId = 999;
        saleEvents[1].maxCardId = 1999;
        saleEvents[2].maxCardId = 2999;
        saleEvents[3].maxCardId = 3999;
        saleEvents[4].maxCardId = 4999;

       
    }

    function batchGiftMint(address[] memory _addresses, uint256 quantity) external onlyOwner {
        uint256 _maxSupply = maxSupply;
        uint256 totalQuantity = quantity * _addresses.length;
        uint256 totalSupply = totalSupply();

        require(totalQuantity + totalSupply <= _maxSupply, "Sold Out");

        for(uint256 i = 0; i < _addresses.length; i++){
            _safeMint(_addresses[i], quantity);
            maxSupply = maxSupply - quantity;  
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

    function editAirdropStatus(bool isActive) external onlyOwner {
        airdropActive = isActive;
    }


    
    function cardsAvailableToClaim() public view returns (uint256){
        uint256 cardsOwned = balanceOf(msg.sender);
        uint256 quantity = cardsOwned * 5;
        
        return quantity;
    
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

     function isAirdropValid(bytes32[] memory proof, bytes32 leaf) private view returns (bool){ 
        return MerkleProof.verify(proof, root1, leaf); 
    }

    function isPresaleValid(bytes32[] memory proof, bytes32 leaf) private view returns (bool){ 
        return MerkleProof.verify(proof, root2, leaf); 
    }

    function isReimbursed() public view returns(bool){
        bool isReimbursed = claimedReimbursement[msg.sender];
        return isReimbursed;
    }

    fallback() external payable {}

    receive() external payable {}

    
}