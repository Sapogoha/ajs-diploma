import themes from './themes';
import cursors from './cursors';
import { possibleMove, countPossibleIndexes, setTimer } from './utils';

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
    this.gameState = new GameState();
    this.selectedCharacter = false;
    this.indexOfSelectedCharacter = null;
    this.previouslySelected = null;
  }

  init() {
    this.gamePlay.drawUi(Object.values(themes)[this.gameState.level - 1]);
    this.drawCharacters();
    this.addListeners();
    this.showStats();
  }

  drawCharacters() {
    this.gameState.teamHuman = generateTeam(new Team().teamHumanInit, 1, 2);
    this.gameState.teamComp = generateTeam(new Team().teamComp, 1, 2);
    this.gameState.posTeamHuman = generatePosition(
      this.gameState.teamHuman,
      'human',
    );
    this.gameState.posTeamComp = generatePosition(
      this.gameState.teamComp,
      'comp',
    );

    this.gameState.positioned = [
      ...this.gameState.posTeamHuman,
      ...this.gameState.posTeamComp,
    ];

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
      this.gameState.posTeamHuman.length > 0
      && this.gameState.level <= 4
      && this.gameState.posTeamComp.length !== 0
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

            const removed = this.gameState.posTeamComp.indexOf(competition);
            if (competition.character.health <= 0) {
              this.gameState.posTeamComp.splice(removed, 1);
              this.gameState.positioned = [
                ...this.gameState.posTeamHuman,
                ...this.gameState.posTeamComp,
              ];
              if (this.gameState.posTeamComp.length === 0) {
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
          this.gameState.posTeamHuman = [...this.gameState.posTeamHuman].filter(
            (character) => character.position !== this.indexOfSelectedCharacter,
          );
          this.selectedCharacter.position = index;
          this.gameState.posTeamHuman.push(this.selectedCharacter);
          this.gameState.positioned = [
            ...this.gameState.posTeamHuman,
            ...this.gameState.posTeamComp,
          ];
          this.selectedCharacter = null;
          this.indexOfSelectedCharacter = null;
          this.gamePlay.redrawPositions(this.gameState.positioned);
          this.removeSelected();
          this.gameState.playersTurn = false;
        } else {
          GamePlay.showError('It is not allowed to move there');
        }
        this.computersMove();
      }
    }
  }

  async computersMove() {
    if (!this.gameState.playersTurn) {
      const index = Math.floor(
        Math.random() * this.gameState.posTeamComp.length,
      );
      const playingCharacter = this.gameState.posTeamComp[index];
      const playingCharacterIndex = playingCharacter.position;
      const numOfStepsToMove = playingCharacter.character.moveDistance;
      const numOfStepsToAttack = playingCharacter.character.attackDistance;
      const humansPositions = this.gameState.posTeamHuman.map(
        (element) => element.position,
      );
      const compsPositions = this.gameState.posTeamComp.map(
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
        this.gameState.posTeamComp = [...this.gameState.posTeamComp].filter(
          (character) => character.position !== playingCharacterIndex,
        );

        this.gamePlay.selectCell(playingCharacter.position);
        await setTimer(300);
        this.gamePlay.deselectCell(playingCharacter.position);

        playingCharacter.position = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];

        this.gamePlay.selectCell(playingCharacter.position, 'green');
        await setTimer(300);
        this.gamePlay.deselectCell(playingCharacter.position);

        this.gameState.posTeamComp.push(playingCharacter);
        this.gameState.positioned = [
          ...this.gameState.posTeamHuman,
          ...this.gameState.posTeamComp,
        ];

        this.gamePlay.redrawPositions(this.gameState.positioned);
      } else {
        const enemy = this.findCharacterHere(toAttack);

        const damageValue = Math.max(
          playingCharacter.character.attack - enemy.character.defence,
          playingCharacter.character.attack * 0.1,
        );

        this.gamePlay.selectCell(playingCharacter.position);
        await setTimer(300);
        this.gamePlay.selectCell(toAttack, 'red');

        const damage = this.gamePlay.showDamage(toAttack, damageValue);

        this.gamePlay.deselectCell(playingCharacter.position);

        damage.then(() => {
          enemy.character.health -= damageValue;
          const removed = this.gameState.posTeamHuman.indexOf(enemy);
          if (enemy.character.health <= 0) {
            this.gameState.posTeamHuman.splice(removed, 1);
            this.gameState.positioned = [
              ...this.gameState.posTeamHuman,
              ...this.gameState.posTeamComp,
            ];
            if (this.gameState.posTeamHuman.length === 0) {
              GamePlay.showMessage('You lost. Better luck next time');
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
      this.gameState.points += this.gameState.posTeamHuman
        .map((element) => element.character.health)
        .reduce((sum, number) => sum + number);

      if (this.gameState.highestPoints < this.gameState.points) {
        this.gameState.highestPoints = this.gameState.points;
      }

      this.showStats();

      if (this.gameState.level < 4) {
        this.gameState.level += 1;
        this.gamePlay.drawUi(Object.values(themes)[this.gameState.level - 1]);

        this.showStats();

        this.gameState.positioned.forEach((character) => character.character.levelUp());

        this.gameState.teamHuman = this.gameState.posTeamHuman.map(
          (element) => element.character,
        );
        this.gameState.teamHuman.push(
          characterGenerator(
            new Team().teamHuman,
            this.gameState.level - 1,
          ).next().value,
        );

        this.gameState.posTeamHuman = generatePosition(
          this.gameState.teamHuman,
          'human',
        );

        this.gameState.teamComp = generateTeam(
          new Team().teamComp,
          this.gameState.level,
          this.gameState.posTeamHuman.length,
        );

        this.gameState.posTeamComp = generatePosition(
          this.gameState.teamComp,
          'comp',
        );

        this.gameState.positioned = [
          ...this.gameState.posTeamHuman,
          ...this.gameState.posTeamComp,
        ];
        this.gamePlay.redrawPositions(this.gameState.positioned);
      } else {
        alert('This was the last level');
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

    GamePlay.showMessage('Saved');
  }

  onLoadGame() {
    let loadState = null;
    try {
      loadState = this.stateService.load();

      GamePlay.showMessage('Loaded');
    } catch (err) {
      GamePlay.showError('Something went wrong');
      return;
    }

    this.deselect();

    this.gameState.level = loadState.level;
    this.gameState.points = loadState.points;
    this.gameState.highestPoints = loadState.highestPoints;
    this.gameState.playersTurn = loadState.playersTurn;
    this.init();
    this.gameState.teamHuman = loadState.teamHuman;
    this.gameState.teamComp = loadState.teamComp;
    this.gameState.posTeamHuman = loadState.posTeamHuman;
    this.gameState.posTeamComp = loadState.posTeamComp;
    this.gameState.positioned = loadState.positioned;

    // console.log('posTeamHuman');
    // console.log(this.gameState.posTeamHuman);
    // console.log('pos');
    // console.log(this.gameState.positioned);

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
    this.gamePlay.cells.forEach((cell) => cell.classList.remove('selected-yellow', 'selected-green', 'selected-red'));
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
