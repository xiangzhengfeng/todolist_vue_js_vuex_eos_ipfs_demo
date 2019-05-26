<template>
  <div id="app">
    <!-- <div class="loading" v-show="loading">
      <van-loading type="spinner"  color="red"/> 
    </div> -->
    <div id="todolist">
      <Title />
      <Input />
      <List />
    </div>
  </div>
</template>

<script>
import Title from "./components/Title";
import Input from "./components/Input";
import List from "./components/List";
//import { mapState } from "vuex";

export default {
  name: "App",
  components: {
    Title,
    Input,
    List
  },
  data() {
    return {};
  },
 /*  computed: {
    ...mapState({
      loading: state => state.List.loading
    })
  }, */
  methods: {}
};
</script>

<style>
* {
  padding: 0;
  margin: 0;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  min-height: 100vh;
  background-color: #0f4c81;
  position: relative;
}

#todolist {
  width: 90%;
  padding: 20px 0;
  margin: auto;
  opacity: 0.95;
}

.loading{
  background-color: rgba(0, 0, 0, 0);
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
