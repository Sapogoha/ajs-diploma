import themes from './themes';

import { generateTeam, generatePosition } from './generators';

import Team from './Team';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
  }

  init() {
    this.gamePlay.drawUi(themes.prairie);
    const teamHuman = generateTeam(new Team().teamHuman, 1, 2);
    const teamComp = generateTeam(new Team().teamComp, 1, 2);
    const positionedTeamHuman = generatePosition(teamHuman, 1, 2);
    const positionedTeamComp = generatePosition(teamComp, 7, 8);

    this.positioned = [...positionedTeamHuman, ...positionedTeamComp];
    this.gamePlay.redrawPositions(this.positioned);
  }
}

// onCellClick(index) {
//   // TODO: react to click
// }

// onCellEnter(index) {
//   // TODO: react to mouse enter
// }

// onCellLeave(index) {
//   // TODO: react to mouse leave
// }
// }
