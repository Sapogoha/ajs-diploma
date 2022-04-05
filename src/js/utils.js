export function calcTileType(index, boardSize) {
  const square = boardSize * boardSize;
  if (index === 0) {
    return 'top-left';
  }
  if (index === boardSize - 1) {
    return 'top-right';
  }
  if (index === square - boardSize) {
    return 'bottom-left';
  }
  if (index === square - 1) {
    return 'bottom-right';
  }
  if (index > 0 && index < boardSize - 1) {
    return 'top';
  }
  if (index < square - 1 && index > square - boardSize) {
    return 'bottom';
  }
  if (index % boardSize === 0) {
    return 'left';
  }
  if (index % boardSize === boardSize - 1) {
    return 'right';
  }

  return 'center';
}

export function calcHealthLevel(health) {
  if (health < 15) {
    return 'critical';
  }

  if (health < 50) {
    return 'normal';
  }

  return 'high';
}

export function possibleMove(
  currentIndex,
  futureIndex,
  moveDistance,
  boardSize = 8,
) {
  const possibleIndexes = [];
  function countRow(variable) {
    return Math.ceil((variable + 1) / boardSize);
  }

  for (let i = 1; i <= moveDistance; i++) {
    const up = currentIndex - boardSize * i;
    const down = currentIndex + boardSize * i;
    const left = currentIndex - 1 * i;
    const right = currentIndex + 1 * i;
    const upRightDiag = currentIndex - (boardSize - 1) * i;
    const upLeftDiag = currentIndex - (boardSize + 1) * i;
    const downRightDiag = currentIndex + (boardSize + 1) * i;
    const downLeftDiag = currentIndex + (boardSize - 1) * i;

    const currentIndexRow = countRow(currentIndex);

    if (up >= 0) {
      possibleIndexes.push(up);
    }
    if (down <= boardSize ** 2 - 1) {
      possibleIndexes.push(down);
    }
    if (currentIndexRow === countRow(left)) {
      possibleIndexes.push(left);
    }
    if (currentIndexRow === countRow(right)) {
      possibleIndexes.push(right);
    }
    if (upRightDiag > 0 && currentIndexRow - i === countRow(upRightDiag)) {
      possibleIndexes.push(upRightDiag);
    }
    if (upLeftDiag >= 0 && currentIndexRow - i === countRow(upLeftDiag)) {
      possibleIndexes.push(upLeftDiag);
    }
    if (
      downRightDiag <= boardSize ** 2 - 1
      && currentIndexRow + i === countRow(downRightDiag)
    ) {
      possibleIndexes.push(downRightDiag);
    }
    if (
      downLeftDiag < boardSize ** 2 - 1
      && currentIndexRow + i === countRow(downLeftDiag)
    ) {
      possibleIndexes.push(downLeftDiag);
    }
  }

  return possibleIndexes.includes(futureIndex);
}
