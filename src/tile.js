const fs = require("fs");
const sharp = require("sharp");
const _ = require("lodash");
const path = require("path");
const mkdirp = require("mkdirp");
const rimraf = require("rimraf");
const { max, min, pow, log2, floor } = require("mathjs");
const { TILE_HEIGHT, TILE_WIDTH, VALID_EXT } = require("./constants");

const tile = async (file) => {
  if (!fs.existsSync(file) || !VALID_EXT.includes(path.extname(file))) {
    throw new Error("Please enter valid image");
  }
  try {
    const image = sharp(file);
    const filePath = `${process.cwd()}/${path.dirname(file)}`;
    createTiles({ image, filePath });
    return filePath;
  } catch (error) {
    throw error;
  }
};

const getZoomLevel = ({ width, height }) => {
  const tileSize = min([TILE_HEIGHT, TILE_WIDTH]);
  return 1 + log2(max(width, height) / tileSize);
};

const createTiles = async ({ image, filePath }) => {
  const { width, height } = await image.metadata();
  const zoomLevel = getZoomLevel({ width, height });
  _.times(zoomLevel, async (level) => {
    const numOfTiles = pow(2, level);
    const outputPath = `${filePath}/${level}`;

    // clear the output folder
    rimraf.sync(outputPath);
    mkdirp.sync(outputPath);

    const extractHeight = floor(height / numOfTiles);
    const extractWidth = floor(width / numOfTiles);
    for (let xAxis = 0; xAxis < numOfTiles; xAxis++) {
      for (let yAxis = 0; yAxis < numOfTiles; yAxis++) {
        const topOffset = extractHeight * yAxis;
        const leftOffset = extractWidth * xAxis;
        const resizedTile = await resizeTiles({
          image,
          leftOffset,
          topOffset,
          extractWidth,
          extractHeight,
          outputPath,
        });
        writeToFile({ image: resizedTile, outputPath, xAxis, yAxis });
      }
    }
  });
};

const writeToFile = ({ image, outputPath, xAxis, yAxis }) => {
  image.toFile(`${outputPath}/${xAxis}_${yAxis}.jpg`, function (err) {
    if (err) {
      console.log(err);
    }
  });
};

const resizeTiles = ({
  image,
  leftOffset,
  topOffset,
  extractWidth,
  extractHeight,
}) => {
  return image
    .clone()
    .extract({
      left: leftOffset,
      top: topOffset,
      width: extractWidth,
      height: extractHeight,
    })
    .resize(TILE_HEIGHT, TILE_WIDTH, {
      fit: "contain",
      position: "left top",
      background: "white",
    });
};

module.exports = {
  tile,
};
