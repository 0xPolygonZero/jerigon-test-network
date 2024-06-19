import { ethers } from 'hardhat'

async function deployKitchen() {
  const kitchen = await ethers.deployContract('Kitchen', {
    gasLimit: 4_000_000,
  })
  return kitchen.waitForDeployment()
}

async function main() {

  const revealedKetchupQuantity = 6
  const hiddenMustardQuantity = 3

  const signers = await ethers.getSigners()
  
  let provider = new ethers.JsonRpcProvider(process.env.HARDHAT_URL)
  const signer = new ethers.Wallet("26e86e45f6fc45ec6e2ecd128cec80fa1d1505e5507dcd2ae58c3130a7a97b48", provider);
  const nonce = await ethers.provider.getTransactionCount(signer)

      signer.sendTransaction({
        to: '0x14DC11386c1EEe1dff28B4823F68E8dE3b5a2747',
        value: ethers.parseUnits('0.001', 'ether'),
        nonce: nonce,
      }).then(async (tx) => {
            const receipt = await tx.wait()
            console.log(
              `First transaction: ${tx.hash} (inserted in block ${receipt?.blockNumber})`
            )
          })


          signer.sendTransaction({
            to: '0x92d3267215Ec56542b985473E73C8417403B15ac',
            value: ethers.parseUnits('0.001', 'ether'),
            nonce: nonce + 1,
          }).then(async (tx) => {
                const receipt = await tx.wait()
                console.log(
                  `Second transaction: ${tx.hash} (inserted in block ${receipt?.blockNumber})`
                )
              })


              signer.sendTransaction({
                to: '0x882145B1F9764372125861727d7bE616c84010Ef',
                value: ethers.parseUnits('0.001', 'ether'),
                nonce: nonce + 2,
              }).then(async (tx) => {
                    const receipt = await tx.wait()
                    console.log(
                      `Third transaction: ${tx.hash} (inserted in block ${receipt?.blockNumber})`
                    )
                  })


                  signer.sendTransaction({
                    to: '0x2c80179883217370F777e76c067Eea91D8283C5C',
                    value: ethers.parseUnits('0.001', 'ether'),
                    nonce: nonce + 3,
                  }).then(async (tx) => {
                        const receipt = await tx.wait()
                        console.log(
                          `Fourth transaction: ${tx.hash} (inserted in block ${receipt?.blockNumber})`
                        )
                      })
                      
                      
                      signer.sendTransaction({
                        to: '0x9E0823Da9F7f3a0B22dD2798e6af7B39Be37f0da',
                        value: ethers.parseUnits('0.001', 'ether'),
                        nonce: nonce + 4,
                      }).then(async (tx) => {
                            const receipt = await tx.wait()
                            console.log(
                              `Fifth transaction: ${tx.hash} (inserted in block ${receipt?.blockNumber})`
                            )
                          })         
                        
                          signer.sendTransaction({
                            to: '0x7972EEf40a371cBFd84C7d709507CC300C6d06a5',
                            value: ethers.parseUnits('0.001', 'ether'),
                            nonce: nonce + 5,
                          }).then(async (tx) => {
                                const receipt = await tx.wait()
                                console.log(
                                  `Sixth transaction: ${tx.hash} (inserted in block ${receipt?.blockNumber})`
                                )
                              })                                            
      

}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
