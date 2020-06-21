const { upperCaseFirstLetter, uid } = require('utils');

const store = new Map();

function node(value) {
  return make({
    id: uid(),
    type: 'node',
    value,
  });
}

const nodes = {
  node,
}

function make(n) {
  n.id = uid();
  store.set(n.id, n);
  return n;
}

function generateValidators(nodes) {
  return Object.keys(nodes).reduce((validators, name) => ({
    ...validators,
    [`is${upperCaseFirstLetter(name)}`]: (maybeNode) =>
      maybeNode.type && maybeNode.type === name,
  }), {});
}

module.exports = {
  ...nodes,
  ...generateValidators(nodes),
}
