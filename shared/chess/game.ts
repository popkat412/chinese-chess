import { Exclude, Type } from "class-transformer";
import { Board } from "./board";
import Person, { PersonRole } from "./person";

export default class Game {
  @Type(() => Board) board: Board = new Board();
  @Type(() => Person) people: Map<string, Person> = new Map();

  @Exclude()
  get players(): Person[] {
    return Array.from(this.people.values()).filter(v => v.role == PersonRole.Player);
  }

  @Exclude()
  get availableRoles(): PersonRole[] {
    let roles: PersonRole[] = [PersonRole.Spectator];
    if (this.players.length < 2) roles.push(PersonRole.Player);
    return roles;
  }
}