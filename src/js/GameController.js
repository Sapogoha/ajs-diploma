import themes from './themes';

import { generateTeam, generatePosition } from './generators';

import Team from './Team';
import GamePlay from './GamePlay';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.selectedCharacter = null;
  }

  init() {
    this.gamePlay.drawUi(themes.prairie);
    this.drawCharacters();
    this.addListeners();
  }

  drawCharacters() {
    const teamHuman = generateTeam(new Team().teamHuman, 1, 2);
    const teamComp = generateTeam(new Team().teamComp, 1, 2);
    const positionedTeamHuman = generatePosition(teamHuman, 'human');
    const positionedTeamComp = generatePosition(teamComp, 'comp');

    this.positioned = [...positionedTeamHuman, ...positionedTeamComp];
    this.gamePlay.redrawPositions(this.positioned);
  }

  addListeners() {
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
  }

  onCellEnter(index) {
    const {
      level, attack, defence, health,
    } = this.positioned.find(
      (character) => character.position === index,
    ).character;
    this.gamePlay.showCellTooltip(
      `🎖${level} ⚔${attack} 🛡${defence} ❤${health}`,
      index,
    );
  }

  onCellLeave(index) {
    this.gamePlay.hideCellTooltip(index);
  }

  onCellClick(index) {
    const { team } = this.positioned.find(
      (character) => character.position === index,
    ).character;
    if (team === 'comp') {
      GamePlay.showError('It is not your character. Choose yours');
      this.gamePlay.deselectCell(this.selectedCharacter || index);
    } else {
      this.gamePlay.deselectCell(this.selectedCharacter || index);
      this.gamePlay.selectCell(index);
      this.selectedCharacter = index;
    }
  }
}
