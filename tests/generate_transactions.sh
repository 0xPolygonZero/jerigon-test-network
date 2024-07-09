#!/bin/bash

network_started () {
     # $1 - rpc url
     # $2 - expected minimal block number to consider network up and running
    current_block_number=$(cast rpc eth_blockNumber --rpc-url $1 | sed s/\"//g)
    current_block_number=$((16#${current_block_number#"0x"}))
    if [[ $current_block_number -gt $2 ]]; then
        echo 0
    else
        echo 1
    fi
}


function wait_network_started () {
     # $1 - rpc url
     # $2 - expected minimal block number to consider network up and running
    while true;
    do
        echo "Waiting for the network to start producing blocks..."
        network_started=$(network_started $1 $2)
        if [ $network_started -eq 0 ]; then
            echo "Network is started"
            break
        else
            echo "Network is not yet started, trying again in 5 seconds"
            sleep 5
            continue
        fi
    done
}

wait_block_time () {
    # $1 - interval in seconds
   sleep $1
}

get_nonce_and_gas_price () {
     # $1 - rpc url
     # $2 - eth address
    cur_nonce=$(cast nonce --rpc-url $eth_rpc_url $2)
    gas_price="$(cast gas-price --rpc-url $1)"
    gas_price=$(bc <<< "2 * $gas_price")   
}

set -e

if [ -z "${ETH_ADDRESS}" ] | [ -z "${ETH_PRIVATE_KEY}" ]; then
echo "ETH_ADDRESS and ETH_PRIVATE_KEY must be set. "
exit 1
fi

eth_rpc_url="$(kurtosis port print cancun-testnet el-2-erigon-lighthouse ws-rpc)"


wait_network_started $eth_rpc_url 1

# Perform a few transfer value transactions
get_nonce_and_gas_price $eth_rpc_url $ETH_ADDRESS 
echo "Generating a few value transactions"
cast send --async --nonce $cur_nonce --legacy --from $ETH_ADDRESS --private-key $ETH_PRIVATE_KEY --rpc-url $eth_rpc_url  --gas-limit 100000 --value 1 -j "0x852DA15b70a3e197d1D668a9a481B1F4c2168a5D"
cast send --async --nonce $((cur_nonce + 1)) --legacy --from $ETH_ADDRESS --private-key $ETH_PRIVATE_KEY --rpc-url $eth_rpc_url  --gas-limit 100000 --value 1 -j "0x98DF8033986E2bb676038D410fa31D80b3324003"


# Deploy 10 random contracts
wait_block_time $BLOCK_INTERVAL
get_nonce_and_gas_price $eth_rpc_url $ETH_ADDRESS 
echo "Deploying some random test contracts"
cat `find . -iname "10-random-contracts.txt"` | while read -r line; do
    cast send $LEGACY_FLAG --async --nonce $cur_nonce --private-key $ETH_PRIVATE_KEY --gas-limit 250000 --gas-price $gas_price --rpc-url $eth_rpc_url -j \
        --create "$line"
    retVal=$?
    current_block=`cast rpc eth_blockNumber --rpc-url $eth_rpc_url`
    if [[ $retVal -eq 0 ]]; then
        cur_nonce=$((cur_nonce + 1))
    else
        echo "Failed to deploy smart contract"
        exit 1
    fi
done


# Deploy a few smart contracts and call them
echo "Deploying a few basic smart contracts"
wait_block_time $BLOCK_INTERVAL
get_nonce_and_gas_price $eth_rpc_url $ETH_ADDRESS 
find . -type f -name 'geth-test*.bin' | sort | while read -r contract; do
    echo "Deploying contract $contract"
    cast send --legacy --from $ETH_ADDRESS --private-key $ETH_PRIVATE_KEY --rpc-url $eth_rpc_url -j --create \
        "$(cat $contract)" | jq '.' > out.tmp.json
    contract_address="$(jq -r '.contractAddress' out.tmp.json)"
    echo "Calling contract $contract_address"
    cast send --legacy --gas-limit 2000000 --private-key $ETH_PRIVATE_KEY --rpc-url $eth_rpc_url \
        $contract_address -j "0xDEADBEEF" | jq '.' > $contract.run.json
done

fail_count=$(cat *.json | jq -r 'select(.status != "0x1") | .transactionHash' | wc -l)
if [[ $fail_count -gt 0 ]]; then
    echo "it looks like some geth-contracts failed to execute"
    exit 1
fi

