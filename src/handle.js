const EventEmitter = require('events');
const { ErrCircularDependency, ErrNoStart, ErrInvalidJobObject } = require('utils');

module.exports = function schedule(jobs) {
  const jobList = Object.entries(jobs);
  validateHasStart(jobList);
  validateNoCircles(jobs);

  const eventEmitter = new EventEmitter();
  return Promise.all(jobList.map(job => execute(job, eventEmitter)));
}

function validateNoCircles(jobs) {
  const jobList = Object.entries(jobs)
  const c = jobList.map(j => find(j, jobs))
  const b = traverseFind(c)
  console.log(JSON.stringify(b))
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

function traverseFind(nestedArray = []) {
  return nestedArray.find(v => {
    return Array.isArray(v)
    ? traverseFind(v)
    : v !== null;
  });
}

function validateNoCircles2(jobs) {
  const { roots, qs } = jobs.reduce(({ roots, qs }, [jobName, jobObject]) => {
    if (typeof jobObject === 'function') {
      roots.set(jobName, null)
    } else {
      jobObject.after.forEach(dep => qs.set(dep, jobName))
    }

    return { roots, qs }
  }, { roots: new Map(), qs: new Map() });

  console.log(roots)
  console.log(qs)
  console.log('---------------')
  let change = true
  while (change && qs.size > 0) {
    change = false
    traverse(roots, change)
  }
  console.log(roots)
  console.log(qs)

  function traverse(map, change) {
    for (let [key, value] of map.entries()) {
        console.log('t')
      if (!value) {
        // leaf value so check
        const q = qs.get(key);
        console.log('q', q)
        if (q) {
          change = true;
          map.set(key, q);
          qs.delete(key);
        }
      } else {
        traverse(map.get(key), change)
      }
    }
  }
}

function validateNoCirclesX(jobs) {
  let qs = jobs
    .reduce((qs, [jobName, { after }]) => after
                                        ? qs.concat(after.map(k => [k, jobName]))
                                        : qs,
            [])
  console.log(qs)
  qs = qs.reduce((chains, [first, last]) => {
    return chains.concat(
      qs.filter(q => q[q.length - 1] === first).map(q => [...q, last])
    )
  }, [])

  const chainsWithDuplicates = qs.filter((q) => q.find((e, i, arr) => arr.find((val, ix) => e === val && i !== ix)))

  console.log(qs)
  if (chainsWithDuplicates.length > 0) {
    throw new ErrCircularDependency(`circular dependency:\n${chainsWithDuplicates.map(c => c.join(' -> ')).join('\n')}`)
  }
}

function validateHasStart(jobsList) {
  const runnable = jobsList.filter(([_, job]) => typeof job === 'function')
  if (runnable.length === 0) {
    throw new ErrNoStart('all jobs depend on other jobs, work cannot be started')
  }
}

const TASK_COMPLETE = 'taskComplete';

async function execute([key, jobInfo], eventEmitter) {
  if (typeof jobInfo !== 'object') {
    if (typeof jobInfo !== 'function') {
      throw new ErrInvalidJobObject('job must be a function or job object');
    }
    await jobInfo(key);
    eventEmitter.emit(TASK_COMPLETE, key);
    return;
  }

  const { job, after } = validateJobInfo(jobInfo, key);
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

function validateJobInfo(jobInfo, key) {
  const { after, job } = jobInfo;
  if (!job) throw new ErrInvalidJobObject(`${key}: no job defined`);
  if (!after) throw new ErrInvalidJobObject(`${key}: has no "after" list, if you just want to specify a job, write "{ ${key}: jobFn }"`);

  return jobInfo;
}
