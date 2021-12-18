import { ethers } from "ethers";
import MetaMaskOnboarding from "@metamask/onboarding";

import { ZkRandomCore } from "../contract/zkRandomCore";

export class Wallet {
  constructor(vm) {
    this.signer = null;
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    this.signer = provider.getSigner();

    window.ethereum.on("accountsChanged", async function (accountList) {
      console.log("accountsChanged", accountList);
      vm.address = accountList[0];

      vm.zkRandomCore = new ZkRandomCore(this.signer);
    });

    (async () => {
      try {
        vm.address = await this.signer.getAddress();

        vm.zkRandomCore = new ZkRandomCore(this.signer);
      } catch (error) {
        setTimeout(() => {
          vm.address = "";
        }, 500);
        console.log("init addres error");
      }
    })();
  }
  connectWallet() {
    const onboarding = new MetaMaskOnboarding();
    if (MetaMaskOnboarding.isMetaMaskInstalled()) {
      window.ethereum.enable();
    } else {
      onboarding.startOnboarding();
    }
  }
  async getAddress() {
    return await this.signer.getAddress();
  }
}
