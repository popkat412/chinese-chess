import { PersonRole } from "../shared/chess/person";
import { JoinGameData } from "../shared/events";
import ValidateJoinResult from "../shared/models/validateJoinResult";
import { validateNickname } from "../shared/validation";
import state from "./state";

export function validateJoinGameData(data: JoinGameData): ValidateJoinResult {
  // Check if game exists
  const game = state.games[data.gameId];

  if (!game) {
    return {
      valid: false,
      errorMessage: `No game with id ${data.gameId} exists`,
    };
  }

  // Check if role is valid
  if (data.role == PersonRole.Player) {
    if (!data.side) {
      return {
        valid: false,
        errorMessage: "Role is player but no side is specified",
      };
    }

    const numPlayersAlreadyInGame = game.players.length;

    if (numPlayersAlreadyInGame == 2) {
      return {
        valid: false,
        errorMessage: "Game already has 2 players",
      };
    } else if (numPlayersAlreadyInGame == 1) {
      if (game.players[0].side == data.side) {
        return {
          valid: false,
          errorMessage: `Game already has player on side ${data.side}`,
        };
      }
    }
  }

  // Check name
  if (!data.name) {
    return {
      valid: false,
      errorMessage: "Nickname required",
    };
  } else {
    const validateName = validateNickname(data.name);
    if (validateName != true) {
      return {
        valid: false,
        errorMessage: validateName,
      };
    }
    // Check if duplicate
    if (
      Array.from(game.people.values()).filter((v) => v.name == data.name)
        .length > 0
    ) {
      return {
        valid: false,
        errorMessage: "Somebody else already has that name",
      };
    }
  }

  return {
    valid: true,
    errorMessage: "",
  };
}
