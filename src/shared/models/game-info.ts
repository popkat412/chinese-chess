import { PersonRole } from "@shared/chess/person";

export default interface GameInfo {
  availableRoles: PersonRole[];
  numPlayers: number;
}
