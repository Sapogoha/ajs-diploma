import PositionedCharacter from '../PositionedCharacter';
import Undead from '../characters/Undead';

import errors from '../constants/errors';

test('test positioned character creation - all goes well with correct data', () => {
  expect(() => new PositionedCharacter(new Undead(1), 10)).not.toThrow();
});

test('test positioned character creation - throws an errow if the first argument is not instance of Character', () => {
  expect(
    () => new PositionedCharacter(new PositionedCharacter(), 10),
  ).toThrowError(errors.notInstance);
});

test('test positioned character creation - throws an errow if the second argument is not a number', () => {
  expect(() => new PositionedCharacter(new Undead(1), 'test')).toThrow(
    errors.notNumber,
  );
});
