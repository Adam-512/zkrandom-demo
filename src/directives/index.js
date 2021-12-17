import Vue from 'vue'
Vue.directive('focus',{
    inserted:function(el){
        el&&el.focus()
    }
})