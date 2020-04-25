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
  methods: {
    async getIpfsNodeInfo() {
      try {
        // Await for ipfs node instance.
        const ipfs = await this.$ipfs;
        // Call ipfs `id` method.
        // Returns the identity of the Peer.
        const { agentVersion, id } = await ipfs.id();
        console.log(ipfs)
        /* this.agentVersion = agentVersion;
        this.id = id;
        // Set successful status text.
        this.status = "Connected to IPFS =)"; */
      } catch (err) {
        // Set error status text.
        //this.status = `Error: ${err}`;
        console.log('err', err)
      }
    }
  },
  created() {
    this.getIpfsNodeInfo();
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
  width: 350px;
  background-color: #0f4c81;
  position: relative;
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
