<template>
  <form-wizard ref="stepCom" @onNextStep="onNextStep">
    <tab-content title="创建项目" :selected="true">
      <div class="form-group">
        <label for="fullName">项目名称</label>
        <input v-focus type="text" class="cus-input" v-model="pjName" />
      </div>
    </tab-content>
    <tab-content title="创建随机数item">
      <div class="form-group item-input-wrap" v-for="(v,index) in inputList" :key="index + 'item'">
        <label for="companyName">Item</label>
        <input v-focus type="text" class="cus-input" v-model="items['data' + v].value" />
        <span @click="createInput">
          <span class="cus-icon iconify" data-icon="carbon:add-filled"></span>
        </span>
        <span @click="deleteInput(v, index)">
          <span class="cus-icon red iconify" data-icon="carbon:close-filled"></span>
        </span>
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
</template>

<script>


export default {
  name: 'App',

  data() {
    return {
      pjName: '',
      itemName: '',
      referral: '',
      items: {
        'data0': {
          value: '',
          loading: false
        }
      },
      inputList: [0]
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
  mounted() {
    this.$nextTick(() => {
      let btn1 = document.querySelector('.step-button-previous')
      if (btn1) btn1.innerText = '上一步'
      let btn2 = document.querySelector('.step-button-next')
      if (btn2) btn2.innerText = '下一步'
    })
  },
  methods: {
    createInput() {
      let key = Math.random()
      this.inputList.push(key)
      this.$set(this.items, `data${key}`, {
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
        this.$nextTick(()=>{
          document.querySelector('.step-footer .step-button-submit').classList.add('none')
        })
      }
    }
  }
}
</script>
<style lang="scss">
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
  &:last-of-type{
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
}

.none {
  display: none;
}

.step-body{
  min-height: 200px;
}
</style>