const { ErrCircularDependency, ErrNoStart, ErrInvalidJobObject } = require('./errors');

const TASK_COMPLETE = 'taskComplete';

module.exports = function execute([key, jobInfo], eventEmitter) {
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
