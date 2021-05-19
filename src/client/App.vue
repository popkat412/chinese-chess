<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { namespace } from "vuex-class";
import { ERROR_EVENT, READY_EVENT } from "../shared/events";
import { Socket as SocketDecorator } from "vue-socket.io-extended";

const gameState = namespace("gameState");

@Component
export default class App extends Vue {
  // Vuex
  @gameState.State gameId!: string | null;

  // Sockets
  @SocketDecorator()
  connect(): void {
    console.log("🔌 socket conencted");
  }

  @SocketDecorator()
  disconnect(): void {
    console.log("🔌 socket disconnected");
    this.$store.commit("gameState/reset");
  }

  @SocketDecorator(READY_EVENT)
  onReadyEvent(this: App): void {
    console.log("ready event");
    this.$router.push({
      path: "/game",
      // By the time the READY event is sent, the gameId should have already been sent over
      query: this.gameId ? { gameId: this.gameId } : {},
    });
  }

  @SocketDecorator(ERROR_EVENT)
  onErrorEvent(errorMsg: string): void {
    console.log("showing error alert...");
    alert(errorMsg);
  }

  // Hooks
  created(): void {
    this.$socket.client.onAny((event, args) => {
      console.info(event, args);
    });
  }

  beforeDestroy(): void {
    this.$socket.client.offAny();
  }
}
</script>

<style>
/* ---------------
      GENERAL
   --------------- */
body {
  font-family: Arial, Helvetica, sans-serif;
  margin: 0px;
  padding: 0px;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

#app {
  width: 100%;
  height: 100%;
}

.dimmed {
  filter: opacity(40%);
}

/* ---------------
       LANDING
   --------------- */
#home {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
}

.container {
  border: 1px solid black;
  border-radius: 10px;

  width: 30%;

  padding: 10px;
  margin: 10px;

  transition: 1s;
}

@media screen and (max-width: 600px) {
  #home {
    flex-direction: column;
    align-items: left;
  }

  .container {
    width: 90%;
  }
}

.landing-button {
  width: 100%;
  box-sizing: border-box;
  margin-top: 10px;
}
</style>
