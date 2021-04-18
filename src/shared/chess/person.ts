import { PieceSide } from "@shared/chess/piece";

export enum PersonRole {
  Spectator = "Spectator",
  Player = "Player",
}

export default class Person {
  name: string;
  role: PersonRole;
  side: PieceSide | null;

  constructor(name: string, role: PersonRole, side: PieceSide | null = null) {
    this.name = name;
    this.role = role;
    this.side = side;
  }
}
