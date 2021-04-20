<template>
  <div class="container">
    <p>Join Game</p>
    <label for="join:gameid">Game Id</label>
    <input type="text" id="join:gameid" v-model="gameId" />
    <br />
    <label for="join:name">Nickname</label>
    <input type="text" id="join:name" v-model="name" />
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
import { JoinGameData, JOIN_GAME_EVENT } from "../../../shared/events";
import axios from "../../axios";
import ValidateJoinResult from "../../../shared/models/validate-join-result";

@Component
export default class JoinGame extends Vue {
  gameId = "";
  name = "";
  role = PersonRole.Player;
  side = PieceSide.Red;
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
    const res = (
      await axios.post<ValidateJoinResult>("/validateJoin", joinGameData)
    ).data;

    if (!res.valid) {
      alert(`Error: ${res.errorMessage}`);
      return;
    }

    // Prepare the data
    const data: JoinGameData = {
      gameId: this.gameId,
      name: this.name,
      role: this.role,
      side: this.side,
    };

    // this.joinGame(data);
    this.$emit("join-game", data);
  }
}
</script>

<style></style>
