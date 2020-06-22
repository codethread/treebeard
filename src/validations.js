const { ErrNoStart, ErrInvalidJobObject } = require('./errors');
const validateNoCircles = require('./validations/noCircles');

module.exports = {
  validateHasStart,
  validateJobObject,
  validateNoCircles,
};

function validateHasStart(jobsList) {
  const runnable = jobsList.filter(([_, job]) => typeof job === 'function');
  if (runnable.length === 0) {
    throw new ErrNoStart(
      'all jobs depend on other jobs, work cannot be started',
    );
  }
}

function validateJobObject([key, jobObject]) {
  if (typeof jobObject === 'function') return;

  const { after, job } = jobObject;
  if (!job) throw new ErrInvalidJobObject(`${key}: no job defined`);
  if (!after)
    throw new ErrInvalidJobObject(
      `${key}: has no "after" list, if you just want to specify a job, write "{ ${key}: jobFn }"`,
    );
}
