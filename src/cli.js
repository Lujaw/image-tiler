const minimist = require("minimist");
const { version } = require('./version');
const { help } = require('./help');
const { tile } = require('./tile');

const cli = (argsArray) => {
  const args = minimist(argsArray.slice(2));
  let cmd = args._[0] || 'help';

  if (args.version || args.v) {
    cmd = 'version';
  }

  if (args.help || args.h) {
    cmd = 'help';
  }

  switch (cmd) {
    case 'version':
      version(args);
      break;

    case 'help':
      help(args);
      break;

    case 'tile':
      tile(args);
      break;

    default:
      console.error(`"${cmd}" is not a valid command!`);
      break;
  }
}

module.exports = {
  cli
}