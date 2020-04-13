<!--
title: 'Image Tiler'
description: 'Command Line utility to write a "pyramid" of tiles which can be used for zoom application'
framework: v1
language: nodeJS
authorLink: 'https://github.com/lujaw'
authorName: 'Luja Shrestha'
-->

# Image Tiler

A command line utility function which writes a pyramid of tiles from a given image.

## Pre-requisites

In order to run the utility function, you will need the following:

- Node.js 12.0

## Setting up the project

1. Clone the repository and install the dependencies:

```
npm i
```

2. Following commands are available for the testing

```
npm run test
```

3. Run following in root folder to make "tiler" command available in the shell:

```
npm link
```

4. Access image-tiler help using

```
tiler help
```

5. Tile the image with name cat.jpg inside image directory by using command:

```
tiler image/cat.jpg
```

The image pyramid will be in the folder image/cat directory.

### TODO

- Add more arguments to the command

TradeOffs:

While creating the tiles, it divides the image by respecting the aspect ratio.
For example: An image with dimension 1024 by 1280 will be divided into the tile in the multiple
of (4 by 5).
When feeding the same image for the tile view, it won't be displayed correctly as it needs
the pyramid tile. But if we create pyramid tiles, it will crop out large portion of the image while
resizing the tiles.
Hence, the tradeoff made for this is, when the pyramid mode is selected and the image dimension is not
a square, is uses a "fill" mode for "object-fit" while resizing, which doesn't respect the aspect ratio.

TLDR: We trade off aspect ratio for image pyramid, when the image dimension is not exactly a square.
