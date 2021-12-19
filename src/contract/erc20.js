import { Contract, BigNumber, ethers } from "ethers";
import { CHAIN_PARAMS } from "./const";

import erc20 from "./abi/erc20.json";
const defaultProvider = new ethers.providers.JsonRpcProvider(
  CHAIN_PARAMS.rpcUrls[0]
);
const approveAmount = BigNumber.from(10).pow(20);

export class Erc20 {
  constructor(adress, signer) {
    this.contract = new Contract(adress, erc20.abi, signer || defaultProvider);
    console.log("init erc20 contract", adress);
  }
  async getSymbol() {
    return await this.contract.symbol();
  }
  async approve(userAddress, spenderAddress) {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      let allowance = await this.contract.allowance(
        userAddress,
        spenderAddress
      );
      console.log('授权额度',allowance.toString())
      if (allowance.isZero()) {
        try {
          let transaction = await this.contract.approve(
            spenderAddress,
            approveAmount
          );
          let receipt = transaction.wait();
          //approve success
          if (receipt.status == 1) {
            resolve(1);
          }
        } catch (error) {
          console.log(error);
          reject();
        }
      }
      resolve(1);
    });
  }
}
