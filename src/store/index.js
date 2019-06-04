import Vuex from 'vuex'
import Vue from 'vue'
//import createPersistedState from "vuex-persistedstate" //持久化存储
import List from './modules/list'

Vue.use(Vuex)
const store = new Vuex.Store({
  modules: {
    List
  },
  /* plugins: [createPersistedState({
    storage: window.sessionStorage,
    reducer(val) {
      return {
        List: {
          //只存储list
          list: val.List.list
        }
      }
    }
  })] */
})

export default store