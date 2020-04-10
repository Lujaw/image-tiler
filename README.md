# image-tiler

A command line utility function which writes a pyramid of tiles from a given image.
Image Tiler
=======

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

3. Make the utility available local using:

```
npm link
```

4. Access image-tiler help using

```
tiler help
```

5. Tile the image with name cat.jpg as follows

```
tiler tile image/cat.jpg
```

The image pyramid will be in the folder image/cat directory.

### TODO

- Add more arguments to the command
  > > > > > > > PROP-01: adding instructions in readme
