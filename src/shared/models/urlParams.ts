import { PersonRole } from "../chess/person";
import { PieceSide } from "../chess/piece";

export default interface UrlParams {
  gameId: string | undefined;
  role: PersonRole | undefined;
  side: PieceSide | undefined;
}
