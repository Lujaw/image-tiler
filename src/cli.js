const minimist = require("minimist");
const commandOptions = require("minimist-options");
const { omit } = require("lodash");
const { version } = require("./version");
const { help } = require("./help");
const { tile } = require("./tile");

const cli = async () => {
  const options = commandOptions({
    output: {
      type: "string",
      alias: "o",
    },

    pyramid: {
      type: "boolean",
      alias: "p",
      default: false,
    },
  });

  const args = minimist(process.argv.slice(2), options);

  let cmd = args._[0] || "help";

  if (args.version || args.v) {
    cmd = "version";
  }

  if (args.help || args.h) {
    cmd = "help";
  }

  switch (cmd) {
    case "version":
      version(args);
      break;

    case "help":
      help(args);
      break;

    default:
      try {
        const outputPath = await tile({
          file: args._[0],
          options: omit(args, "_"),
        });
        console.log(`Tiles have been generated in folder: \n${outputPath}`);
      } catch (error) {
        console.log(error.message);
      }
      break;
  }
};

module.exports = {
  cli,
};
