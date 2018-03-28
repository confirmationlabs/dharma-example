const Web3 = require('web3');
const Dharma = require('@dharmaprotocol/dharma.js');
const ABIDecoder = require('abi-decoder');
const promisify = require('tiny-promisify');
const BigNumber = require('bignumber.js');
const compact = require('lodash.compact');

const DebtRegistry = require('./build/contracts/DebtRegistry.json')
const DebtKernel = require('./build/contracts/DebtKernel.json')
const RepaymentRouter = require('./build/contracts/RepaymentRouter.json')
const TokenTransferProxy = require('./build/contracts/TokenTransferProxy.json')
const TokenRegistry = require('./build/contracts/TokenRegistry.json')
const DebtToken = require('./build/contracts/DebtToken.json')
const SimpleInterestTermsContract = require('./build/contracts/SimpleInterestTermsContract.json')

ABIDecoder.addABI(DebtKernel.abi);
ABIDecoder.addABI(RepaymentRouter.abi);

const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

if (web3.isConnected()) {
    test()
}

async function test() {
    const dharma = await instantiateDharma()
    const tokenRegistry = await dharma.contracts.loadTokenRegistry()
    const principalTokenSymbol = "DAI"
    const principalToken = await tokenRegistry.getTokenAddressBySymbol.callAsync(principalTokenSymbol)

    // Set the token allowance to unlimited
    let tx = await dharma.token.setUnlimitedProxyAllowanceAsync(principalToken)
    await dharma.blockchain.awaitTransactionMinedAsync(tx, 1000, 60000)

    const simpleInterestLoan = {
        principalToken,
        principalTokenSymbol,
        principalAmount: new BigNumber(Math.floor(Math.random() * 101)),
        interestRate: new BigNumber(Math.floor(Math.random() * 11)),
        amortizationUnit: "hours",
        termLength: new BigNumber(Math.floor(Math.random() * 101)),
        debtor: defaultAccount,
        description: "Hello, Can I borrow some DAI please?",

        // hardcoded
        relayer: defaultAccount,
        relayerFee: new BigNumber(2),

        debtorFee: new BigNumber(1),
        creditorFee: new BigNumber(1),
    };

    // Convert to protocol format
    const dharmaDebtOrder = await dharma.adapters.simpleInterestLoan.toDebtOrder(simpleInterestLoan);
    console.log('Debt order created: ' + JSON.stringify(dharmaDebtOrder, null, 2) + '\n')

    const balance = await dharma.token.getBalanceAsync(principalToken, defaultAccount)
    const allowance = await dharma.token.getProxyAllowanceAsync(principalToken, defaultAccount)
    console.log("Balance: " + balance.toNumber())
    console.log("Allowance: " + allowance.toNumber() + '\n')

    // Sign as debtor
    dharmaDebtOrder.debtorSignature = await dharma.sign.asDebtor(dharmaDebtOrder)
    console.log('Debt order signed by debtor: ' + JSON.stringify(dharmaDebtOrder, null, 2) + '\n')

    const creditor = defaultAccount;
    dharmaDebtOrder.creditor = creditor;
    const txHash = await dharma.order.fillAsync(dharmaDebtOrder, { from: creditor });
    const receipt = await dharma.blockchain.awaitTransactionMinedAsync(txHash, 1000, 60000)

    const [debtOrderFilledLog] = compact(ABIDecoder.decodeLogs(receipt.logs));

    console.log('fillAsync txHash: ' + txHash)
    console.log('Debt order filled by creditor: ' + JSON.stringify(debtOrderFilledLog, null, 2) + '\n')
}

async function instantiateDharma() {
    const networkId = await promisify(web3.version.getNetwork)();
    const accounts = await promisify(web3.eth.getAccounts)();
    if (!accounts.length) {
        throw new Error('ETH account not available');
    }
    defaultAccount = accounts[0];

    if (!(networkId in DebtKernel.networks &&
        networkId in RepaymentRouter.networks &&
        networkId in TokenTransferProxy.networks &&
        networkId in TokenRegistry.networks &&
        networkId in DebtToken.networks &&
        networkId in SimpleInterestTermsContract.networks &&
        networkId in DebtRegistry.networks)) {
        throw new Error('Unable to connect to the blockchain');
    }

    const dharmaConfig = {
        kernelAddress: DebtKernel.networks[networkId].address,
        repaymentRouterAddress: RepaymentRouter.networks[networkId].address,
        tokenTransferProxyAddress: TokenTransferProxy.networks[networkId].address,
        tokenRegistryAddress: TokenRegistry.networks[networkId].address,
        debtTokenAddress: DebtToken.networks[networkId].address,
        simpleInterestTermsContractAddress: SimpleInterestTermsContract.networks[networkId].address,
        debtRegistryAddress: DebtRegistry.networks[networkId].address
    };

    return new Dharma.default(web3.currentProvider, dharmaConfig);
}
