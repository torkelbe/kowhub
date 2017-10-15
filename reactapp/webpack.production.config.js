const path = require('path');
const webpack = require('webpack');
const BundleTracker = require('webpack-bundle-tracker');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const config = require('./webpack.base.config.js');

config.entry = './src/builder/index';

config.output = {
    path: path.resolve(__dirname, 'bundles-prod/builder/bundles/'),
    filename: 'builder-[hash].js',
};

config.plugins = [
    new BundleTracker({ filename: 'webpack-stats.production.json' }),
    new CleanWebpackPlugin([
        path.resolve(__dirname, 'bundles-prod/builder/bundles/*.js'),
    ]),
];

module.exports = config;