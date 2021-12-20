import { ethers } from "ethers";
import MetaMaskOnboarding from "@metamask/onboarding";

import { CHAIN_ID_HEX, CHAIN_PARAMS } from "../contract/const";

export class Wallet {
  constructor(vm) {
    this.signer = null;
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    this.signer = provider.getSigner();

    window.ethereum.on("accountsChanged", async function (accountList) {
      console.log("accountsChanged", accountList);
      vm.$emit('accountsChanged')
      await checkNetwork();
      vm.address = accountList[0];
    });

    window.ethereum.on("chainChanged", async function () {
      window.location.reload();
    });

    (async () => {
      try {
        await checkNetwork();
        console.log("auto init");
        vm.address = await this.signer.getAddress();
      } catch (error) {
        console.log(error);

        setTimeout(() => {
          vm.address = "";
        }, 500);
        console.log("init addres error");
      }
    })();
  }
  async connectWallet() {
    const onboarding = new MetaMaskOnboarding();
    if (MetaMaskOnboarding.isMetaMaskInstalled()) {
      await checkNetwork();

      window.ethereum.enable();
    } else {
      onboarding.startOnboarding();
    }
  }
  async getAddress() {
    return await this.signer.getAddress();
  }
  async getChainId() {
    return await this.signer.getChainId();
  }
}

// eslint-disable-next-line no-unused-vars
async function checkNetwork() {
  async function requestSwitchNetwork() {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: CHAIN_ID_HEX }],
    });
  }
  async function requestAddNetwork() {
    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [CHAIN_PARAMS],
    });
  }
  try {
    await requestSwitchNetwork();
  } catch (switchError) {
    // This error code indicates that the chain has not been added to MetaMask.
    if (switchError.code === 4902) {
      try {
        await requestAddNetwork();
        await requestSwitchNetwork();
      } catch (addErr) {
        // handle "add" error
        throw new Error(`Could not add chain: ${addErr.message}`);
      }
    }
    if (switchError.code == 4001) {
      throw new Error(`User rejected the request.`);
    }
  }
}
