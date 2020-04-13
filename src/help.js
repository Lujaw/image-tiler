const chalk = require("chalk");

const menus = {
  main: `
  ${chalk.greenBright("Tiler: creates the image pyramid")}
  --------------------------------------------------------------
  ${chalk.greenBright("Usage: tiler [command] <options>")}
  
  ${chalk.blueBright("tiler version")} .................... show the version
  ${chalk.blueBright("tiler help")} ....................... show help menu
  ${chalk.blueBright("tiler [imagePath]")} ................ tiles given image

  ${chalk.greenBright("Available options:")}
  ${chalk.blueBright("-p")}................................ creates the image pyramid
  ${chalk.blueBright("-o [path]")} ........................ saves the images in given path
  `,
};

module.exports.help = (args) => {
  const subCmd = args._[0] === "help" ? args._[1] : args._[0];
  console.log(menus[subCmd] || menus.main);
};
