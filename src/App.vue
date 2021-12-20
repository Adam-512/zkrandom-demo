<template>
  <div>
    <p class="title">
      管理员钱包：
      <button v-if="!address" @click="connectWallet">连接MetaMask</button>
      <span v-else>{{ address }}</span>
    </p>
    <form-wizard ref="stepCom" @onNextStep="onNextStep">
      <tab-content title="创建项目" :selected="true">
        <label class="radioWrap" for="useStoreId">
          <input id="useStoreId" type="radio" name="type" value="0" v-model="createType" />
          <p>
            使用已创建的ProjectId：
            <span
              class="underline blue-text"
              @click="openBrowser(storeProjectId)"
            >{{ storeProjectId }}</span>
          </p>
        </label>
        <label class="radioWrap" for="useNewId">
          <input id="useNewId" type="radio" name="type" value="1" v-model="createType" />
          <p>创建新项目</p>
        </label>
        <div class="step-wrap">
          <div class="form-group item-input-wrap">
            <label for="fullName">项目名称</label>
            <input v-focus type="text" class="cus-input" v-model="pjName" />
          </div>
          <div class="form-group item-input-wrap">
            <label for="fullName">质押金额</label>
            <input type="text" class="cus-input" v-model="stakeAmount" />
          </div>
          <p class="mb-15 mt-15">最小质押金额：（{{ minStake }}{{ stakeToken }}）</p>
          <p class="success-text mb-15" v-show="projectId">
            项目创建成功！
            <span
              class="underline"
              title="在浏览器上查看"
              @click="openBrowser(projectId)"
            >projectId：{{ projectId }}</span>
          </p>
          <button
            v-show="!loadingPj && !projectId"
            type="button"
            class="step-button blue"
            @click="doCreateProject"
          >
            <span class="btn-text">确认</span>
          </button>
          <button v-show="loadingPj && !projectId" class="step-button blue" disabled>
            <span class="iconify loadding-icon" data-icon="eos-icons:loading"></span>
          </button>
          <button v-show="projectId && !loadingPj" class="step-button blue" disabled>
            <span class="iconify" data-icon="clarity:success-line"></span>
          </button>
        </div>
      </tab-content>
      <tab-content title="创建随机数item">
        <div class="step-wrap">
          <div
            class="form-group item-input-wrap"
            v-for="(v,index) in inputList"
            :key="index + 'item'"
          >
            <label for="companyName">Item</label>
            <input v-focus type="text" class="cus-input" v-model="items['data' + v].value" disabled />
            <span @click="createInput" v-show="items['data' + v].value">
              <span class="cus-icon iconify" data-icon="carbon:add-filled"></span>
            </span>
            <span @click="deleteInput(v, index)" v-show="index != 0">
              <span class="cus-icon red iconify" data-icon="carbon:close-filled"></span>
            </span>
          </div>
          <button v-show="!loadingItem" type="button" class="step-button blue" @click="createItem">
            <span class="btn-text">创建</span>
          </button>
          <button v-show="loadingItem" class="step-button blue" disabled>
            <span class="iconify loadding-icon" data-icon="eos-icons:loading"></span>
          </button>
        </div>
      </tab-content>
      <tab-content title="生成随机数">
        <div class="s-item" v-for="(item,key) in items" :key="key + 'zkItem'">
          <span class="label-t">Item: {{ item.value }}</span>
          <input class="cus-input" type="text" disabled />
          <button type="button" class="step-button blue" @click="getRandom(item)">获取随机数</button>
          <div class="cus-loader ball-pulse" v-if="item.loading">
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>
      </tab-content>
    </form-wizard>
  </div>
</template>

<script>
import { ZkRandomCore } from './contract/zkRandomCore'
import { removeDecimal, withDecimal } from './util'
import { Wallet } from './util/wallet'

