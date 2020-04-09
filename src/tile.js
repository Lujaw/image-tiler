const sharp = require("sharp");
const { max, min, pow, log2, floor } = require("mathjs");
const _ = require("lodash");
const mkdirp = require("mkdirp");
const rimraf = require("rimraf");

const { TILE_HEIGHT, TILE_WIDTH } = require("./constants");

const tile = async (filePath) => {
  const image = sharp(filePath);
  const { width, height } = await image.metadata();
  const zoomLevel = getZoomLevel({ width, height });
  console.log({ width, height, zoomLevel });
  createTiles({ image, zoomLevel, height, width });
  return width;
};

const getZoomLevel = ({ width, height }) => {
  const tileSize = min([TILE_HEIGHT, TILE_WIDTH]);
  return 1 + log2(max(width, height) / tileSize);
};

const createTiles = ({ image, zoomLevel, height, width }) => {
  _.times(zoomLevel, async (level) => {
    const numOfTiles = pow(2, level);
    const outputPath = `src/assets/output/tile/${level}`;

    // clear the output folder
    rimraf.sync(outputPath);
    mkdirp.sync(outputPath);

    const extractHeight = floor(height / numOfTiles);
    const extractWidth = floor(width / numOfTiles);
    for (let xAxis = 0; xAxis < numOfTiles; xAxis++) {
      for (let yAxis = 0; yAxis < numOfTiles; yAxis++) {
        const topOffset = extractHeight * yAxis;
        const leftOffset = extractWidth * xAxis;

        console.log("tile#51->>>", {
          level,
          numOfTiles,
          leftOffset,
          topOffset,
          extractHeight,
          extractWidth,
          xAxis,
          yAxis,
        });
        const resizedTile = await resizeTiles({
          image,
          leftOffset,
          topOffset,
          extractWidth,
          extractHeight,
          outputPath,
        });
        writeToFiles({ image: resizedTile, outputPath, xAxis, yAxis });
      }
    }
  });
};

const writeToFiles = ({ image, outputPath, xAxis, yAxis }) => {
  image.toFile(`${outputPath}/${xAxis}_${yAxis}.jpg`, function (err) {
    console.log(err);
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
