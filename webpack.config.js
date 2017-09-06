const { join, resolve } = require('path');

const srcPath = join(__dirname, 'src');
const buildPath = join(__dirname, 'public');
const webpack = require('webpack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const uglifySaveLicense = require('uglify-save-license');
const WebpackStrip = require('strip-loader');

const isProduction = (process.env.NODE_ENV === 'production');
const outputPath = resolve(__dirname, `${buildPath}/assets/javascripts`);

module.exports = {
  entry: [
    join(__dirname, 'src/assets/javascripts/main.js'),
  ],
  output: {
    path: outputPath,
    filename: '[name].js',
  },
  devtool: isProduction ? false : 'inline-source-map',
  resolve: {
    extensions: ['.js', '.json'],
    alias: {
      '~': join(srcPath),
      assets: join(srcPath, 'assets'),
      '~assets': join(srcPath, 'assets'),
    },
  },
  plugins: [
    new UglifyJSPlugin({
      beautify: !isProduction,
      mangle: false,
      compress: isProduction,
      sourceMap: !isProduction,
      uglifyOptions: {
        output: {
          comments: isProduction ? uglifySaveLicense : false,
        },
        compress: {
          drop_console: isProduction,
          drop_debugger: isProduction,
          dead_code: isProduction,
          warnings: false,
        },
      },
    }),
    new webpack.DefinePlugin({
      'process.env': { NODE_ENV: JSON.stringify(process.env.NODE_ENV) },
    }),
    new webpack.NoEmitOnErrorsPlugin(),
  ],
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: ['eslint-loader'],
        enforce: 'pre',
      },
      {
        test: /\.js?$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
      isProduction ? {
        test: /\.js?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: WebpackStrip.loader('debug', 'console.log', 'console.dir'),
          },
        ],
      } : {},
      {
        test: /\.json?$/,
        use: [
          'json-loader',
        ],
      },
    ],
  },
};
