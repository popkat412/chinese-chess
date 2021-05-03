<template>
  <div class="container">
    <p>Join Game</p>
    <label for="join:gameid">Game Id</label>
    <input type="text" id="join:gameid" v-model="gameId" />
    <br />
    <label for="join:name">Nickname</label>
    <input type="text" id="join:name" v-model="name" ref="nameInput" />
    <br />
    <label for="join:role">Role</label>
    <select id="join:role" v-model="role">
      <option value="Player">Player</option>
      <option value="Spectator">Spectator</option>
    </select>
    <br />
    <div :class="{ dimmed: role == 'Spectator' }">
      <label for="join:side">Side</label>
      <select id="join:side" v-model="side" :disabled="role == 'Spectator'">
        <option value="red">Red</option>
        <option value="black">Black</option>
      </select>
    </div>
    <br />
    <button @click="joinGamePressed" class="landing-button">Join!</button>
  </div>
</template>

<script lang="ts">
import { PersonRole } from "../../../shared/chess/person";
import { PieceSide } from "../../../shared/chess/piece";
import { Component, Vue } from "vue-property-decorator";
import { JoinGameData } from "../../../shared/events";
import axios from "axios";
import ValidateJoinResult from "../../../shared/models/validateJoinResultModel";
import { JoinGameActionPayload } from "../../store/gameState";
import UrlParams from "../../../shared/models/urlParamsModel";

@Component
export default class JoinGame extends Vue {
  // State
  gameId = "";
  name = "";
  role = PersonRole.Player;
  side = PieceSide.Red;

  // Hooks
  created(): void {
    const urlParams = (this.$route.query as unknown) as UrlParams;

    if (urlParams.gameId) this.gameId = urlParams.gameId;
    if (urlParams.role) this.role = urlParams.role;
    if (urlParams.side) this.side = urlParams.side;
  }

  mounted(): void {
    const urlParams = (this.$route.query as unknown) as UrlParams;

    if (urlParams.gameId || urlParams.role || urlParams.side) {
      console.log(this.$refs);
      (this.$refs.nameInput as HTMLInputElement).focus();
    }
  }

  // Methods
  async joinGamePressed(): Promise<void> {
    // Validate form inputs
    if (this.gameId.trim() == "") {
      alert("Game ID is required");
      return;
    }

    const joinGameData: JoinGameData = {
      gameId: this.gameId,
      name: this.name,
      role: this.role,
      side: this.side,
    };

    console.log(`joinGameData: ${JSON.stringify(joinGameData)}`);

    // Validate form inputs
    const res = (
      await axios.post<ValidateJoinResult>("/validateJoin", joinGameData)
    ).data;

    if (!res.valid) {
      alert(`Error: ${res.errorMessage}`);
      return;
    }

    // Actual stuff
    this.$store.commit("gameState/setGameId", this.gameId);
    const payload: JoinGameActionPayload = {
      data: joinGameData,
      socket: this.$socket.client,
    };
    this.$store.dispatch("gameState/joinGame", payload);
  }
}
</script>

<style></style>
