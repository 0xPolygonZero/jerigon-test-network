import { RLP } from '@ethereumjs/rlp'
import { Trie } from '@ethereumjs/trie'
import { Block, hexlify } from 'ethers'
import { task } from 'hardhat/config'

/**
 * Create a receipt Merkle Patricia Tree
 *
 * @param block Block (with transactions) to create the trie for
 * @returns The block's Merkle Patricia Trie
 */
async function createReceiptMpt(blockWithTransactions: Block) {
  const trie = new Trie()
  await Promise.all(
    blockWithTransactions.prefetchedTransactions.map(async (tx, index) => {
      const receipt = await tx.wait()
      const {
        cumulativeGasUsed,
        logs,
        logsBloom,
        type: transactionType,
        status,
      } = receipt!

      const key = Buffer.from(RLP.encode(index))
      const value = RLP.encode([
        status,
        Number(cumulativeGasUsed),
        logsBloom,
        logs.map((l) => [l.address, l.topics as string[], l.data]),
      ])

      if (transactionType === 0) {
        await trie.put(key, Buffer.from(value))
      } else {
        const buf = Buffer.concat([Buffer.from([transactionType]), value])
        await trie.put(key, buf)
      }
    })
  )
  return trie
}

task(
  'generate-receipt-merkle-proof',
  'Get a receipt merkle proof from a transaction hash'
)
  .addPositionalParam('txHash')
  .setAction(async (taskArgs, hre) => {
    const { ethers } = hre
    const { txHash } = taskArgs

    const transaction = await ethers.provider.getTransaction(txHash)

    if (transaction && transaction.blockHash) {
      const prefetchTxs = true
      const block = await ethers.provider.getBlock(
        transaction.blockHash,
        prefetchTxs
      )

      if (block) {
        const txIndex = block.prefetchedTransactions.findIndex(
          (t) => t.hash === txHash
        )

        const receiptTrie = await createReceiptMpt(block)
        const key = Buffer.from(RLP.encode(txIndex))
        const proof = (await receiptTrie.createProof(key))
          .map((p) => hexlify(p))
          .toString()

        console.log(
          `✅ Successfully generated merkle proof for transaction ${txHash}: \n\n${proof}`
        )
      }
    }
  })
