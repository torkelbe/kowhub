const path = require('path');
const webpack = require('webpack');
const BundleTracker = require('webpack-bundle-tracker');

const config = require('./webpack.base.config.js');

config.entry = './src/builder/index';

config.output = {
    path: path.resolve(__dirname, 'bundles-dev/builder/bundles/'),
    filename: 'builder-dev.js',
};

config.plugins = [
    new BundleTracker({ filename: 'webpack-stats.local.json' }),
];

module.exports = config;
