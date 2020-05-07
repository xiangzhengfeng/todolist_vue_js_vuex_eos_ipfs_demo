import Vuex from 'vuex'
import Vue from 'vue'
import List from './modules/list'

Vue.use(Vuex)
const store = new Vuex.Store({
  modules: {
    List
  }
})

export default store