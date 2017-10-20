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
                test: /\.scss$/,
                use: [
                    'style-loader',     // Integrate JS
                    'css-loader',       // CSS -> JS
                    'sass-loader',      // Sass -> CSS
                ]
            }
        ]
    },

    resolve: {
        modules: ["node_modules", "src/lib"],
        extensions: ['.js', '.jsx']
    },
}
