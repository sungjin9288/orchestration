'use strict';

function sameExactStringArrays(left, right) {
  if (left.length !== right.length) {
    return false;
  }

  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) {
      return false;
    }
  }

  return true;
}

function sameExactDigestEntries(left, right) {
  if (left.length !== right.length) {
    return false;
  }

  for (let index = 0; index < left.length; index += 1) {
    if (left[index].path !== right[index].path || left[index].digest !== right[index].digest) {
      return false;
    }
  }

  return true;
}

module.exports = {
  sameExactDigestEntries,
  sameExactStringArrays,
};
