#/bin/bash
cd /home/node/smart-contracts
echo "Running npm install..."
npm install

echo "Building smart contracts"
npm run build

curl -X POST -H "Content-Type: application/json" --data '{"jsonrpc": "2.0", "method": "eth_blockNumber", "params": [], "id":83}' $HARDHAT_URL

echo "Deploying 5 blocks with standard eth transfer transactions"
npm run tx-generate-6-transfer && npm run tx-generate-6-transfer && npm run tx-generate-6-transfer && npm run tx-generate-6-transfer && npm run tx-generate-6-transfer

echo "Deploying 5 blocks with simple smart contract call transactions"
npm run tx-generate-2-sc && npm run tx-generate-2-sc && npm run tx-generate-2-sc && npm run tx-generate-2-sc && npm run tx-generate-2-sc


echo "Smart contracts deployment finished"
