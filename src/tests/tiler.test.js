const fs = require("fs");
const path = require("path");
const rimraf = require("rimraf");
const cmd = require("../util/cmd");
const packageJson = require("../../package.json");

describe("The image tiler", () => {
  const cliPath = path.join(__dirname, "../index.js");
  const cliProcess = cmd.create(cliPath, ".");

  it("should display the version when version is invoked", async () => {
    const response = await cliProcess.execute("version");
    expect(response.trim()).toEqual(packageJson.version);
  });

  it("should display help when help is invoked", async () => {
    const response = await cliProcess.execute("help");
    expect(response.trim()).toEqual(`tile [command] <options>
    tile ................ tiles the given image
    version ........... show the version of the tiler
    help ............... show help menu for a command`);
  });

  it("should show error message when the image format is not valid", async () => {
    const response = await cliProcess.execute(["tile", "test.doc"]);
    expect(response.trim()).toEqual("Please enter valid image");
  });

  it("should create the image pryamid when the file is valid", async () => {
    const filePath = "src/tests/assets";
    const fileName = "kitten.jpg";
    const inputPath = path.join(filePath, fileName);
    const response = await cliProcess.execute(["tile", inputPath]);

    const expectedFiles = ["0_0.jpg", "0_1.jpg", "1_0.jpg", "1_1.jpg"];
    const areTiledFilesPresent = fs
      .readdirSync(path.join(filePath, path.basename(fileName, ".jpg"), "1"), {
        withFileTypes: true,
      })
      .filter((item) => !item.isDirectory())
      .every((file) => expectedFiles.includes(file.name));

    expect(response.trim()).toMatch("Tiles have been generated");

    // there should be one file in zoom level 0
    expect(fs.existsSync(path.join(filePath, "0", "0_0.jpg")));

    // there should be four files in zoom level 1
    expect(areTiledFilesPresent).toBe(true);

    // deleting the output folder afterwards
    rimraf.sync("src/tests/assets/0");
  });
});
