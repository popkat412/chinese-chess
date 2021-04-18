import { PersonRole } from "../chess/person";

export default interface GameInfo {
  availableRoles: PersonRole[];
  numPlayers: number;
}
