function convertToRelayer(plexDebtOrder) {
  return {
    kernelAddress: plexDebtOrder.kernelVersion,
    repaymentRouterAddress: plexDebtOrder.issuanceVersion,
    principalAmount: plexDebtOrder.principalAmount,
    principalTokenAddress: plexDebtOrder.principalToken,
    debtorAddress: plexDebtOrder.debtor,
    debtorFee: plexDebtOrder.debtorFee,
    termsContractAddress: plexDebtOrder.termsContract,
    termsContractParameters: plexDebtOrder.termsContractParameters,
    expirationTime: new Date(plexDebtOrder.expirationTimestampInSec * 1000).toISOString(),
    salt: plexDebtOrder.salt,
    debtorSignature: plexDebtOrder.debtorSignature,
    underwriterAddress: plexDebtOrder.underwriter,
    underwriterRiskRating: plexDebtOrder.underwriterRiskRating,
    underwriterFee: plexDebtOrder.underwriterFee,
    underwriterSignature: plexDebtOrder.underwriterSignature,
    relayerAddress: plexDebtOrder.relayer,
    relayerFee: plexDebtOrder.relayerFee,
    description: plexDebtOrder.description
  };
}

JSON.stringify(convertToRelayer(
  {
    "principalAmount": 100000000000000000000,
    "principalToken": "0x173701aef9768c0d0944066e92ac98aa111fd035",
    "termsContract": "0x88c58b43376865b2b29f87c1f481a8a041ce8146",
    "termsContractParameters": "0x01000000056bc75e2d6310000000271030003000000000000000000000000000",
    "kernelVersion": "0x12298e1d4006ba83d62bbade1c9f1b84bcb44143",
    "issuanceVersion": "0x6a4e6cb8167770e2b53d160248eeae6db5dc9652",
    "debtor": "0x001d51cdc8f4b378e136642ddb95dfc4ff6a4b72",
    "debtorFee": 0,
    "creditor": "0x0000000000000000000000000000000000000000",
    "creditorFee": 0,
    "relayer": "0x0000000000000000000000000000000000000000",
    "relayerFee": 0,
    "underwriter": "0x0000000000000000000000000000000000000000",
    "underwriterFee": 0,
    "underwriterRiskRating": 0,
    "expirationTimestampInSec": 1526674997,
    "salt": 0,
    "debtorSignature": "{\"v\":28,\"r\":\"0x731806f51d828c3d8d962fd28ede7f0011a7e010a9992eca670b46ec26fe9514\",\"s\":\"0x2e89049a24aff7f04e386d564877454914cf8668cc69cb2fd4a8cde7a0efb00f\"}",
    "creditorSignature": "{\"r\":\"\",\"s\":\"\",\"v\":0}",
    "underwriterSignature": "{\"r\":\"\",\"s\":\"\",\"v\":0}",
    "description": "description",
    "principalTokenSymbol": "MKR"
  }
))

/*
result:
"{"kernelAddress":"0x12298e1d4006ba83d62bbade1c9f1b84bcb44143",
"repaymentRouterAddress":"0x6a4e6cb8167770e2b53d160248eeae6db5dc9652",
"principalAmount":100000000000000000000,
"principalTokenAddress":"0x173701aef9768c0d0944066e92ac98aa111fd035",
"debtorAddress":"0x001d51cdc8f4b378e136642ddb95dfc4ff6a4b72",
"debtorFee":0,
"termsContractAddress":"0x88c58b43376865b2b29f87c1f481a8a041ce8146",
"termsContractParameters":"0x01000000056bc75e2d6310000000271030003000000000000000000000000000",
"expirationTime":"2018-05-18T20:23:17.000Z",
"salt":0,
"debtorSignature":"{\"v\":28,\"r\":\"0x731806f51d828c3d8d962fd28ede7f0011a7e010a9992eca670b46ec26fe9514\",\"s\":\"0x2e89049a24aff7f04e386d564877454914cf8668cc69cb2fd4a8cde7a0efb00f\"}",
"underwriterAddress":"0x0000000000000000000000000000000000000000",
"underwriterRiskRating":0,
"underwriterFee":0,
"underwriterSignature":"{\"r\":\"\",\"s\":\"\",\"v\":0}",
"relayerAddress":"0x0000000000000000000000000000000000000000",
"relayerFee":0,
"description":"description"}"
*/

