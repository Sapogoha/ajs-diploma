import themes from './constants/themes';
import teams from './constants/teams';
import cursors from './constants/cursors';
import colour from './constants/colour';
import errors from './constants/errors';
import messages from './constants/messages';
import { possibleMove, countPossibleIndexes, setTimer } from './utils';

import {
  generateTeam,
  generatePosition,
  characterGenerator,
} from './generators';

import Team from './Team';
import GamePlay from './GamePlay';
import GameState from './GameState';

import Bowman from './characters/Bowman';
import Daemon from './characters/Daemon';
import Magician from './characters/Magician';
import Swordsman from './characters/Swordsman';
import Undead from './characters/Undead';
import Vampire from './characters/Vampire';
import PositionedCharacter from './PositionedCharacter';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.gameState = new GameState();
    this.selectedCharacter = false;
    this.indexOfSelectedCharacter = null;
    this.previouslySelected = null;
  }

  init() {
    this.prepareBoard();
    this.drawCharacters();
  }

  prepareBoard() {
    this.gamePlay.drawUi(Object.values(themes)[this.gameState.level - 1]);
    this.removeListeners();
    this.addListeners();
    this.showStats();
  }

  drawCharacters() {
    this.teamHuman = generateTeam(new Team().teamHumanInit, 1, 2);
    this.teamComp = generateTeam(new Team().teamComp, 1, 2);
    this.posTeamHuman = generatePosition(this.teamHuman, teams.player);
    this.posTeamComp = generatePosition(this.teamComp, teams.enemy);

    this.gameState.positioned = [...this.posTeamHuman, ...this.posTeamComp];

    this.gamePlay.redrawPositions(this.gameState.positioned);
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
            this.gamePlay.selectCell(index, colour.green);
            this.gamePlay.setCursor(cursors.pointer);
          }
          if (!allowedMove) {
            this.gamePlay.setCursor(cursors.notallowed);
          }
          if (characterHere?.character.team === teams.enemy && allowedAttack) {
            this.gamePlay.selectCell(index, colour.red);
            this.gamePlay.setCursor(cursors.crosshair);
          } else if (characterHere?.character.team === teams.player) {
            this.gamePlay.selectCell(index, '');
          }
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
    if (this.gameState.playersTurn) {
      if (
        this.posTeamHuman.length > 0
        && this.gameState.level <= 4
        && this.posTeamComp.length !== 0
      ) {
        const characterHere = this.findCharacterHere(index);
        if (characterHere) {
          const { team } = characterHere.character;
          if (team === teams.enemy && !this.selectedCharacter) {
            GamePlay.showError(errors.notYours);
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
          GamePlay.showError(errors.noCharacter);
        }

        if (this.previouslySelected && characterHere) {
          const numOfSteps = this.previouslySelected.character.attackDistance;

          const allowedAttack = possibleMove(
            this.previouslySelected.position,
            index,
            numOfSteps,
          );
          const { team } = characterHere.character;
          if (team === teams.player) {
            this.gamePlay.deselectCell(this.indexOfSelectedCharacter);
            this.gamePlay.selectCell(index);
          } else if (allowedAttack) {
            const competition = characterHere;

            const damageValue = Math.max(
              this.previouslySelected.character.attack
                - competition.character.defence,
              this.previouslySelected.character.attack * 0.1,
            );
            const damage = this.gamePlay.showDamage(index, damageValue);

            damage.then(() => {
              competition.character.health -= damageValue;

              const removed = this.posTeamComp.indexOf(competition);
              if (competition.character.health <= 0) {
                this.posTeamComp.splice(removed, 1);
                this.gameState.positioned = [
                  ...this.posTeamHuman,
                  ...this.posTeamComp,
                ];
                if (this.posTeamComp.length === 0) {
                  this.gameState.playersTurn = true;
                  this.levelUp();
                }
              }

              this.removeSelected();
              this.gamePlay.redrawPositions(this.gameState.positioned);
              this.computersMove();
            });

            this.selectedCharacter = null;
            this.indexOfSelectedCharacter = null;
            this.gameState.playersTurn = false;
          } else {
            GamePlay.showError(errors.tooFar);
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
            this.posTeamHuman = [...this.posTeamHuman].filter(
              (character) => character.position !== this.indexOfSelectedCharacter,
            );
            this.selectedCharacter.position = index;
            this.posTeamHuman.push(this.selectedCharacter);
            this.gameState.positioned = [
              ...this.posTeamHuman,
              ...this.posTeamComp,
            ];
            this.selectedCharacter = null;
            this.indexOfSelectedCharacter = null;
            this.gamePlay.redrawPositions(this.gameState.positioned);
            this.removeSelected();
            this.gameState.playersTurn = false;
          } else {
            GamePlay.showError(errors.notAllowed);
          }
          this.computersMove();
        }
      }
    } else {
      GamePlay.showError(errors.notYourTurn);
    }
  }

  async computersMove() {
    if (!this.gameState.playersTurn) {
      await setTimer(300);
      const index = Math.floor(Math.random() * this.posTeamComp.length);
      const playingCharacter = this.posTeamComp[index];
      const playingCharacterIndex = playingCharacter.position;
      const numOfStepsToMove = playingCharacter.character.moveDistance;
      const numOfStepsToAttack = playingCharacter.character.attackDistance;
      const humansPositions = this.posTeamHuman.map(
        (element) => element.position,
      );
      const compsPositions = this.posTeamComp.map(
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
        this.posTeamComp = [...this.posTeamComp].filter(
          (character) => character.position !== playingCharacterIndex,
        );

        this.gamePlay.selectCell(playingCharacter.position);
        await setTimer(300);
        this.gamePlay.deselectCell(playingCharacter.position);

        playingCharacter.position = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];

        this.gamePlay.selectCell(playingCharacter.position, colour.green);
        await setTimer(300);
        this.gamePlay.deselectCell(playingCharacter.position);

        this.posTeamComp.push(playingCharacter);
        this.gameState.positioned = [...this.posTeamHuman, ...this.posTeamComp];

        this.gamePlay.redrawPositions(this.gameState.positioned);
      } else {
        const enemy = this.findCharacterHere(toAttack);

        const damageValue = Math.max(
          playingCharacter.character.attack - enemy.character.defence,
          playingCharacter.character.attack * 0.1,
        );

        this.gamePlay.selectCell(playingCharacter.position);
        await setTimer(300);
        this.gamePlay.selectCell(toAttack, colour.red);

        const damage = this.gamePlay.showDamage(toAttack, damageValue);

        this.gamePlay.deselectCell(playingCharacter.position);

        damage.then(() => {
          enemy.character.health -= damageValue;
          const removed = this.posTeamHuman.indexOf(enemy);
          if (enemy.character.health <= 0) {
            this.posTeamHuman.splice(removed, 1);
            this.gameState.positioned = [
              ...this.posTeamHuman,
              ...this.posTeamComp,
            ];
            if (this.posTeamHuman.length === 0) {
              GamePlay.showMessage(errors.lost);
            }
          }

          this.gamePlay.redrawPositions(this.gameState.positioned);

          this.gamePlay.deselectCell(toAttack);
        });
      }
      this.gameState.playersTurn = true;
    } else {
      this.gameState.playersTurn = true;
    }
  }

  levelUp() {
    if (this.gameState.level <= 4) {
      this.gameState.points += this.posTeamHuman
        .map((element) => element.character.health)
        .reduce((sum, number) => sum + number);

      if (this.gameState.highestPoints < this.gameState.points) {
        this.gameState.highestPoints = this.gameState.points;
      }

      this.showStats();

      if (this.gameState.level < 4) {
        this.gameState.level += 1;
        this.prepareBoard();
        this.gameState.positioned.forEach((character) => character.character.levelUp());

        this.teamHuman = this.posTeamHuman.map((element) => element.character);
        this.teamHuman.push(
          characterGenerator(
            new Team().teamHuman,
            this.gameState.level - 1,
          ).next().value,
        );

        this.posTeamHuman = generatePosition(this.teamHuman, teams.player);

        this.teamComp = generateTeam(
          new Team().teamComp,
          this.gameState.level,
          this.posTeamHuman.length,
        );

        this.posTeamComp = generatePosition(this.teamComp, teams.enemy);

        this.gameState.positioned = [...this.posTeamHuman, ...this.posTeamComp];

        this.gamePlay.redrawPositions(this.gameState.positioned);
      } else {
        GamePlay.showMessage(messages.congrats);
      }
    }
  }

  onNewGameClick() {
    this.deselect();
    this.gameState.playersTurn = true;
    this.gameState.level = 1;
    this.gameState.points = 0;

    this.init();
  }

  onSaveGameClick() {
    this.stateService.save(this.gameState);

    GamePlay.showMessage(messages.saved);
  }

  onLoadGame() {
    try {
      const loadState = this.stateService.load();
      // const types = {
      //   swordsman: Swordsman,
      //   bowman: Bowman,
      //   magician: Magician,
      //   daemon: Daemon,
      //   undead: Undead,
      //   vampire: Vampire,
      // };

      const types = {
        Swordsman,
        Bowman,
        Magician,
        Daemon,
        Undead,
        Vampire,
      };

      this.deselect();

      this.gameState.level = loadState.level;
      this.gameState.points = loadState.points;
      this.gameState.highestPoints = loadState.highestPoints;
      this.gameState.playersTurn = loadState.playersTurn;
      this.prepareBoard();

      this.gameState.positioned = loadState.positioned.map((item) => {
        const {
          attack,
          attackDistance,
          defence,
          health,
          level,
          moveDistance,
          team,
          type,
        } = item.character;

        // const Type = type;
        // const character = new Type(level);

        const character = new types[type](level);

        character.attack = attack;
        character.attackDistance = attackDistance;
        character.defence = defence;
        character.health = health;
        character.moveDistance = moveDistance;
        character.team = team;

        return new PositionedCharacter(character, item.position);
      });

      this.posTeamHuman = this.gameState.positioned.filter(
        (character) => character.character.team === teams.player,
      );
      this.posTeamComp = this.gameState.positioned.filter(
        (character) => character.character.team === teams.enemy,
      );

      GamePlay.showMessage(messages.loaded);
    } catch (err) {
      GamePlay.showError(errors.wrong);
      return;
    }

    this.gamePlay.redrawPositions(this.gameState.positioned);
  }

  addListeners() {
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));

    this.gamePlay.addNewGameListener(this.onNewGameClick.bind(this));
    this.gamePlay.addSaveGameListener(this.onSaveGameClick.bind(this));
    this.gamePlay.addLoadGameListener(this.onLoadGame.bind(this));
  }

  removeListeners() {
    this.gamePlay.cellClickListeners = [];
    this.gamePlay.cellEnterListeners = [];
    this.gamePlay.cellLeaveListeners = [];
    this.gamePlay.newGameListeners = [];
    this.gamePlay.saveGameListeners = [];
    this.gamePlay.loadGameListeners = [];
  }

  deselect() {
    this.removeListeners();
    this.selectedCharacter = false;
    this.indexOfSelectedCharacter = null;
    this.previouslySelected = null;
  }

  showStats() {
    this.gamePlay.setCurrentLevel(this.gameState.level);
    this.gamePlay.setCurrentScore(this.gameState.points);
    this.gamePlay.setBestScore(this.gameState.highestPoints);
  }

  removeSelected() {
    this.gamePlay.cells.forEach((cell) => cell.classList.remove(
      `selected-${colour.yellow}`,
      `selected-${colour.green}`,
      `selected-${colour.red}`,
    ));
  }

  findCharacterHere(index) {
    return this.gameState.positioned.find(
      (character) => character.position === index,
    );
  }

  findNumberOfStepsToMove() {
    return this.selectedCharacter.character.moveDistance;
  }

  findNumberOfStepsToAttack() {
    return this.selectedCharacter.character.attackDistance;
  }
}
