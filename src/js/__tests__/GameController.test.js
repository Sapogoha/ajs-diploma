/**
 * @jest-environment jsdom
 */

import GameController from '../GameController';
import GamePlay from '../GamePlay';
// import GameState from '../GameState';
// import GameStateService from '../GameStateService';
import PositionedCharacter from '../PositionedCharacter';
import Bowman from '../characters/Bowman';
import Undead from '../characters/Undead';
import Swordsman from '../characters/Swordsman';

import cursors from '../constants/cursors';
import colour from '../constants/colour';

let gamePlay = null;
let gameController = null;

beforeEach(() => {
  gamePlay = new GamePlay();
  const container = document.createElement('div');
  container.setAttribute('id', 'game-container');

  gamePlay.bindToDOM(container);
  gameController = new GameController(gamePlay, {});
  gameController.init();

  gameController.gameState.positioned.splice(0, 4);
  gameController.gameState.positioned.push(
    new PositionedCharacter(new Bowman(1), 10),
  );
  gameController.gameState.positioned.push(
    new PositionedCharacter(new Swordsman(1), 24),
  );
  gameController.gameState.positioned.push(
    new PositionedCharacter(new Undead(1), 12),
  );
  gameController.gameState.positioned.push(
    new PositionedCharacter(new Undead(10), 15),
  );
});

test('onCellEnter method - tooltip appears only if there is a character in the cell', () => {
  gameController.gamePlay.showCellTooltip = jest.fn();
  gameController.onCellEnter(10);

  expect(gameController.gamePlay.showCellTooltip).toBeCalled();
  expect(gameController.gamePlay.showCellTooltip).toBeCalledTimes(1);
});

test('onCellEnter method - tooltip appears only if there is a character in the cell', () => {
  gameController.onCellEnter(10);

  expect(gamePlay.cells[10].title).toBe('🎖1 ⚔25 🛡25 ❤50');

  gameController.onCellEnter(15);
  expect(gamePlay.cells[15].title).toBe('🎖10 ⚔40 🛡10 ❤50');

  gameController.onCellEnter(9);
  expect(gamePlay.cells[9].title).toBe('');
});

test('onCellEnter method - tooltip does not appear over an empty cell', () => {
  gameController.gamePlay.showCellTooltip = jest.fn();

  gameController.onCellEnter(0);
  expect(gameController.gamePlay.showCellTooltip).not.toBeCalled();
  expect(gameController.gamePlay.showCellTooltip).toBeCalledTimes(0);
});

test('onCellLeave method - tooltip disappears after the cell was left', () => {
  gameController.onCellEnter(10);
  expect(gamePlay.cells[10].title).toBe('🎖1 ⚔25 🛡25 ❤50');
  gameController.onCellLeave(10);
  expect(gamePlay.cells[10].title).toBe('');
});

test('onCellClick method - select players character', () => {
  gameController.onCellClick(10);
  expect(gamePlay.cells[10].classList).toContain('selected');
  expect(gamePlay.cells[10].classList).toContain(`selected-${colour.yellow}`);
});

test('onCellClick method - select an empty cell', () => {
  jest.spyOn(GamePlay, 'showError');
  gameController.onCellClick(55);
  expect(GamePlay.showError).toHaveBeenCalled();
});

test('onCellClick method - player chooses a character from computers team', () => {
  jest.spyOn(GamePlay, 'showError');
  gameController.onCellClick(12);
  expect(GamePlay.showError).toHaveBeenCalled();
});

test('onCellClick method - player chooses a character and then tries to attack but enemies character is too far', () => {
  jest.spyOn(GamePlay, 'showError');
  gameController.onCellClick(10);
  gameController.onCellClick(15);
  expect(GamePlay.showError).toHaveBeenCalled();
});

test('onCellClick method and onCellEnter method - there is a selected character and player chooses another character from their team', () => {
  gameController.gamePlay.setCursor = jest.fn();
  gameController.onCellClick(10);
  gameController.onCellEnter(24);

  gameController.onCellEnter(24);
  expect(gameController.gamePlay.setCursor).toHaveBeenCalledWith(
    cursors.pointer,
  );
});

test('onCellClick method and onCellEnter method - there is a selected character and player chooses possible move', () => {
  gameController.gamePlay.setCursor = jest.fn();
  gameController.onCellClick(10);
  gameController.onCellEnter(11);

  expect(gamePlay.cells[11].classList).toContain('selected');
  expect(gamePlay.cells[11].classList).toContain(`selected-${colour.green}`);
  expect(gameController.gamePlay.setCursor).toHaveBeenCalledWith(
    cursors.pointer,
  );
});

test('onCellClick method and onCellEnter method  - there is a selected character and player chooses impossible move', () => {
  gameController.gamePlay.setCursor = jest.fn();
  jest.spyOn(GamePlay, 'showError');
  gameController.onCellClick(10);
  gameController.onCellEnter(63);

  expect(gameController.gamePlay.setCursor).toHaveBeenCalledWith(
    cursors.notallowed,
  );

  gameController.onCellClick(63);
  expect(GamePlay.showError).toHaveBeenCalled();
});

test('onCellClick method and onCellEnter method  - there is a selected character and player wants to attack', () => {
  gameController.gamePlay.setCursor = jest.fn();
  gameController.onCellClick(10);

  gameController.onCellEnter(12);
  expect(gamePlay.cells[12].classList).toContain('selected');
  expect(gamePlay.cells[12].classList).toContain(`selected-${colour.red}`);
  expect(gameController.gamePlay.setCursor).toHaveBeenCalledWith(
    cursors.crosshair,
  );
});
