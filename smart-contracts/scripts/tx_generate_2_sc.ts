import { ethers } from 'hardhat'

async function deployKitchen() {
  const kitchen = await ethers.deployContract('Kitchen', {
    gasLimit: 4_000_000,
  })
  return kitchen.waitForDeployment()
}

async function main() {
  const kitchen = await deployKitchen()
  console.log('Contract deployed at:', await kitchen.getAddress())
  console.log(
    'Deployment transaction:',
    await kitchen
      .deploymentTransaction()
      ?.getTransaction()
      .then((txResponse) => txResponse?.hash)
  )

  const revealedKetchupQuantity = 6
  const hiddenMustardQuantity = 3

  const signers = await ethers.getSigners()
  const nonce = await ethers.provider.getTransactionCount(signers[0])

  // First transaction
  kitchen
    .setIngredient('sugar', 'usa', revealedKetchupQuantity, {
      gasLimit: 4_000_000,
      nonce,
    })
    .then(async (tx) => {

      // Second transaction
      kitchen
      .setIngredient('mustard', 'dijon', hiddenMustardQuantity, {
        gasLimit: 4_000_000,
        nonce: nonce + 1,
      })
      .then(async (tx1) => {
        const receipt1 = await tx1.wait()
        console.log(
          `Mustard transaction: ${tx1.hash} (inserted in block ${receipt1?.blockNumber})`
        )
      })

      const receipt = await tx.wait()
      console.log(
        `Ketchup transaction: ${tx.hash} (inserted in block ${receipt?.blockNumber})`
      )

    })

  
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
