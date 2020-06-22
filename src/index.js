const EventEmitter = require('events');

const execute = require('./execute');
const { ErrInvalidJobObject } = require('./errors');
const { validateHasStart, validateNoCircles, validateJobObject } = require('./validations')

module.exports = function schedule(jobs) {
  if (!jobs || typeof jobs !== 'object') {
    return Promise.reject(new ErrInvalidJobObject('expected an object of jobObjects'));
  }

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
