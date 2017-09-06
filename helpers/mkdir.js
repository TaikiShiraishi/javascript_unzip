const fs = require('fs-extra');
const touch = require('touch');

const markup = 'src/markup';
const images = 'src/assets/images';
const styles = 'src/assets/stylesheets';
const scripts = 'src/assets/javascripts';
const favicons = 'src/assets/favicons';
const dirs = [
  `${markup}/_base`,
  `${markup}/_data`,
  `${styles}/0-foundation`,
  `${styles}/1-base`,
  `${styles}/2-project`,
  `${styles}/3-cosmetic`,
  `${styles}/include`,
  `${images}/_symbol`,
  `${images}/vector`,
  `${images}/raster`,
  `${scripts}`,
  `${favicons}`,
];

console.log('mkdir start')
dirs.forEach((dir) => {
  try {
    fs.mkdirsSync(dir);
    touch(`${dir}/.gitkeep`);
  } catch (err) {
    console.error('mkdir error!!')
    console.error(err);
  }
});
console.log('mkdir finished!!')
