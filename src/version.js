const packageJson = require("../package.json");
module.exports.version = () => {
  console.log(packageJson.version);
};
