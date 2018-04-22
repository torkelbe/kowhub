const path = require('path');
const webpack = require('webpack');
const BundleTracker = require('webpack-bundle-tracker');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const config = require('./webpack.base.config.js');

const base_dir = path.dirname(__dirname);

config.mode: 'production';

config.entry = './src/builder/index';

config.output = {
    path: path.resolve(base_dir, 'bundles-prod/builder/bundles/'),
    filename: 'builder-[hash].js',
};

config.plugins = [
    new BundleTracker({ filename: 'webpack/webpack-stats.production.json' }),
    new CleanWebpackPlugin([
        path.resolve(base_dir, 'bundles-prod/builder/bundles/*.js'),
    ]),
];

module.exports = config;
