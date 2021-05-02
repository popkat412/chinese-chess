import type { PersonRole } from "../chess/person";

export default interface GameInfoModel {
  availableRoles: PersonRole[];
  numPlayers: number;
}
