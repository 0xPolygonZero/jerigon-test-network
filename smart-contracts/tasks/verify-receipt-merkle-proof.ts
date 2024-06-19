import { RLP } from '@ethereumjs/rlp'
import { Trie } from '@ethereumjs/trie'
import { task } from 'hardhat/config'

task('verify-receipt-merkle-proof', 'Verify a receipt merkle proof')
  .addPositionalParam('txHash')
  .addPositionalParam('proof')
  .addPositionalParam('receiptTrieRoot')
  .setAction(async (taskArgs, hre) => {
    const { ethers } = hre
    const { proof, receiptTrieRoot, txHash } = taskArgs

    const transaction = await ethers.provider.getTransaction(txHash)

    if (transaction && transaction.blockHash) {
      const prefetchTxs = false
      const block = await ethers.provider.getBlock(transaction.blockHash)
      const rawBlock = await ethers.provider.send('eth_getBlockByHash', [
        transaction?.blockHash,
        prefetchTxs,
      ])

      if (rawBlock.receiptsRoot !== receiptTrieRoot) {
        console.log(
          `❌ The provided receipt trie root doesn't match the one of the transaction's block`
        )
        return
      }

      if (block) {
        const txIndex = block?.transactions.findIndex((hash) => hash === txHash)
        const key = Buffer.from(RLP.encode(txIndex))

        const receiptTrieRootAsBuffer = Buffer.from(
          receiptTrieRoot.slice(2),
          'hex'
        )

        const proofBufferArray = (proof as string)
          .split(',')
          .map((p) => Buffer.from(p.slice(2), 'hex'))

        const trie = new Trie()

        try {
          await trie.verifyProof(receiptTrieRootAsBuffer, key, proofBufferArray)
          console.log('✅ Merkle proof has been verified')
        } catch (error) {
          console.log('❌ Merkle proof is invalid!')
        }
      }
    }
  })
