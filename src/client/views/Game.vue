<template>
  <div id="game">
    <header>
      <p id="oppoennt-name">{{ opponentName }}</p>
      <p style="width: 100%; text-align: center">
        You're {{ myIdentity }} | {{ statusMsg }}
      </p>
    </header>
    <aside id="left-sidebar">
      <h2>Stuff</h2>
      <button @click="leaveGamePressed">Leave Game</button>
      <p>{{ numSpectators }} spectators</p>
    </aside>
    <GameCanvas />
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
import GameCanvas from "../components/Game/GameCanvas.vue";
import { namespace } from "vuex-class";
import { GAME_STATUS_CHANGED_EVENT } from "../../shared/events";
import Game from "../../shared/chess/game";

const gameState = namespace("gameState");

@Component({
  components: { GameCanvas },
  sockets: {
    [GAME_STATUS_CHANGED_EVENT]: function (
      this: GameComponent
      // _newStatus: GameStatus
    ) {
      alert(this.game?.statusMsg);
    },
  },
})
export default class GameComponent extends Vue {
  // State
  @gameState.Getter opponentName!: string | undefined;
  @gameState.Getter myName!: string | undefined;
  @gameState.Getter myIdentity!: string | undefined;
  @gameState.Getter numSpectators!: string | undefined;
  @gameState.Getter joinUrl!: string | undefined;
  @gameState.State game!: Game | null;

  // Hooks
  created(): void {
    if (!this.game) {
      this.$router.replace({ path: "/", query: this.$route.query });
      return;
    }
  }

  // Methods
  leaveGamePressed(): void {
    console.log("Leave game pressed");
    this.$socket.client.disconnect();
    this.$router.back();
  }

  async copyJoinUrl(): Promise<void> {
    if (!this.joinUrl) return;
    await navigator.clipboard.writeText(this.joinUrl);
    alert("Copied to clipboard!");
  }

  // Getters
  get statusMsg(): string | undefined {
    return this.game?.statusMsg;
  }
}
</script>

<style scoped>
/* Grid */
#game {
  display: grid;
  grid-template-columns: 1fr 4fr 1fr;
  grid-template-areas:
    "header header  header"
    "left   canvas right"
    "left   canvas right"
    "footer footer  footer";
}

#game > header {
  grid-area: header;
  padding: 0px 10px 0px 10px;
  border-bottom: 1px solid gray;
}
#game > footer {
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

/* Misc */
#game > header {
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
</style>
