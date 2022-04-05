import themes from './themes';
import cursors from './cursors';
import { possibleMove } from './utils';

import { generateTeam, generatePosition } from './generators';

import Team from './Team';
import GamePlay from './GamePlay';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.selectedCharacter = false;
    this.indexOfSelectedCharacter = null;
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
    const characterHere = this.positioned.find(
      (character) => character.position === index,
    );

    if (characterHere) {
      const {
        level, attack, defence, health,
      } = characterHere.character;

      this.gamePlay.showCellTooltip(
        `🎖${level} ⚔${attack} 🛡${defence} ❤${health}`,
        index,
      );
    }

    if (this.indexOfSelectedCharacter) {
      const numOfSteps = this.positioned.find(
        (character) => character.position === this.indexOfSelectedCharacter,
      ).character.moveDistance;

      if (numOfSteps) {
        const allowedMove = possibleMove(
          this.indexOfSelectedCharacter,
          index,
          numOfSteps,
        );
        if (this.selectedCharacter === true && allowedMove) {
          this.gamePlay.selectCell(index, 'green');
          if (characterHere && characterHere.character.team === 'comp') {
            this.gamePlay.selectCell(index, 'red');
            this.gamePlay.setCursor(cursors.crosshair);
          } else if (
            characterHere
            && characterHere.character.team === 'human'
          ) {
            this.gamePlay.selectCell(index, '');
          }
        } else {
          this.gamePlay.setCursor(cursors.notallowed);
        }
      }
    }
  }

  onCellLeave(index) {
    this.gamePlay.hideCellTooltip(index);
    if (index !== this.indexOfSelectedCharacter) {
      this.gamePlay.deselectCell(index);
      this.gamePlay.setCursor(cursors.pointer);
    }
  }

  onCellClick(index) {
    const characterHere = this.positioned.find(
      (character) => character.position === index,
    );
    if (characterHere) {
      const { team } = characterHere.character;
      if (team === 'comp') {
        GamePlay.showError('It is not your character. Choose yours');
        this.gamePlay.deselectCell(this.indexOfSelectedCharacter || index);
      } else {
        this.selectedCharacter = true;
        this.gamePlay.deselectCell(this.indexOfSelectedCharacter || index);
        this.gamePlay.selectCell(index);
        this.indexOfSelectedCharacter = index;
        this.gamePlay.setCursor(cursors.pointer);
      }
    }
  }
}
