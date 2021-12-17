import Vue from 'vue'
import App from './App.vue'

import './directives/index'

import VueStepWizard from 'vue-step-wizard'
import 'vue-step-wizard/dist/vue-step-wizard.css'


Vue.use(VueStepWizard);

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
