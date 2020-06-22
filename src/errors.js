class ErrCircularDependency extends Error {}

class ErrNoStart extends Error {}

class ErrInvalidJobObject extends Error {}

module.exports = {
  ErrInvalidJobObject,
  ErrNoStart,
  ErrCircularDependency,
};
