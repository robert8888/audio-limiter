const path = require("path")

module.exports = {
    mode: 'production',
    entry: './src/ImageFallback.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'limiter-audio-node.js',
        library: 'limiter-audio-node',
        libraryTarget: 'umd',
        libraryExport: 'default',
        globalObject: 'this',
    },

    module: {
        rules: [{
            // Include ts, tsx, js, and jsx files.
            test: /\.(ts|js)x?$/,
            exclude: /node_modules/,
            loader: 'babel-loader',
        }],
    },
    resolve: {
        extensions: [ '.tsx', '.ts', '.js' ],
    },
};
