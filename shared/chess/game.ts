import { Exclude, Type } from "class-transformer";
import { Board } from "./board";
import Person, { PersonRole } from "./person";

export default class Game {
  @Type(() => Board) board: Board = new Board();
  @Type(() => Person) people: Person[] = [];

  @Exclude()
  get players(): Person[] {
    return this.people.filter(v => v.role == PersonRole.Player);
  }

  @Exclude()
  get availableRoles(): PersonRole[] {
    let roles: PersonRole[] = [PersonRole.Spectator];
    if (this.players.length < 2) roles.push(PersonRole.Player);
    return roles;
  }
}