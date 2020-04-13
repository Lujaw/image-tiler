const fs = require("fs");
const sharp = require("sharp");
const _ = require("lodash");
const path = require("path");
const mkdirp = require("mkdirp");
const rimraf = require("rimraf");
const { max, min, pow, log2, floor, fraction, round } = require("mathjs");
const { TILE_HEIGHT, TILE_WIDTH, VALID_EXT } = require("./constants");

const tile = async ({ file, fileBuffer, options }) => {
  try {
    if (file) {
      if (!fs.existsSync(file) || !VALID_EXT.includes(path.extname(file))) {
        throw new Error("Please enter valid image");
      }
      const absoluteFilePath = path.join(process.cwd(), file);
      const image = sharp(absoluteFilePath);
      console.log('tile#18->>>', { options, absoluteFilePath });
      options.output = getOutputPath(options.output || absoluteFilePath);
      await createTiles({ image, options });
      return options.output;
    }
    if (fileBuffer && options.output) {
      const image = sharp(fileBuffer);
      options.output = path.join(process.cwd(), options.output);
      await createTiles({ image, options });
      return options.output;
    }
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

const createTiles = async ({ image, options }) => {
  const { width, height } = await image.metadata();
  const zoomLevel = getZoomLevel({ width, height });
  const createTilePromises = [];

  _.times(zoomLevel, async (level) => {
    let xAxisTiles, yAxisTiles;
    if (options.pyramid) {
      const numOfTiles = pow(2, level);
      xAxisTiles = numOfTiles;
      yAxisTiles = numOfTiles;
    } else {
      xAxisTiles = round(width / TILE_WIDTH);
      yAxisTiles = round(height / TILE_HEIGHT);

      if (xAxisTiles !== yAxisTiles) {
        const { d: leastYaxisTiles, n: leastXaxisTiles } = fraction(
          xAxisTiles,
          yAxisTiles
        );
        xAxisTiles = level * leastXaxisTiles || 1;
        yAxisTiles = level * leastYaxisTiles || 1;
      };
      xAxisTiles = level * xAxisTiles || 1;
      yAxisTiles = level * yAxisTiles || 1;
    }

    const outputPathWithLevel = path.join(options.output, `${level}`);

    // clear the output folder
    rimraf.sync(outputPathWithLevel);
    mkdirp.sync(outputPathWithLevel);

    for (let yAxis = 0; yAxis < yAxisTiles; yAxis++) {
      for (let xAxis = 0; xAxis < xAxisTiles; xAxis++) {
        const extractHeight = floor(height / yAxisTiles);
        const extractWidth = floor(width / xAxisTiles);
        const topOffset = extractHeight * yAxis;
        const leftOffset = extractWidth * xAxis;

        const heightToExtract =
          topOffset + extractHeight <= height
            ? extractHeight
            : height - topOffset;
        const widthToExtract =
          leftOffset + extractWidth <= width
            ? extractWidth
            : width - leftOffset;

        const resizedTile = resizeTiles({
          image,
          leftOffset,
          topOffset,
          extractWidth: widthToExtract,
          extractHeight: heightToExtract,
          pyramid: options.pyramid,
        });

        createTilePromises.push(
          writeToFile({
            image: resizedTile,
            outputPath: outputPathWithLevel,
            xAxis,
            yAxis,
          })
        );
      }
    }
  });
  try {
    const allTiles = await Promise.all(createTilePromises);
    return allTiles;
  } catch (error) {
    console.log("Error while creating tiles", error.message);
    throw error;
  };
};

const writeToFile = async ({ image, outputPath, xAxis, yAxis }) => {
  const fileWritePath = path.join(outputPath, `${xAxis}_${yAxis}.jpg`);
  return image.toFile(fileWritePath);
};

const resizeTiles = ({
  image,
  leftOffset,
  topOffset,
  extractWidth,
  extractHeight,
  pyramid,
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
      fit: pyramid ? "fill" : "cover",
      position: "left top",
      background: "white",
    });
};

module.exports = {
  tile,
};
