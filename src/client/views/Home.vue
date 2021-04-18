<template>
  <div id="home">
    <JoinGame />
    <CreateGame />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import CreateGame from "../components/Home/CreateGame.vue";
import JoinGame from "../components/Home/JoinGame.vue";

@Component({
  components: {
    JoinGame,
    CreateGame,
  },
})
export default class Home extends Vue {}
</script>
