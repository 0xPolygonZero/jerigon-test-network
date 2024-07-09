# jerigon-test-network
Local jerigon test network

## Run cancun jerigon network with kurtosis

Install `docker` and `kurtosis` if needed. Kurtosis install instructions are provided [here](https://docs.kurtosis.com/install).

Start network:
```bash
cd jerigon-test-network
kurtosis run --enclave cancun-testnet github.com/ethpandaops/ethereum-package@4.0.0 --args-file network_params.yml
```

Generate some test blocks:
```bash
export ETH_RPC_URL=$(kurtosis port print cancun-testnet el-2-erigon-lighthouse ws-rpc)
set -a && source .env && set +a
bash ./tests/generate_transactions.sh 
```


Retrieve info from network:
```bash
cast rpc eth_blockNumber --rpc-url $ETH_RPC_URL
cast rpc debug_traceBlockByNumber "0x6" '{"tracer": "zeroTracer"}' --rpc-url $ETH_RPC_URL | jq
```

Shut down network:
```bash
kurtosis enclave rm -f cancun-testnet
kurtosis engine stop
```


