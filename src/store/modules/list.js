import { HANDLE_ADD, HANDLE_DONE, GET_TAB_LIST, GET_TAB_ID } from '../mutation-types'
const List = {
  state: {
    list: [],
    tabList: [],
    tab: 0
  },

  actions: {
    handleAdd({ commit, dispatch, state }, value) {
      let item = {
        value,
        isDone: false,
        id: new Date().getTime()
      }
      commit(HANDLE_ADD, item)
      dispatch(GET_TAB_LIST, state.tab)
    },
    handleDone({ commit, state, dispatch }, id) {
      let index = null
      let list = [...state.list]
      list.map((item, i) => {
        if (item.id === id) index = i
      })
      list[index].isDone ? list.splice(index, 1) : list[index].isDone = !list[index].isDone
      commit(HANDLE_DONE, list)
      dispatch(GET_TAB_LIST, state.tab)
    },
    getTabList({ commit, state }, id) {
      let list = [...state.list], tabList = []
      switch (id) {
        case 0:
          tabList = list
          break
        case 1:
          tabList = list.filter(item => {
            return !item.isDone
          })
          break
        default:
          tabList = list.filter(item => {
            return item.isDone
          })
          break
      }
      commit(GET_TAB_ID, id)
      commit(GET_TAB_LIST, tabList)
    }
  },

  mutations: {
    handleAdd(state, item) {
      state.list.push(item)
    },
    handleDone(state, list) {
      state.list = [...list]
    },
    getTabList(state, list) {
      state.tabList = [...list]
    },
    getTabId(state, id) {
      state.tab = id
    }
  },
}

export default List