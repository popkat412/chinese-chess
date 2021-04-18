<template>
  <div
    class="container"
    :style="createGameBoxStyle"
    @mouseenter="createGameBoxStyle.filter = 'opacity(100%)'"
  >
    <p>Create Game</p>
    <label for="create:name">Nickname</label>
    <input type="text" id="create:name" v-model="name" />
    <br />
    <label for="create:role">Role</label>
    <select id="create:role" v-model="role">
      <option value="Player">Player</option>
      <option value="Spectator">Spectator</option>
    </select>
    <br />
    <label for="create:side">Side</label>
    <select id="create:side" v-model="side">
      <option value="red">Red</option>
      <option value="black">Black</option>
    </select>
    <br />
    <button @click="createGamePressed" class="landing-button">Create!</button>
  </div>
</template>

<script lang="ts">
import { PersonRole } from "@shared/chess/person";
import { PieceSide } from "@shared/chess/piece";
import { Component, Vue } from "vue-property-decorator";

@Component
export default class CreateGame extends Vue {
  name = "";
  role = PersonRole.Player;
  side = PieceSide.Red;

  createGameBoxStyle = {
    filter: `opacity(${/*urlParamGameId ? "20%" : */ "100%"})`,
  };

  createGamePressed(): void {
    console.log("Create game pressed");
  }
}
</script>

<style></style>
