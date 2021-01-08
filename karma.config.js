const path = require("path")
const webpack = require("webpack");

module.exports = function (config) {
    config.set({
        basePath: '.',
        frameworks: ['jasmine', 'webpack'],
        files: [
            {
                pattern: "test/**/*spec.ts",
                type: "js"
            },
            {
                pattern: "test/utils/DelayWorkletProcessor.js",
                included: false,
            },{
                pattern: "src/DelayBuffer.js",
                included: false,
            }
            
        ],
        proxies: {
            '/utils': '/base/test/utils/'
        },
        preprocessors: {
            'test/**/*.spec.ts': [ 'webpack' ],
        },
        webpack: {
            resolve: {
                extensions: ['.js', '.ts', '.tsx']
            },
            module: {
                rules: [
                    {
                        test: /\.(ts|js)x?$/, 
                        exclude: [/node_modules/],
                        use: [{
                            loader: 'ts-loader',
                            options: {
                                transpileOnly: true
                            }
                          //  options: {presets: ["@babel/preset-env"]}
                        }]
                    }
                ]
            },
            stats: {
                colors: true,
                modules: true,
                reasons: true,
                errorDetails: true
            },
            plugins: [
                new webpack.SourceMapDevToolPlugin({
                    filename: null, // if no value is provided the sourcemap is inlined
                    test: /\.(ts|js)($|\?)/i, // process .js and .ts files only
                    exclude: [ /node_modules/ ]
                })
            ],
            output: { path: path.resolve( __dirname, '/temp' ), filename: '[name].js' } 
        },

        plugins: [
            'karma-*',
        ],
        reporters: ['spec', "kjhtml"],
        jasmineHtmlReporter: {
            suppressAll: true, // Suppress all messages (overrides other suppress settings)
            suppressFailed: true // Suppress failed messages
        },

        logLevel: 'LOG',
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: true,
        browsers: ['Chrome'],

        singleRun: false,
        concurrency: Infinity,
        mime: { 'text/x-typescript': ['ts','tsx'] },
    })
}