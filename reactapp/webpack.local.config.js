const path = require('path');
const webpack = require('webpack');
const BundleTracker = require('webpack-bundle-tracker');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const config = require('./webpack.base.config.js');

config.entry = './src/builder/index';

config.output = {
    path: path.resolve(__dirname, 'bundles-dev/builder/bundles/'),
    filename: 'builder-dev.js',
    // Tell Django to load from webpack-dev-server:
    publicPath: 'http://localhost:8080/builder/bundles/',
};

config.plugins = [
    new BundleTracker({ filename: 'webpack-stats.local.json' }),
    new CleanWebpackPlugin(
        [ path.resolve(__dirname, 'bundles-dev/builder/bundles/*.js') ],
        { verbose: false }
    ),
];

module.exports = config;
