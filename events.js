const Web3 = require('web3')
const DebtKernel = require('./build/contracts/DebtKernel.json')
// 0x5c9effda0dfd27159a4630f5e2bf1f7d35eb321b
// 6409660
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

const debtKernel = web3.eth.contract(DebtKernel.abi).at('0x1eecb415edb6834559bfafd72025fc6ddcfd5727')//DebtKernel.networks[70].address)

console.log(debtKernel.address)
var x = debtKernel.LogDebtOrderFilled({fromBlock: 0, toBlock: 'latest'}).watch(function(error, result){
    console.log(result);
  })