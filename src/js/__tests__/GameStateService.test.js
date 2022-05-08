/**
 * @jest-environment jsdom
 */

import GameController from '../GameController';
import GamePlay from '../GamePlay';
import GameStateService from '../GameStateService';
import errors from '../constants/errors';

jest.mock('../GameStateService');
jest.mock('../GamePlay');

test('load method - error ', () => {
  const gamePlay = new GamePlay();
  const container = document.createElement('div');
  container.setAttribute('id', 'game-container');

  gamePlay.bindToDOM(container);
  const stateService = new GameStateService(localStorage);
  const gameController = new GameController(gamePlay, stateService);
  gameController.init();

  stateService.load.mockImplementation(() => {
    throw new Error(errors.invalid);
  });

  gameController.onLoadGame();

  expect(stateService.load).toHaveBeenCalledTimes(1);
  expect(GamePlay.showError).toHaveBeenCalledWith(errors.wrong);
});
