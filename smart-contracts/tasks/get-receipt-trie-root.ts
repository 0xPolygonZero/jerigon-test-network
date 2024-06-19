import { task } from 'hardhat/config'

task(
  'get-receipt-trie-root',
  'Get a block receipt trie root from a transaction hash'
)
  .addPositionalParam('txHash')
  .setAction(async (taskArgs, hre) => {
    const { ethers } = hre
    const { txHash } = taskArgs

    const transaction = await ethers.provider.getTransaction(txHash)

    const prefetchTxs = false
    const block = await ethers.provider.send('eth_getBlockByHash', [
      transaction?.blockHash,
      prefetchTxs,
    ])

    console.log(block.receiptsRoot)
  })
