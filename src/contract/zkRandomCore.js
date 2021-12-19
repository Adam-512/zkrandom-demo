import { Contract, ethers } from "ethers";
import { Erc20 } from "./erc20";
import abi from "../contract/abi/zkRandomCore.json";
import { handlerReceipt } from "../util";
const contractAddress = "0x2bc034002fF797076cA6CeE5BAd356A976Ca5a77";
// const contractAddress = "0xd0ef273AE6B6bD0dB1EB1192a6F013bC43863b65";
export class ZkRandomCore {
  async init(signer) {
    this.signer = signer;
    this.contract = new Contract(contractAddress, abi, signer);
    let tkInfo = await this.getToken();
    this.tkAddress = tkInfo[0];
    this.decimal = tkInfo[1];
    this.erc20 = new Erc20(this.tkAddress, signer);
    this.token = await this.erc20.getSymbol();
    console.log("init zkRandomCore");
  }
  async getMinDeposit() {
    return await this.contract["MinDeposit"]();
  }
  /**
   * @return {string} projectName
   * @return {number} oper address of admin
   */
  async getToken() {
    return await this.contract["getToken"]();
  }
  /**
   * @param {string} projectName
   * @param {address} oper address of admin
   * @param {number} depositAmt stake amount
   */
  async regist(projectName, address, depositAmt) {
    await this.erc20.approve(address, contractAddress);
    let transaction = await this.contract["regist"](
      projectName,
      address,
      depositAmt
    );
    let receipt = await transaction.wait();
    let res = handlerReceipt(receipt);
    return res.projectId.toString();
  }
  /**
   * @param {number} projectId
   * @param {address} caller contract callback address
   * @param {address} pubkey one address for on item
   * @param {number} model  0:Nonstrict mode , 1: Strict mode
   */
  async newItem(projectId) {
    let newWallet = ethers.Wallet.createRandom();

    let address = await this.signer.getAddress();
    let transaction = await this.contract["newItem"](
      projectId,
      address,
      newWallet.address,
      0
    );
    let receipt = await transaction.wait();
    let res = handlerReceipt(receipt);
    return res.itemId.toString();
  }
   /**
   * @param {address} callback
   * @param {number} itemId
   * @param {bytes32} hv
   * @return {bytes32} requestKey 
   */
  accept(){

  }
}
