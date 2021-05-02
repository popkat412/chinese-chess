<template>
  <div id="home">
    <JoinGame />
    <CreateGame />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { JoinGameData, JOIN_GAME_EVENT } from "../../shared/events";
import CreateGame from "../components/Home/CreateGame.vue";
import JoinGame from "../components/Home/JoinGame.vue";

@Component({
  components: {
    JoinGame,
    CreateGame,
  },
})
export default class Home extends Vue {
  joinGame(data: JoinGameData): void {
    if (this.$socket.connected) {
      console.warn("Socket already open");
      alert("An unexpected error occurred");
      return;
    }

    this.$socket.client.connect();
    this.$socket.client.emit(JOIN_GAME_EVENT, data);

    // Showing canvas will be set to true when READY_EVENT is received,
    // this is not a bug
  }
}
</script>
