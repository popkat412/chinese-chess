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
import { PersonRole } from "../../../shared/chess/person";
import { PieceSide } from "../../../shared/chess/piece";
import { Component, Vue } from "vue-property-decorator";
import validateNickname from "../../../shared/validation";
import axios from "axios";
import CreateGameModel from "../../../shared/models/createGame";
import { JoinGameActionPayload } from "../../store/gameState";

@Component
export default class CreateGame extends Vue {
  name = "";
  role = PersonRole.Player;
  side = PieceSide.Red;

  createGameBoxStyle = {
    filter: `opacity(${/*urlParamGameId ? "20%" : */ "100%"})`,
  };

  async createGamePressed(): Promise<void> {
    console.log("Create game pressed");

    // Validate form inputs
    const nicknameValidation = validateNickname(this.name);
    if (nicknameValidation != true) {
      alert(nicknameValidation);
      return;
    }

    try {
      const gameId = (await axios.get<CreateGameModel>("/createGame")).data
        .gameId;
      this.$store.commit("gameState/setGameId", gameId);

      const payload: JoinGameActionPayload = {
        data: {
          gameId,
          role: this.role,
          name: this.name,
          side: this.side,
        },
        socket: this.$socket.client,
      };
      this.$store.dispatch("gameState/joinGame", payload);
    } catch (e) {
      console.error(e);
      alert(`Error creating game: ${e}`);
      return;
    }
  }
}
</script>

<style></style>
