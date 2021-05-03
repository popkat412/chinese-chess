import { Type } from "class-transformer";
import { OPPOSITE_SIDE } from "../constants";
import { Board } from "./board";
import Person, { PersonRole } from "./person";
import { PieceSide } from "./piece";

export enum GameStatus {
  Ongoing = "Ongoing",
  HasWinner = "HasWinner",
  Draw = "Draw",
}

export default class Game {
  @Type(() => Board)
  board: Board = new Board();

  @Type(() => Person)
  people: Map<string, Person> = new Map();

  // ! IMPORTANT: Remember to emit GAME_STATUS_CHANGED_EVENT when changing this server side
  gameStatus: GameStatus = GameStatus.Ongoing;
  // This will only *not* be null when gameState is HasWinner
  winner: PieceSide | null = null;

  get players(): Person[] {
    return Array.from(this.people.values()).filter(
      (v) => v.role == PersonRole.Player
    );
  }

  get spectators(): Person[] {
    return Array.from(this.people.values()).filter(
      (v) => v.role == PersonRole.Spectator
    );
  }

  get availableRoles(): PersonRole[] {
    const roles: PersonRole[] = [PersonRole.Spectator];
    if (this.players.length < 2) roles.push(PersonRole.Player);
    return roles;
  }

  get statusMsg(): string {
    switch (this.gameStatus) {
      case GameStatus.HasWinner:
        return `Game over: ${
          this.winner == PieceSide.Red ? "Red" : "Black"
        } wins`;
      case GameStatus.Draw:
        return "Game over: Draw";
      default:
        return `It's ${this.board.currentSide}'s turn`;
    }
  }

  getNameForPlayerWithId(playerId: string): string {
    return this.people.get(playerId)?.name ?? "";
  }

  getOpponentName(currentPlayerId: string): string {
    const defaultName = "No opponent";

    const currentPlayerSide = this.people.get(currentPlayerId)?.side;
    if (!currentPlayerSide) return defaultName;

    for (const [, person] of this.people) {
      if (
        person.role == PersonRole.Player &&
        person.side == OPPOSITE_SIDE[currentPlayerSide]
      ) {
        return person.name;
      }
    }

    return defaultName;
  }
}
