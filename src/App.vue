<template>
  <div id="app">
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
}

#todolist {
  width: 90%;
  padding: 20px 0;
  margin: auto;
  opacity: 0.95;
}
</style>
