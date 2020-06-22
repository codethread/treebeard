const EventEmitter = require('events');
const { ErrCircularDependency, ErrNoStart, ErrInvalidJobObject } = require('utils');

const TASK_COMPLETE = 'taskComplete';

module.exports = function schedule(jobs) {
  const jobList = Object.entries(jobs);
  try {
    jobList.forEach(validateJobObject)
    validateHasStart(jobList);
    validateNoCircles(jobs);
  } catch (e) {
    return Promise.reject(e);
  }

  const eventEmitter = new EventEmitter();
  return Promise.all(jobList.map(job => execute(job, eventEmitter)));
}

function execute([key, jobInfo], eventEmitter) {
  if (typeof jobInfo !== 'object') {
    // wrap in promise in the event job is sync
    return Promise.resolve(jobInfo(key))
      .then(() => {
        eventEmitter.emit(TASK_COMPLETE, key);
        return key
      });
  }

  const { job, after } = jobInfo;
  const finished = new Set();
  let done = false;

  return new Promise((resolve, reject) => {
    eventEmitter.on(TASK_COMPLETE, (finishedKey) => {
      finished.add(finishedKey);
      if(dependenciesFinished()) {
        if (done) return;
        done = true;
        Promise.resolve(job(key))
               .then(() => {
                 eventEmitter.emit(TASK_COMPLETE, key);
                 resolve(key);
               })
               .catch(reject)
      }
    })
  })

  function dependenciesFinished(){
    const allFinished = after.filter(dependency => finished.has(dependency))
    return allFinished.length === after.length;
  }
}

function validateNoCircles(jobs) {
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

function traverseFind(arr = []) {
  const res = traverse(arr);

  return hasNestedArr(res) ? traverseFind(res) : res;

  function hasNestedArr(maybeNested = []) {
    if (!Array.isArray(maybeNested)) return false;
    return Boolean(maybeNested.find(v => Array.isArray(v)));
  }

  function traverse(nestedArray = []) {
    return nestedArray.find(v => {
      return Array.isArray(v)
           ? traverseFind(v)
           : v !== null;
    });
  }
}

function validateHasStart(jobsList) {
  const runnable = jobsList.filter(([_, job]) => typeof job === 'function')
  if (runnable.length === 0) {
    throw new ErrNoStart('all jobs depend on other jobs, work cannot be started')
  }
}


function validateJobObject([key, jobObject]) {
  if (typeof jobObject === 'function') return;

  const { after, job } = jobObject;
  if (!job) throw new ErrInvalidJobObject(`${key}: no job defined`);
  if (!after) throw new ErrInvalidJobObject(`${key}: has no "after" list, if you just want to specify a job, write "{ ${key}: jobFn }"`);
}
