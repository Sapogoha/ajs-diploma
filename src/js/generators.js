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
