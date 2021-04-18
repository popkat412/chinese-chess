<template>
  <div>
    <JoinGame />
    <CreateGame />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import JoinGame from "../components/Home/JoinGame.vue";
import CreateGame from "../components/Home/CreateGame.vue";

@Component({
  components: {
    JoinGame,
    CreateGame,
  },
})
export default class Home extends Vue {}
</script>
