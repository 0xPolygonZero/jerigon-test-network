#/bin/bash

curl -X POST -H "Content-Type: application/json" --data '{"jsonrpc": "2.0", "method": "eth_blockNumber", "params": [], "id":83}' localhost:8546 | grep '"result":"0x[0-9]"'