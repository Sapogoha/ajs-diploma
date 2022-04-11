import PositionedCharacter from './PositionedCharacter';

/**
 * Generates random characters
 *
 * @param allowedTypes iterable of classes
 * @param maxLevel max character level
 * @returns Character type children (ex. Magician, Bowman, etc)
 */

export function* characterGenerator(allowedTypes, maxLevel) {
  const type = Math.floor(Math.random() * allowedTypes.length);
  const level = Math.floor(1 + Math.random() * maxLevel);
  yield new allowedTypes[type](level);
}

export function generateTeam(allowedTypes, maxLevel, characterCount) {
  const team = [];

  for (let i = 0; i < characterCount; i++) {
    team.push(characterGenerator(allowedTypes, maxLevel).next().value);
  }

  return team;
}

export function generatePosition(team, side, boardSize = 8) {
  const allCells = [...Array(boardSize ** 2).keys()];
  let possibleCells = null;

  if (side === 'human') {
    possibleCells = allCells.filter(
      (cell) => cell % boardSize === 0 || cell % boardSize === 1,
    );
  } else if (side === 'comp') {
    possibleCells = allCells.filter(
      (cell) => cell % boardSize === 6 || cell % boardSize === 7,
    );
  }

  const positionedCharacters = [];

  for (let i = 0; i < team.length; i++) {
    const index = Math.floor(Math.random() * possibleCells.length);
    const position = possibleCells[index];

    possibleCells.splice(index, 1);

    positionedCharacters.push(new PositionedCharacter(team[i], position));
  }

  return positionedCharacters;
}
