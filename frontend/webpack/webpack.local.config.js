const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const BundleTracker = require('webpack-bundle-tracker');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const base_config = require('./webpack.base.config.js');

const base_dir = path.dirname(__dirname);

process.traceDeprecation = true;

module.exports = merge(base_config, {

    mode: 'development',

    devtool: 'inline-source-map',

    entry: './src/builder/index',

    output: {
        path: path.resolve(base_dir, 'bundles-dev/builder/bundles/'),
        filename: 'builder-dev.js',
        // Tell Django to load from webpack-dev-server:
        publicPath: 'http://localhost:8080/builder/bundles/',
    },

    plugins: [
        new BundleTracker({ filename: 'webpack/webpack-stats.local.json' }),
        new CleanWebpackPlugin(
            ['bundles-dev/builder/bundles/*.js'],
            { root: base_dir, verbose: false }
        ),
    ],
});

