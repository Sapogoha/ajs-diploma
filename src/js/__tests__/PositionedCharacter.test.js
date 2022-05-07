import PositionedCharacter from '../PositionedCharacter';
import Undead from '../characters/Undead';

test('test positioned character creation', () => {
  expect(() => new PositionedCharacter(new Undead(1), 10)).not.toThrow();
  expect(() => new PositionedCharacter(new Undead(1), 'test')).toThrow();
  expect(
    () => new PositionedCharacter(new PositionedCharacter(), 10),
  ).toThrow();
});
