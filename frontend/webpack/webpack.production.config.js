const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const BundleTracker = require('webpack-bundle-tracker');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const base_config = require('./webpack.base.config.js');

const base_dir = path.dirname(__dirname);

module.exports = merge(base_config, {

    mode: 'production',

    entry: './src/builder/index',

    output: {
        path: path.resolve(base_dir, 'bundles-prod/builder/bundles/'),
        filename: 'builder-[hash].js',
    },

    plugins: [
        new BundleTracker({ filename: 'webpack/webpack-stats.production.json' }),
        new CleanWebpackPlugin([
            path.resolve(base_dir, 'bundles-prod/builder/bundles/*.js'),
        ]),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production')
        }),
    ],
});

