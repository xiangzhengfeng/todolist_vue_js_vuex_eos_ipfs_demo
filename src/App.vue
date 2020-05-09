<template>
  <div id="app">
    <div class="position"></div>
    <div id="todolist">
      <Title />
      <Input />
      <List />
    </div>
    <div class="position position-down"></div>
  </div>
</template>

<script>
import Title from "./components/Title";
import Input from "./components/Input";
import List from "./components/List";

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
  methods: {},
  created() {},
  mounted() {
    /* window.onload = function() {
      console.log(window.ToDoListExtension);
      if (typeof window.ToDoListExtension != "undefined") {
        alert("ToDoList 扩展存在");
      }
    }; */
  }
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
  width: 100vw;
  background-color: #0f4c81;
  position: relative;
}

.position {
  height: 20px;
  width: 100vw;
  background-color: #0f4c81;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
}

.position-down {
  top: calc(100vh - 20px);
}

body::-webkit-scrollbar {
  display: none !important;
}

#todolist {
  width: 90%;
  padding: 20px 0;
  margin: auto;
  opacity: 0.95;
}

.loading {
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
