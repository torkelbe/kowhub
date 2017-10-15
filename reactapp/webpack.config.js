const path = require('path')
const webpack = require('webpack')
const BundleTracker = require('webpack-bundle-tracker')

const armybuilder = {
    context: __dirname,

    entry: './src/builder/index',

    output: {
        path: path.resolve(__dirname, 'bundles/'),
        filename: 'builder-[hash].js',
    },

    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['env', 'react']
                    }
                }
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader',
                ]
            }
        ]
    },

    plugins: [
        new BundleTracker({filename: 'webpack-stats.json'}),
    ],

    resolve: {
        extensions: ['.js', '.jsx']
    },
}

module.exports = [
    armybuilder
]
