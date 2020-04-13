const fs = require("fs");
const path = require("path");
const rimraf = require("rimraf");

const { tile } = require("../tile");
const cmd = require("../util/cmd");
const packageJson = require("../../package.json");

describe("The image tiler", () => {
  const cliPath = path.join(__dirname, "../tiler.js");
  const cliProcess = cmd.create(cliPath, ".");

  it("should display the version when version is invoked", async () => {
    const response = await cliProcess.execute("version");
    expect(response.trim()).toEqual(packageJson.version);
  });

  it("should display help when help is invoked", async () => {
    const response = await cliProcess.execute("help");
    expect(response.trim()).toMatch(`Tiler: creates the image pyramid`);
  });

  it("should show error message when the image format is not valid", async () => {
    const response = await cliProcess.execute(["test.doc"]);
    expect(response.trim()).toMatch("Please enter valid image");
  });

  describe("when the input is valid", () => {
    const filePath = "src/tests/assets";
    const fileName = "kitten.jpg";
    const inputPath = path.join(filePath, fileName);
    it("should create the image pryamid when the pyramid flag is true", async () => {
      const response = await cliProcess.execute([inputPath, "-p true"]);
      const expectedFiles = ["0_0.jpg", "0_1.jpg", "1_0.jpg", "1_1.jpg"];
      const outputPath = path.join(filePath, path.basename(fileName, ".jpg"));
      const areTiledFilesPresent = fs
        .readdirSync(path.join(outputPath, "1"), {
          withFileTypes: true,
        })
        .every((file) => expectedFiles.includes(file.name));
      expect(response.trim()).toMatch("Tiles have been generated");

      // there should be one file in zoom level 0
      expect(fs.existsSync(path.join(filePath, "0", "0_0.jpg")));

      // there should be four files in zoom level 1
      expect(areTiledFilesPresent).toBe(true);

      // deleting the output folder afterwards
      rimraf.sync(outputPath);
    });

    it("create the tiles from the file buffer", async () => {
      const processPath = process.cwd();
      const fileBuffer = fs.readFileSync(inputPath);
      const expectedFolders = ["0", "1"];
      const expectedFiles = ["0_0.jpg", "0_1.jpg", "1_0.jpg", "1_1.jpg"];
      const outputPath = path.join(filePath,  "test");

      const response = await tile({
        fileBuffer,
        options: {
          output: outputPath,
          pyramid: true
        },
      });

      const areTiledFilesPresent = fs
        .readdirSync(path.join(outputPath, "1"), {
          withFileTypes: true,
        })
        .every((file) => expectedFiles.includes(file.name));

      expect(fs.existsSync(path.join(response, "1", "0_1.jpg")));
      // there should be two folders for zoom level 0 and 1
      expect(areTiledFilesPresent).toBe(true);
      rimraf.sync(outputPath);
    });
  });
});

