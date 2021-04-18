<template>
  <div id="game">
    <header>
      <p id="oppoennt-name">{{ opponentName }}</p>
      <p style="width: 100%; text-align: center">
        You're {{ role }} | It's {{ whosTurn }}'s turn
      </p>
    </header>
    <aside id="left-sidebar">
      <h2>Stuff</h2>
      <button @click="leaveGamePressed">Leave Game</button>
      <p>{{ numSpectators }} spectators</p>
    </aside>
    <div id="canvas-container"></div>
    <aside id="right-sidebar">
      <h2>Chat</h2>
      <p>Coming soon</p>
    </aside>
    <footer>
      <p style="float: left">
        Game link:
        <a :href="joinUrl" @click.prevent="copyJoinUrl">{{ joinUrl }}</a>
      </p>
      <p id="my-name">{{ myName }}</p>
    </footer>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component
export default class Game extends Vue {}
</script>

<style scoped>
/* ---------------
        GAME
   --------------- */

/* Grid */
#game-container {
  display: grid;
  grid-template-columns: 1fr 4fr 1fr;
  grid-template-areas:
    "header header  header"
    "left   canvas right"
    "left   canvas right"
    "footer footer  footer";
}

#game-container > header {
  grid-area: header;
  padding: 0px 10px 0px 10px;
  border-bottom: 1px solid gray;
}
#game-container > footer {
  grid-area: footer;
  padding: 0px 10px 0px 10px;
  border-top: 1px solid gray;
}
#left-sidebar {
  grid-area: left;
  padding: 10px;
  border-right: 1px solid gray;
}
#right-sidebar {
  grid-area: right;
  padding: 10px;
  border-left: 1px solid gray;
}
#canvas-container {
  grid-area: canvas;
}

/* Misc */
#game-container > header {
  display: flex;
  flex-direction: row;
}

/* Name labels */
#oppoennt-name {
  border-right: 1px solid gray;
  float: left;
  padding-right: 10px;
}

#my-name {
  border-left: 1px solid gray;
  float: right;
  padding-left: 10px;
}

/* Canvas */
#canvas-container {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
