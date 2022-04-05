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
    this.playersTurn = true;
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
    this.positionedA = [...positionedTeamComp, ...positionedTeamComp];
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
        if (this.selectedCharacter && allowedMove) {
          this.gamePlay.selectCell(index, 'green');
          this.gamePlay.setCursor(cursors.pointer);
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
    if (this.playersTurn) {
      const characterHere = this.positioned.find(
        (character) => character.position === index,
      );
      if (characterHere) {
        const { team } = characterHere.character;
        if (team === 'comp') {
          GamePlay.showError('It is not your character. Choose yours');
          this.gamePlay.deselectCell(this.indexOfSelectedCharacter || index);
        } else {
          this.selectedCharacter = characterHere;
          this.gamePlay.deselectCell(this.indexOfSelectedCharacter || index);
          this.gamePlay.selectCell(index);
          this.indexOfSelectedCharacter = index;
          this.gamePlay.setCursor(cursors.pointer);
        }
      }

      if (!characterHere && this.selectedCharacter) {
        const numOfSteps = this.selectedCharacter.character.moveDistance;
        const allowedMove = possibleMove(
          this.indexOfSelectedCharacter,
          index,
          numOfSteps,
        );
        if (allowedMove) {
          this.positioned = [...this.positioned].filter(
            (character) => character.position !== this.indexOfSelectedCharacter,
          );
          this.selectedCharacter.position = index;
          this.positioned.push(this.selectedCharacter);
          this.selectedCharacter = null;
          this.indexOfSelectedCharacter = null;
          this.gamePlay.redrawPositions(this.positioned);
          this.gamePlay.cells.forEach((cell) => cell.classList.remove(
            'selected-yellow',
            'selected-green',
            'selected-red',
          ));
          this.playersTurn = false;
        } else {
          GamePlay.showError('It is not allowed to move here');
        }
      }
    }
  }
}
