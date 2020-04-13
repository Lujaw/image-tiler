const fs = require("fs");
const sharp = require("sharp");
const _ = require("lodash");
const path = require("path");
const mkdirp = require("mkdirp");
const rimraf = require("rimraf");
const lignator = require("lignator");
const { max, min, pow, log2, floor, fraction, round } = require("mathjs");
const { TILE_HEIGHT, TILE_WIDTH, VALID_EXT } = require("./constants");

const tile = async ({ file, fileBuffer, options }) => {
  try {
    // console.log('tile#12->>>', { file, fileBuffer, options });
    if (file) {
      if (!fs.existsSync(file) || !VALID_EXT.includes(path.extname(file))) {
        throw new Error("Please enter valid image");
      }
      const absoluteFilePath = path.join(process.cwd(), file);
      const image = sharp(absoluteFilePath);
      const newOptions = {
        ...options,
        output: getOutputPath(options.output || absoluteFilePath),
      };

      const outputPath = getOutputPath(options.output || absoluteFilePath);
      await createTiles({ image, options: newOptions });
      return outputPath;
    }
    if (fileBuffer && options.output) {

      const image = sharp(fileBuffer);
      options.output = path.join(process.cwd(), options.output);
      await createTiles({ image, options });
      console.log('tile#31->>>', fileBuffer && options.output, { options });
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
    // rimraf.sync(outputPathWithLevel);
    // lignator.remove(outputPathWithLevel);
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

        try {
          const resizedTile = await resizeTiles({
            image,
            leftOffset,
            topOffset,
            extractWidth: widthToExtract,
            extractHeight: heightToExtract,
            pyramid: options.pyramid,
          });
          // console.log('tile#112->>>', { xAxis, yAxis, outputPathWithLevel });
          writeToFile({
            image: resizedTile,
            outputPath: outputPathWithLevel,
            xAxis,
            yAxis,
          });
        } catch (error) {
          throw new Error(error);
        };
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
    throw new Error(error);
  }
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
