const path = require('path');
const webpack = require('webpack');
const BundleTracker = require('webpack-bundle-tracker');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const config = require('./webpack.base.config.js');

const base_dir = path.dirname(__dirname);

process.traceDeprecation = true;

config.mode: 'development';

config.entry = './src/builder/index';

config.output = {
    path: path.resolve(base_dir, 'bundles-dev/builder/bundles/'),
    filename: 'builder-dev.js',
    // Tell Django to load from webpack-dev-server:
    publicPath: 'http://localhost:8080/builder/bundles/',
};

config.plugins = [
    new BundleTracker({ filename: 'webpack/webpack-stats.local.json' }),
    new CleanWebpackPlugin(
        [ path.resolve(base_dir, 'bundles-dev/builder/bundles/*.js') ],
        { verbose: false }
    ),
];

module.exports = config;
