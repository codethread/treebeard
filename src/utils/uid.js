module.exports = function uid() {
  return makeid(10);
}

function makeid(length) {
   // change this to whatever
   const upperC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
   const lowerC = 'abcdefghijklmnopqrstuvwxyz';
   const numbers = '0123456789';
   const characters = upperC + lowerC + numbers

   return new Array(length)
     .fill()
     .map(randomFrom(characters))
     .join('');
}

function randomFrom(characters) {
  return () => characters.charAt(
    Math.floor(Math.random() * characters.length)
  );
}
