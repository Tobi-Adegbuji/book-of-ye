const { MerkleTree } = require('merkletreejs')
const keccak256  = require('keccak256')

 
 const whitelistAddresses = [
     "0x0F44Dea529b942578C5306DA7464c6f2c9f67aB4",
     "0x0F44Dea529b942578C5306DA7464c6f2c9f67aB5",
     "0x0F44Dea529b942578C5306DA7464c6f2c9f67aB6",
     "0x5B38Da6a701c568545dCfcB03FcB875f56beddC4"
 ]

 const leaves = whitelistAddresses.map(addy => keccak256(addy))
 const tree = new MerkleTree(leaves, keccak256, { sortPairs: true})
 const buf2Hex = x => '0x' + x.toString('hex')
 console.log("ROOT", buf2Hex(tree.getRoot()))


 //How to get proof: 

//Get leaf you are trying to verify (keccak256 of you addy)
const leaf = keccak256(whitelistAddresses[0])
console.log("LEAF", buf2Hex(leaf))


//Generate proof for given leaf, only want data of leaf so we map it 
const proof = tree.getProof(leaf).map(x => buf2Hex(x.data))

//Given the leaf and its proof, we can verify it against the root node
console.log("PROOF", proof)

//contract preSaleMint(eventNumber, cardId, proof).send

//['0x493dcf9eaac9cf6104d9f79efdd145264d2d65663624f60af4069a092cd09b60','0xe5e0d1945f416f9d35401528847e2b4034f7fddc7ef4329e8e9fa03e0b9f8341']