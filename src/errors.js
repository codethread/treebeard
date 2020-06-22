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
  ErrInvalidJobObject,
  ErrNoStart,
  ErrCircularDependency,
}
