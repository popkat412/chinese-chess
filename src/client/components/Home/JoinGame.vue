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
import { PersonRole } from "@shared/chess/person";
import { PieceSide } from "@shared/chess/piece";
import { Component, Vue } from "vue-property-decorator";

@Component
export default class JoinGame extends Vue {
  gameId = "";
  name = "";
  role = PersonRole.Player;
  side = PieceSide.Red;

  joinGamePressed(): void {
    console.log("Join game pressed");
    this.$router.push("/game");
  }
}
</script>

<style></style>
