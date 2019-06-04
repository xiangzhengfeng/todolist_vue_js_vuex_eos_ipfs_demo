import { HANDLE_TABLE_DATA, HANDLE_TAB_LIST, GET_TAB_LIST, HANDLE_TAB_ID, GET_TABLE_DATA_LIST } from '../mutation-types'
import { add, done, remove } from "../../api/transact"
import { getTableData } from "../../api/fetch"
import { toast } from "../../api/toast"

const List = {
  state: {
    list: [],
    tabList: [],
    tab: 0,
    loading: false,
  },

  actions: {
    async getTableDataList({ dispatch, commit, state }, { next_key, refreshing }) {
      toast.show()
      const res = await getTableData('todotable', next_key);
      if (res.rows) {
        let list = []
        res.rows.filter((item, index) => {
          list[index] = {
            id: item.id,
            key: item.time,
            value: item.content,
            isDone: item.is_done
          }
        });
        toast.hide()
        refreshing ? commit(HANDLE_TABLE_DATA, list) : commit(HANDLE_TABLE_DATA, state.list.concat(list))
        dispatch(GET_TAB_LIST, state.tab)
        return {
          more: res.more,
          next_key: res.next_key,
          status: 200
        }
      } else {
        toast.dialog("加载区块链数据失败，请检查网络后再刷新！").then(() => {
          commit(HANDLE_TABLE_DATA, state.list)
        })
        dispatch(GET_TAB_LIST, state.tab)
        return {
          status: 500
        }
      }
    },

    async handleAdd({ dispatch }, value) {
      toast.info()
      const res = await add(value)
      toast.hide()
      if (res.transaction_id) {
        toast.dialog("新增成功！交易哈希：\n" + res.transaction_id).then(() => {
          dispatch(GET_TABLE_DATA_LIST)
        })
      } else {
        toast.dialog("新增事项失败，请重新添加！")
      }
    },

    async handleDone({ dispatch }, id) {
      toast.info()
      const res = await done(id)
      toast.hide()
      if (res.transaction_id) {
        toast.dialog("已完成！交易哈希：\n" + res.transaction_id).then(() => {
          dispatch(GET_TABLE_DATA_LIST)
        })
      } else {
        toast.dialog("操作失败，请重新完成该事项！")
      }
    },

    async handleDelete({ dispatch }, id) {
      toast.info()
      const res = await remove(id)
      toast.hide()
      if (res.transaction_id) {
        toast.dialog("已删除！交易哈希：\n" + res.transaction_id).then(() => {
          dispatch(GET_TABLE_DATA_LIST)
        })
      } else {
        toast.dialog("删除失败，请重新删除！")
      }
    },

    async getTabList({ commit, state }, id) {
      let list = [...state.list], tabList = []
      switch (id) {
        case 0:
          tabList = list
          break
        case 1:
          tabList = list.filter(item => {
            return item.isDone === 0;
          })
          break
        default:
          tabList = list.filter(item => {
            return item.isDone === 1;
          })
          break
      }
      commit(HANDLE_TAB_ID, id)
      commit(HANDLE_TAB_LIST, tabList)
    }
  },

  mutations: {
    handleTableData(state, list) {
      state.list = [...list]
    },

    handelTabList(state, list) {
      state.tabList = [...list]
    },

    handelTabId(state, id) {
      state.tab = id
    },

    handleLoading(state, type) {
      state.loading = type
    }
  },
}

export default List