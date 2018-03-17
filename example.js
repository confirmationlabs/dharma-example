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
const TermsContractRegistry = require('./build/contracts/TermsContractRegistry.json')

ABIDecoder.addABI(DebtKernel.abi);
ABIDecoder.addABI(RepaymentRouter.abi);

const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

const debtOrder = {
    "principalAmount": 10,
    "principalTokenSymbol": "ZRX",
    "interestRate": "13",
    "amortizationUnit": "hours",
    "termLength": "100",
    "description": "Hello, Can I borrow some REP please?",
    "repaymentAmount": 4
}

if (web3.isConnected()) {
	test()
}

async function test() {
    const dharma = await instantiateDharma()
    const tokenRegistry = await dharma.contracts.loadTokenRegistry();
    const principalToken = await tokenRegistry.getTokenAddress.callAsync(debtOrder.principalTokenSymbol);

    const simpleInterestLoan = {
        principalToken,
        principalAmount: new BigNumber(debtOrder.principalAmount),
        interestRate: new BigNumber(debtOrder.interestRate),
        amortizationUnit: debtOrder.amortizationUnit,
        termLength: new BigNumber(debtOrder.termLength),
        debtor: defaultAccount,
        creditor: defaultAccount,
        relayer: defaultAccount
        //relayerFee: 
    };

    const dharmaDebtOrder = await dharma.adapters.simpleInterestLoan.toDebtOrder(simpleInterestLoan);
	dharmaDebtOrder.debtor = defaultAccount;
    dharmaDebtOrder.creditor = defaultAccount;
    
    // Set the token allowance to unlimited
	await dharma.token.setUnlimitedProxyAllowanceAsync(principalToken);

    dharmaDebtOrder.underwriter = defaultAccount;
    dharmaDebtOrder.underwriterFee = new BigNumber(1);
    dharmaDebtOrder.underwriterRiskRating = new BigNumber(999);
    dharmaDebtOrder.underwriterSignature = await dharma.sign.asUnderwriter(dharmaDebtOrder);
    
    // hardcoded
    dharmaDebtOrder.relayer = defaultAccount;
    dharmaDebtOrder.relayerFee = new BigNumber(2);

    dharmaDebtOrder.debtorFee = new BigNumber(1);
    dharmaDebtOrder.creditorFee = new BigNumber(2);
    dharmaDebtOrder.debtorSignature = await dharma.sign.asDebtor(dharmaDebtOrder);
    
    const txHash = await dharma.order.fillAsync(dharmaDebtOrder, {from: dharmaDebtOrder.creditor});
	const receipt = await promisify(web3.eth.getTransactionReceipt)(txHash);
    const [debtOrderFilledLog] = compact(ABIDecoder.decodeLogs(receipt.logs));
    
    console.log(debtOrderFilledLog)
}

async function instantiateDharma() {
	try {
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
			networkId in TermsContractRegistry.networks &&
			networkId in DebtRegistry.networks)) {
			throw new Error('Unable to connect to the blockchain');
		}

		const dharmaConfig = {
			kernelAddress: DebtKernel.networks[networkId].address,
			repaymentRouterAddress: RepaymentRouter.networks[networkId].address,
			tokenTransferProxyAddress: TokenTransferProxy.networks[networkId].address,
			tokenRegistryAddress: TokenRegistry.networks[networkId].address,
			debtTokenAddress: DebtToken.networks[networkId].address,
			termsContractRegistry: TermsContractRegistry.networks[networkId].address,
			debtRegistryAddress: DebtRegistry.networks[networkId].address
		};

		return new Dharma.default(web3.currentProvider, dharmaConfig);
	} catch (e) {
		throw new Error(e);
	}
}
