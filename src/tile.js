const sharp = require("sharp");
const { max, min, pow, log2, floor } = require("mathjs");
const _ = require("lodash");
const mkdirp = require("mkdirp");
const rimraf = require("rimraf");

const { TILE_HEIGHT, TILE_WIDTH } = require("./constants");


const tile = async (filePath) => {
  console.log('tile#5->>>', { filePath });
  const image = sharp(filePath);
  const { width, height } = await image.metadata();
  const zoomLevel = 3 || getZoomLevel({ width, height })
  console.log({ width, height, zoomLevel });
  createTiles({ image, zoomLevel, height, width });
  return width;
}

const getZoomLevel = ({ width, height }) => {
  const tileSize = min([TILE_HEIGHT, TILE_WIDTH]);
  return 1 + log2(max(width, height)) / TILE_HEIGHT;
};

const createTiles = async ({ image, zoomLevel, height, width }) => {


  _.times(zoomLevel, (level) => {
    const numOfTiles = pow(2, level);
    const numberOfRows = floor(height / TILE_HEIGHT);
    const numberOfColumns = floor(width / TILE_WIDTH);
    const outputPath = `src/assets/output/tile/${level}`;
    console.log('tile#33->>>',{numberOfRows, numberOfColumns},);
    // const 
    // clear the output folder
    rimraf.sync(outputPath);
    mkdirp(outputPath).then(async (dir) => {
      const extractHeight = floor(height / numOfTiles);
      const extractWidth = floor(width / numOfTiles);
      for (let xAxis = 0; xAxis < numOfTiles; xAxis++) {
        for (let yAxis = 0; yAxis < numOfTiles; yAxis++) {
          const topOffset = extractHeight * yAxis;
          const leftOffset = extractWidth * xAxis;

          console.log('tile#51->>>', { level, numOfTiles, leftOffset, topOffset, extractHeight, extractWidth, xAxis, yAxis });
          const resized = await resizeTiles({ image, leftOffset, topOffset, extractWidth, extractHeight ,dir});
          writeToFiles({ image: resized, dir, xAxis, yAxis });
        }
      }
    })
  });
}

const writeToFiles = ({ image, dir, xAxis, yAxis }) => {
  image.toFile(`${dir}/${xAxis}_${yAxis}.jpg`, function (err) {
    console.log(err);
  });
}


const resizeTiles = ({ image, leftOffset, topOffset, extractWidth, extractHeight ,dir}) => {
  return image
    .clone()
    .extract({ left: leftOffset, top: topOffset, width: extractWidth, height: extractHeight })
    .resize(TILE_HEIGHT, TILE_WIDTH, {
      fit: 'contain',
      position: 'left top',
      background: "white",
      // strategy: "entropy"
    })
    // .extract({ left: 0, top: 0, width: TILE_WIDTH, height: TILE_HEIGHT })
}

module.exports = {
  tile
}