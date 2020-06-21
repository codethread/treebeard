const schedule = require('./handle');

schedule({
  x: print,
  a: {
    after: ['c','x'],
    job: print,
  },
  b: {
    after: ['a'],
    job: print,
  },
  c: {
    after: ['b'],
    job: print,
  },
}).then(console.log)

function print(info) {
  console.log(info, 'starting');
  return new Promise(resolve => {
    setTimeout(() => {
      console.log(info, 'finished');
      resolve();
    }, 5000)
  })
}
