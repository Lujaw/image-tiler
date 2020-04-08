const chalk = require('chalk');

const menus = {
    main: `
    ${chalk.greenBright('tile [command] <options>')}
    ${chalk.blueBright('tile')} ................ tiles the given image 
    ${chalk.blueBright('version')} ........... show the version of the tiler
    ${chalk.blueBright('help')} ............... show help menu for a command
    `
}

module.exports.help = (args) => {
    const subCmd = args._[0] === 'help'
        ? args._[1]
        : args._[0]
    console.log(menus[subCmd] || menus.main)
}