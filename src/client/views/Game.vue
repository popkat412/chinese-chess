<template>
  <div id="game">
    <header>
      <div class="status-bar">
        <p id="oppoennt-name">{{ opponentName }}</p>
        <div class="spacer"></div>
        <p>You're {{ myIdentity }} | {{ statusMsg }}</p>
        <div class="spacer"></div>
      </div>
    </header>
    <aside id="left-sidebar">
      <h2>Stuff</h2>
      <button @click="leaveGamePressed">Leave Game</button>
      <p>{{ numSpectators }} spectators</p>
    </aside>
    <GameCanvas />
    <aside id="right-sidebar">
      <h2>Chat</h2>
      <div id="chat-messages">
        <div v-for="(msg, index) in chatMessages" :key="index">
          <p>
            <strong>{{ msg.name }}:</strong> {{ msg.message }}
          </p>
        </div>
      </div>
      <div id="chat-input-bar">
        <input
          type="text"
          style="flex-grow: 1; margin-right: 5px"
          v-model="currentlyTypingMessage"
          @keyup.enter="sendMessage"
        />
        <button @click="sendMessage">Send</button>
      </div>
    </aside>
    <footer>
      <div class="status-bar">
        <p>
          Game link:
          <a :href="joinUrl" @click.prevent="copyJoinUrl">{{ joinUrl }}</a>
        </p>
        <div class="spacer"></div>
        <p id="my-name">{{ myName }}</p>
      </div>
    </footer>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import GameCanvas from "../components/Game/GameCanvas.vue";
import { namespace } from "vuex-class";
import {
  GAME_STATUS_CHANGED_EVENT,
  MessageData,
  MESSAGE_EVENT,
  SEND_MESSAGE_EVENT,
} from "../../shared/events";
import Game from "../../shared/chess/game";

const gameState = namespace("gameState");

@Component({
  components: { GameCanvas },
  sockets: {
    [GAME_STATUS_CHANGED_EVENT]: function (this: GameComponent) {
      alert(this.game?.statusMsg);
    },
    [MESSAGE_EVENT]: function (this: GameComponent, data: MessageData) {
      this.chatMessages.push(data);
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

  chatMessages: MessageData[] = [];
  currentlyTypingMessage = "";

  // Hooks
  created(): void {
    if (!this.game) {
      this.$router.replace({ path: "/", query: this.$route.query });
      return;
    }
  }

  // Methods
  sendMessage(): void {
    const msg = this.currentlyTypingMessage.trim();
    console.log(`Sending message ${msg}`);
    console.log(`Message length: ${msg.length}`);
    if (msg.length == 0) return;
    this.$socket.client.emit(SEND_MESSAGE_EVENT, msg);
    this.currentlyTypingMessage = "";
  }

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
  grid-template-columns: 1fr 3fr 1fr;
  grid-template-rows: 4em auto 4em;
  height: 100vh;
  grid-template-areas:
    "header header  header"
    "left   canvas  right"
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
#game > footer,
#game > header {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
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
  display: flex;
  flex-direction: column;
}

.status-bar {
  width: 100%;
  display: flex;
}

.spacer {
  flex-grow: 1;
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

/* Chat */
#chat-messages {
  overflow: scroll;
  flex-grow: 1;
  height: 0;
}
#chat-input-bar {
  display: flex;
  flex-direction: horizontal;
  width: 100%;
  height: 2em;
  margin-top: 10px;
}
</style>
