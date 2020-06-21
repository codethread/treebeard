class ErrCircularDependency extends Error {
  constructor(message) {
    super(message);
  }
}

class ErrNoStart extends Error {
  constructor(message) {
    super(message);
  }
}

class ErrInvalidJobObject extends Error {
  constructor(message) {
    super(message);
  }
}
module.exports = {
  upperCaseFirstLetter,
  uid: require('./uid'),
  ErrInvalidJobObject,
  ErrNoStart,
  ErrCircularDependency,

}

function upperCaseFirstLetter(str = '') {
  const [first, ...rest] = str.split('');
  return [first.toUpperCase(), ...rest].join('');
}
