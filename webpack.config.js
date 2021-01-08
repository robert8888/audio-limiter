const path = require("path")
const LastCallWebpackPlugin = require('last-call-webpack-plugin');

module.exports = [{
    mode: 'production',
    entry: ['./src/LimiterWorkletProcessor.ts'],
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'limiter-audio-worklet-processor.js',

        module: true
    },

    module: {
        rules: [{
            // Include ts, tsx, js, and jsx files.
            test: /\.(ts|js)x?$/,
            exclude: [/node_modules/],
            use: [{
                loader: 'babel-loader',
                options: {presets: ["@babel/preset-env"]}
            }]
        }],
    },
    plugins: [
        new LastCallWebpackPlugin({
            assetProcessors: [ {
                phase: 'emit',
                regExp:  /\.(ts|js)x?$/,
                processor: (assetName, asset, assets)  => {
                   // assets.setAsset(assetName, null);
                    assets.setAsset(
                        assetName.split(".")[0] + '-module.js', 
                        `export const worklet = '${asset.source().replace(/'/gm, "\\'")}'`
                    );
                    return Promise.resolve();
                } 
              }
            ],
            canPrint: true
        })
    ],
    resolve: {
        extensions: [ '.tsx', '.ts', '.js' ],
    },
    experiments: {
		outputModule: true
	}
}, {
    mode: 'production',
    entry: ['./src/createLimiter.ts'],
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'limiter-audio-loader.js',
        library: 'limiter-audio-loader',
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
}];
