import themes from './themes';
import cursors from './cursors';
import { possibleMove, countPossibleIndexes } from './utils';

import {
  generateTeam,
  generatePosition,
  characterGenerator,
} from './generators';

import Team from './Team';
import GamePlay from './GamePlay';
import GameState from './GameState';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    // this.state = GameState.from({});
    this.selectedCharacter = false;
    this.indexOfSelectedCharacter = null;
    this.playersTurn = true;
    this.previouslySelected = null;

    this.level = 1;
    this.points = 0;
    this.highestPoints = null;
  }

  init() {
    this.gamePlay.drawUi(Object.values(themes)[this.level - 1]);
    this.drawCharacters();
    this.addListeners();
  }

  drawCharacters() {
    this.teamHuman = generateTeam(new Team().teamHumanFirstLevel, 1, 2);
    this.teamComp = generateTeam(new Team().teamComp, 1, 2);
    this.positionedTeamHuman = generatePosition(this.teamHuman, 'human');
    this.positionedTeamComp = generatePosition(this.teamComp, 'comp');

    this.positioned = [...this.positionedTeamHuman, ...this.positionedTeamComp];
    this.gamePlay.redrawPositions(this.positioned);
  }

  addListeners() {
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));

    this.gamePlay.addNewGameListener(this.onNewGameClick.bind(this));
    // this.gamePlay.addSaveGameListener(this.onSaveGameClick.bind(this));
    // this.gamePlay.addLoadGameListener(this.onLoadGame.bind(this));
  }

  onCellEnter(index) {
    const characterHere = this.findCharacterHere(index);

    if (characterHere) {
      const {
        level, attack, defence, health,
      } = characterHere.character;

      this.gamePlay.showCellTooltip(
        `🎖${level} ⚔${attack} 🛡${defence} ❤${health}`,
        index,
      );
    }

    if (this.indexOfSelectedCharacter && this.selectedCharacter) {
      const numOfStepsToMove = this.findNumberOfStepsToMove();
      const numOfStepsToAttack = this.findNumberOfStepsToAttack();

      if (numOfStepsToMove || numOfStepsToAttack) {
        const allowedMove = possibleMove(
          this.indexOfSelectedCharacter,
          index,
          numOfStepsToMove,
        );
        const allowedAttack = possibleMove(
          this.indexOfSelectedCharacter,
          index,
          numOfStepsToAttack,
        );
        if (this.selectedCharacter) {
          if (allowedMove && !this.findCharacterHere(index)) {
            this.gamePlay.selectCell(index, 'green');
            this.gamePlay.setCursor(cursors.pointer);
          }
          if (characterHere?.character.team === 'comp' && allowedAttack) {
            this.gamePlay.selectCell(index, 'red');
            this.gamePlay.setCursor(cursors.crosshair);
          } else if (characterHere?.character.team === 'human') {
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
    if (
      this.positionedTeamHuman.length > 0
      && this.level <= 4
      && this.positionedTeamComp.length !== 0
    ) {
      const characterHere = this.findCharacterHere(index);
      if (characterHere) {
        const { team } = characterHere.character;
        if (team === 'comp' && !this.selectedCharacter) {
          GamePlay.showError('It is not your character. Choose yours');
          this.gamePlay.deselectCell(this.indexOfSelectedCharacter || index);
        } else {
          this.previouslySelected = this.selectedCharacter;
          this.selectedCharacter = characterHere;
          this.gamePlay.deselectCell(this.indexOfSelectedCharacter || index);
          this.gamePlay.selectCell(index);
          this.indexOfSelectedCharacter = index;
          this.gamePlay.setCursor(cursors.pointer);
        }
      } else if (!this.selectedCharacter) {
        GamePlay.showError(
          'There is no character here. Choose any cell with a character',
        );
      }

      if (this.previouslySelected && characterHere) {
        const numOfSteps = this.previouslySelected.character.attackDistance;

        const allowedAttack = possibleMove(
          this.previouslySelected.position,
          index,
          numOfSteps,
        );
        const { team } = characterHere.character;
        if (team === 'human') {
          GamePlay.showMessage(
            'You have chosen another character from your team. Now chose its move',
          );
          this.gamePlay.selectCell(index);
        } else if (allowedAttack) {
          const competition = characterHere;
          const damageValue = Math.max(
            this.selectedCharacter.character.attack
              - competition.character.defence,
            this.selectedCharacter.character.attack * 0.1,
          );
          const damage = this.gamePlay.showDamage(index, damageValue);

          damage.then(() => {
            competition.character.health -= damageValue;

            const removed = this.positionedTeamComp.indexOf(competition);
            if (competition.character.health <= 0) {
              this.positionedTeamComp.splice(removed, 1);
              this.positioned = [
                ...this.positionedTeamHuman,
                ...this.positionedTeamComp,
              ];
              if (this.positionedTeamComp.length === 0) {
                this.playersTurn = true;
                this.levelUp();
              }
            }

            this.removeSelected();
            this.gamePlay.redrawPositions(this.positioned);
            this.computersMove();
          });

          this.selectedCharacter = null;
          this.indexOfSelectedCharacter = null;
          this.playersTurn = false;
        } else {
          GamePlay.showError('It is too far to attack this character');
          this.selectedCharacter = null;
          this.previouslySelected = null;
          this.removeSelected();
          this.computersMove();
        }
      }

      if (!characterHere && this.selectedCharacter) {
        const numOfSteps = this.findNumberOfStepsToMove();
        const allowedMove = possibleMove(
          this.indexOfSelectedCharacter,
          index,
          numOfSteps,
        );
        if (allowedMove) {
          this.positionedTeamHuman = [...this.positionedTeamHuman].filter(
            (character) => character.position !== this.indexOfSelectedCharacter,
          );
          this.selectedCharacter.position = index;
          this.positionedTeamHuman.push(this.selectedCharacter);
          this.positioned = [
            ...this.positionedTeamHuman,
            ...this.positionedTeamComp,
          ];
          this.selectedCharacter = null;
          this.indexOfSelectedCharacter = null;
          this.gamePlay.redrawPositions(this.positioned);
          this.removeSelected();
          this.playersTurn = false;
        } else {
          GamePlay.showError('It is not allowed to move there');
        }
        this.computersMove();
      }
    }
  }

  removeSelected() {
    this.gamePlay.cells.forEach((cell) => cell.classList.remove('selected-yellow', 'selected-green', 'selected-red'));
  }

  findCharacterHere(index) {
    return this.positioned.find((character) => character.position === index);
  }

  findNumberOfStepsToMove() {
    return this.selectedCharacter.character.moveDistance;
  }

  findNumberOfStepsToAttack() {
    return this.selectedCharacter.character.attackDistance;
  }

  computersMove() {
    if (!this.playersTurn) {
      const index = Math.floor(Math.random() * this.positionedTeamComp.length);
      const playingCharacter = this.positionedTeamComp[index];
      const playingCharacterIndex = playingCharacter.position;
      const numOfStepsToMove = playingCharacter.character.moveDistance;
      const numOfStepsToAttack = playingCharacter.character.attackDistance;
      const humansPositions = this.positionedTeamHuman.map(
        (element) => element.position,
      );
      const compsPositions = this.positionedTeamComp.map(
        (element) => element.position,
      );
      const possibleMoves = countPossibleIndexes(
        playingCharacterIndex,
        numOfStepsToMove,
      )
        .filter((move) => compsPositions.indexOf(move) === -1)
        .filter((move) => humansPositions.indexOf(move) === -1);

      const possibleAttacks = countPossibleIndexes(
        playingCharacterIndex,
        numOfStepsToAttack,
      );

      const possibleAttack = possibleAttacks.filter(
        (move) => humansPositions.indexOf(move) > -1,
      );
      let toAttack = null;
      if (possibleAttack.length === 1) {
        toAttack = possibleAttack[0];
      } else if (possibleAttack.length > 1) {
        toAttack = possibleAttack[Math.floor(Math.random() * possibleAttack.length)];
      }

      if (!toAttack) {
        this.positionedTeamComp = [...this.positionedTeamComp].filter(
          (character) => character.position !== playingCharacterIndex,
        );

        playingCharacter.position = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];

        this.positionedTeamComp.push(playingCharacter);
        this.positioned = [
          ...this.positionedTeamHuman,
          ...this.positionedTeamComp,
        ];
        this.gamePlay.redrawPositions(this.positioned);
      } else {
        const enemy = this.findCharacterHere(toAttack);

        const damageValue = Math.max(
          playingCharacter.character.attack - enemy.character.defence,
          playingCharacter.character.attack * 0.1,
        );

        const damage = this.gamePlay.showDamage(toAttack, damageValue);

        damage.then(() => {
          enemy.character.health -= damageValue;
          const removed = this.positionedTeamHuman.indexOf(enemy);
          if (enemy.character.health <= 0) {
            this.positionedTeamHuman.splice(removed, 1);
            this.positioned = [
              ...this.positionedTeamHuman,
              ...this.positionedTeamComp,
            ];
            if (this.positionedTeamHuman.length === 0) {
              GamePlay.showMessage('You lost. Better luck next time');
            }
          }
          this.gamePlay.redrawPositions(this.positioned);
        });
      }
      this.playersTurn = true;
    } else {
      this.playersTurn = true;
    }
  }

  levelUp() {
    if (this.level <= 4) {
      this.points += this.positionedTeamHuman
        .map((element) => element.character.health)
        .reduce((sum, number) => sum + number);

      if (this.highestPoints < this.points) {
        this.highestPoints = this.points;
      }

      this.gamePlay.setCurrentScore(this.points);
      this.gamePlay.setBestScore(this.highestPoints);

      if (this.level < 4) {
        this.level += 1;
        this.gamePlay.drawUi(Object.values(themes)[this.level - 1]);

        this.gamePlay.setCurrentLevel(this.level);
        this.gamePlay.setCurrentScore(this.points);
        this.gamePlay.setBestScore(this.highestPoints);
        this.positioned.forEach((character) => character.character.levelUp());

        this.teamHuman = this.positionedTeamHuman.map(
          (element) => element.character,
        );
        this.teamHuman.push(
          characterGenerator(new Team().teamHuman, this.level - 1).next().value,
        );

        this.positionedTeamHuman = generatePosition(this.teamHuman, 'human');

        this.teamComp = generateTeam(
          new Team().teamComp,
          this.level,
          this.positionedTeamHuman.length,
        );

        this.positionedTeamComp = generatePosition(this.teamComp, 'comp');

        this.positioned = [
          ...this.positionedTeamHuman,
          ...this.positionedTeamComp,
        ];
        this.gamePlay.redrawPositions(this.positioned);
      } else {
        alert('it was level 4');
      }
    }
  }

  onNewGameClick() {
    this.gameState = new GameState();
    this.level = 1;

    this.init();
  }

  // onSaveGameClick() {
  //   // this.stateService.save(this.state);

  //   GamePlay.showMessage('Saved');
  // }

  // onLoadGame() {
  //   // this.stateService.load(this.state);

  //   GamePlay.showMessage('Loaded');
  // }
}