export default {
  name: 'App',
  data() {
    return {
      createType: '0',
      pjName: '',
      stakeAmount: '',
      itemName: '',
      referral: '',
      items: {
        'data0': {
          value: '',
          loading: false
        }
      },
      inputList: [0],
      wallet: null,
      address: '--',
      zkRandomCore: null,
      stakeToken: null,
      minStake: null,
      loadingPj: false,
      loadingItem: false,
      projectId: null,
      storeProjectId: localStorage.getItem('projectId'),
      targetItemKey: '0',
    }
  },
  computed: {
    progress() {
      return this.$refs.stepCom.progress
    },
    isLastStep() {
      return this.progress == 100
    }
  },
  async mounted() {
    this.$on('accountsChanged', function () {
      this.init()
    })

    this.init()

    this.$nextTick(() => {
      let btn1 = document.querySelector('.step-button-previous')
      if (btn1) btn1.innerText = '上一步'
      let btn2 = document.querySelector('.step-button-next')
      if (btn2) btn2.innerText = '下一步'
    })
  },

  methods: {
    createInput() {
      this.targetItemKey = Math.random()
      this.inputList.push(this.targetItemKey)
      this.$set(this.items, `data${this.targetItemKey}`, {
        value: '',
        loading: false
      })
    },
    deleteInput(key, index) {
      this.inputList.splice(index, 1)
      delete this.items[`data${key}`]
    },
    getRandom(item) {
      item.loading = true
    },
    onNextStep() {
      if (this.isLastStep) {
        this.$nextTick(() => {
          document.querySelector('.step-footer .step-button-submit').classList.add('none')
        })
      }
    },
    connectWallet() {
      this.wallet.connectWallet()
    },
    async doCreateProject() {
      if (!this.address) {
        this.connectWallet();
        return;
      }
      if (this.pjName == '' || this.stakeAmount == '') {
        return
      }
      this.loadingPj = true
      this.projectId = await this.zkRandomCore.regist(this.pjName, this.address, withDecimal(this.stakeAmount, this.zkRandomCore.decimal)).finally(() => { this.loadingPj = false })
      localStorage.setItem('projectId', this.projectId)
      this.storeProjectId = this.projectId
    },
    openBrowser(projectId) {
      window.open(`https://zk-random-browser.vercel.app/#/projectsDetail?projectId=${projectId}`, '__blank')
    },
    async createItem() {
      if (!this.storeProjectId) {
        return
      }
      this.loadingItem = true
      let itemId = await this.zkRandomCore.newItem(this.storeProjectId).finally(() => this.loadingItem = false)
      this.$set(this.items, `data${this.targetItemKey}`, {
        value: itemId,
        loading: false
      })
    },
    async init() {
      this.wallet = new Wallet(this)
      this.zkRandomCore = new ZkRandomCore()
      await this.zkRandomCore.init(this.wallet.signer)

      this.stakeToken = this.zkRandomCore.token;
      this.minStake = removeDecimal(await this.zkRandomCore.getMinDeposit(), this.zkRandomCore.decimal)
    }
  }
}
</script>
<style lang="scss">
p {
  margin: 0;
}
.title {
  width: 980px;
  margin: 0 auto;
  padding: 20px 0;
  display: flex;
  align-items: center;
  min-height: 75px;
  box-sizing: border-box;
  button {
    background-color: #4b8aeb;
    border: none;
    border-radius: 8px;
    padding: 8px;
    color: #fff;
    cursor: pointer;
  }
}
.form-group {
  display: flex;
  align-items: center;
  label {
    margin-right: 20px;
    display: inline-block;
    width: 100px;
  }
}
.cus-input {
  border-radius: 4px;
  padding: 5px;
  outline: none;
  border: 1px solid;
}

.cus-icon {
  cursor: pointer;
  margin-left: 10px;
  color: #4b8aeb;
  &.red {
    color: red;
  }
}

.item-input-wrap {
  margin-bottom: 15px;
  &:last-of-type {
    margin-bottom: 0;
  }
}

.cus-loader {
  div {
    background-color: #000;
    width: 10px;
    height: 10px;
    &::after,
    &::before {
      background-color: #000;
    }
  }
}

.label-t {
  margin-right: 20px;
}

.s-item {
  display: flex;
  align-items: center;
  .cus-input {
    width: 250px;
  }
}
.step-button.blue {
  background-color: #4b8aeb;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  svg {
    margin: 0 5px;
  }
  &:disabled {
    cursor: not-allowed;
    filter: brightness(1.2);
  }
}

.none {
  display: none;
}

.step-body {
  min-height: 200px;
  position: relative;
}

.step-body .step-wrap {
  padding-bottom: 40px;
  .step-button {
    margin: 0;
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
  }
}

.success-text {
  color: green;
}
.blue-text {
  color: #4b8aeb;
}
.underline {
  text-decoration: underline;
  cursor: pointer;
}

.radioWrap {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.mb-15 {
  margin-bottom: 15px;
}
.mt-15 {
  margin-top: 15px;
}
</style>