<template>
  <div>
    <van-field
      class="input animated fadeInDown"
      v-model="text"
      label="事项"
      label-width="40"
      placeholder="请输入待办事项"
      right-icon="plus"
      maxlength="100"
      @click-right-icon="add"
    />
  </div>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  props: {},
  data() {
    return {
      text: ""
    };
  },
  methods: {
    ...mapActions(['handleAdd']),
    add() {
      if (this.text === "") {
        this.$notify("请输入待办事项后再进行添加");
        return;
      }
      this.handleAdd(this.text);
      this.text = "";
    }
  }
};
</script>

<style scoped>
.input {
  color: #0f4c81;
  border-radius: 3px;
  font-size: 16px;
  padding-left: 10px;
}
</style>
