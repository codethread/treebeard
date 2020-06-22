const { ErrCircularDependency } = require('../errors');

module.exports = function validateNoCircles(jobs) {
  const jobList = Object.entries(jobs)
  const circularDependency = traverseFind(jobList.map(j => find(j, jobs)));
  if (circularDependency) {
    throw new ErrCircularDependency(`circular dependency:\n${circularDependency.join(' -> ')}`)
  }
}

function find([key, jobObject], all, seen = []) {
  if (typeof jobObject === 'function') return null
  if (seen.includes(key)) {
    seen.push(key)
    return seen;
  }
  seen.push(key)
  return jobObject.after.map(dep => find([dep, all[dep]], all, seen))
}

function traverseFind(arr) {
  const res = traverse(arr);
  return hasNestedArr(res) ? traverseFind(res) : res;
}

function hasNestedArr(maybeNested) {
  if (!Array.isArray(maybeNested)) return false;
  return Boolean(maybeNested.find(v => Array.isArray(v)));
}

function traverse(nestedArray) {
  return nestedArray.find(v => {
    return Array.isArray(v)
         ? traverseFind(v)
         : v !== null;
  });
}
