const { node, isNode } = require('utils/node');

module.exports = function parse(queue = []) {
  validateArrayWithNestedArrays(queue);
  return transform(queue);
}

function transform(arr) {
  return arr.map(item => {
      const x = node(arr)
      return (x)
    if (!isArr(arr)) {
      console.log(x)
    }
  })
}

const Wrong = new Error('argument must be an array of arrays');

function validateArrayWithNestedArrays(input) {
  if (!isArr(input)) throw Wrong;
  input.forEach(inp => {
    if (['boolean', 'number', 'string'].includes(typeof inp)) return;
    else if (isArr(inp)) validateArrayWithNestedArrays(input);
    else throw Wrong;
  });
}

function isArr(maybeA) {
  return Array.isArray(maybeA);
}
