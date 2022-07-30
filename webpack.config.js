'use strict';

const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

const config = {
    entry: path.resolve(__dirname, 'app/src/index.tsx'),
    output: {
        path: path.resolve(__dirname, 'app/build'),
    },
    module: {
        rules: [{
            test: /\.tsx?$/,
            exclude: /(node_modules)/,
            use: {
                loader: require.resolve('swc-loader'),
                options: {
                    sync: true,
                    parseMap: true,
                    jsc: {
                        parser: {
                            syntax: 'typescript',
                            tsx: true,
                        },
                        transform: {
                            react: {
                                runtime: 'automatic',
                            },
                        },
                        paths: {
                            '*': [
                                'node_modules/*',
                                'app/*',
                            ],
                        },
                        baseUrl: '.',
                        target: 'es2022',
                    },
                    sourceMaps: 'inline',
                    module: {
                        type: 'es6',
                        noInterop: false,
                    },
                    env: {
                        targets: "> 0.25%, not dead",
                        mode: 'usage',
                        coreJs: '3.23',
                        shippedProposals: true
                    }
                }
            }
        },
        {
            test: /\.css$/,
            include: path.resolve(__dirname, 'app/src'),
            use: [
                require.resolve('style-loader'),
                require.resolve('css-loader'),
                require.resolve('postcss-loader')
            ]
        },
    ],
    },
    optimization: {
        runtimeChunk: true,
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, 'app/src/index.html'),
            scriptLoading: 'defer',
            hash: true,
        }),
    ],
    resolve: {
        extensions: ['.ts', '.tsx', '...'],
        alias: {
            'src': path.resolve(__dirname, 'app/src'),
        },
        symlinks: false,
    }
};

module.exports = config;