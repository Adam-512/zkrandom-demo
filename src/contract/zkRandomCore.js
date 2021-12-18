import { Contract } from "ethers";
import abi from "../contract/abi/zkRandomCore.json";
const contractAddress = "0xd0ef273AE6B6bD0dB1EB1192a6F013bC43863b65";
export class ZkRandomCore {
  constructor(signer) {
    this.zkRandomCore = new Contract(contractAddress, abi, signer);
  }
  /**
   * @param {string} projectName
   * @param {string} oper address of admin
   * @param {string} depositAmt stake amount
   */
  async regist(projectName, address, depositAmt) {
    let transaction = await this.zkRandomCore["regist"](
      projectName,
      address,
      depositAmt
    );
    let receipt = await transaction.wait();
    console.log(receipt)
  }
}
