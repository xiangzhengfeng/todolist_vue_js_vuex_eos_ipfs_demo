<template>
  <div style="width: 100%">
    <div class="tip animated fadeInLeft" v-if="list.length === 0 && type === 'list'">{{ '暂无待办事项'}}</div>
    <div
      class="tip animated fadeInRight"
      v-if="list.length !== 0 &&  type === 'list'"
    >{{ '向左滑动可进行操作待办事项，点击可查看详情' }}</div>
    <div
      class="tip animated fadeInDown"
      style="color: gray;"
      v-show="tabList.length === 0 &&  type === 'item'"
    >{{'暂无事项'}}</div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  props: {
    type: {
      default: () => "",
      type: String
    }
  },
  computed: {
    ...mapState({
      list: state => state.List.list,
      tabList: state => state.List.tabList,
    }),
  },
  data() {
    return {}
  },
  methods: {},
  mounted(){}
};
</script>

<style scoped>
.tip {
  color: #0f4c81;
  font-size: 12px;
  padding: 5px 0;
  width: 100%;
  background-color: white;
  text-align: center;
}
</style>
