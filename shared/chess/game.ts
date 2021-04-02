import { Exclude, Type } from "class-transformer";
import { OPPOSITE_SIDE } from "../constants";
import { Board } from "./board";
import Person, { PersonRole } from "./person";

export default class Game {
  @Type(() => Board) board: Board = new Board();
  @Type(() => Person) people: Map<string, Person> = new Map();

  @Exclude()
  get players(): Person[] {
    return Array.from(this.people.values()).filter(
      (v) => v.role == PersonRole.Player
    );
  }

  @Exclude()
  get spectators(): Person[] {
    return Array.from(this.people.values()).filter(
      (v) => v.role == PersonRole.Spectator
    );
  }

  @Exclude()
  get availableRoles(): PersonRole[] {
    let roles: PersonRole[] = [PersonRole.Spectator];
    if (this.players.length < 2) roles.push(PersonRole.Player);
    return roles;
  }

  getNameForPlayerWithId(playerId: string): string {
    return this.people.get(playerId)?.name ?? "";
  }

  getOpponentName(currentPlayerId: string): string {
    const defaultName = "No opponent yet";

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
