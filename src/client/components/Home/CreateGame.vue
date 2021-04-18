<template>
  <div class="container">
    <p>Join Game</p>
    <label for="join:gameid">Game Id</label>
    <input type="text" id="join:gameid" v-model="joinGameData.gameId" />
    <br />
    <label for="join:name">Nickname</label>
    <input type="text" id="join:name" v-model="joinGameData.name" />
    <br />
    <label for="join:role">Role</label>
    <select id="join:role" v-model="joinGameData.role">
      <option value="Player">Player</option>
      <option value="Spectator">Spectator</option>
    </select>
    <br />
    <div :class="{ dimmed: joinGameData.role == 'Spectator' }">
      <label for="join:side">Side</label>
      <select
        id="join:side"
        v-model="joinGameData.side"
        :disabled="joinGameData.role == 'Spectator'"
      >
        <option value="red">Red</option>
        <option value="black">Black</option>
      </select>
    </div>
    <br />
    <button @click="joinGamePressed" class="landing-button">Join!</button>
  </div>
</template>

<script lang="ts">
import { Vue } from "vue-property-decorator";

export default class CreateGame extends Vue {}
</script>

<style></style>
