const path = require('path')

module.exports = {
    context: __dirname,

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

    resolve: {
        modules: ["node_modules", "src/lib"],
        extensions: ['.js', '.jsx']
    },
}
