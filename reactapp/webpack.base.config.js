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
                        presets: ['env', 'react', 'stage-2']
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
            },
            {
                test: /\.(png|svg|jpg)$/,
                use: [
                    'file-loader'
                ]
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/,
                use: [
                    'file-loader'
                ]
            }
        ]
    },

    resolve: {
        modules: ["node_modules", "src/lib", "src/img"],
        extensions: ['.js', '.jsx']
    },
}
