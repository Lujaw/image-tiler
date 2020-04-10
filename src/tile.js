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
    const absoluteFilePath = path.join(process.cwd(), file);
    const image = sharp(absoluteFilePath);
    const outputPath = getOutputPath(absoluteFilePath);
    createTiles({ image, outputPath });
    return outputPath;
  } catch (error) {
    throw error;
  }
};

const getZoomLevel = ({ width, height }) => {
  const tileSize = min([TILE_HEIGHT, TILE_WIDTH]);
  return 1 + log2(max(width, height) / tileSize);
};

const getOutputPath = (absoluteFilePath) => {
  const imageName = path.basename(
    absoluteFilePath,
    path.extname(absoluteFilePath)
  );
  return path.join(path.dirname(absoluteFilePath), imageName);
};

const createTiles = async ({ image, outputPath }) => {
  const { width, height } = await image.metadata();
  const zoomLevel = getZoomLevel({ width, height });

  _.times(zoomLevel, async (level) => {
    const numOfTiles = pow(2, level);
    const outputPathWithLevel = path.join(outputPath, `${level}`);

    // clear the output folder
    rimraf.sync(outputPathWithLevel);
    mkdirp.sync(outputPathWithLevel);

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
        writeToFile({
          image: resizedTile,
          outputPath: outputPathWithLevel,
          xAxis,
          yAxis,
        });
      }
    }
  });
};

const writeToFile = async ({ image, outputPath, xAxis, yAxis }) => {
  const fileWritePath = path.join(outputPath, `${xAxis}_${yAxis}.jpg`);
  try {
    image.toFile(fileWritePath);
  } catch (error) {
    console.log(`Error while writing: ${fileWritePath} `);
    console.error(error);
  }
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
