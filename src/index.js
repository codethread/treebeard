const schedule = require('./handle');

schedule({
  a: print,
  b: {
    after: ['f'],
    job: print,
  },
  c: print,
  d: {
    after: ['a', 'c'],
    job: print,
  },
  e: {
    after: ['a', 'c'],
    job: print,
  },
  f: {
    after: ['a', 'b'],
    job: print,
  },
  g: {
    after: ['f', 'b'],
    job: print,
  },
  h: {
    after: ['e'],
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
