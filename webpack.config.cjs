const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlInlineScriptPlugin = require('html-inline-script-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const fs = require('fs');
            {
                test: /\.html$/i,
                use: ['html-loader'],
            },
    return {
        mode: 'production',
        entry: './src/main.ts',
            {
                test: \/\.html$\/i,
                use: ['html-loader'],
            },
        devtool: false,

        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: '[name].[contenthash:8].js',
            chunkFilename: '[name].[contenthash:8].chunk.js',
            clean: true,
            publicPath: './',
            environment: {
                arrowFunction: false,
                const: false,
                destructuring: false,
                forOf: false,
            }
        },

        optimization: {
            minimize: true,
            minimizer: [
                new TerserPlugin({
                    terserOptions: {
                        compress: {
                            drop_console: true,
                            drop_debugger: true,
                            passes: 2,
                        },
                        mangle: {
                            safari10: true,
                        },
                        format: {
                            comments: false,
                        },
                    },
                    extractComments: false,
                }),
            ],
            splitChunks: {
                chunks: 'all',
                cacheGroups: {
                    default: false,
                    vendors: false,
                    vendor: {
                        name: 'vendor',
                        chunks: 'all',
                        test: /node_modules/,
                        priority: 20
                    },
                    pixi: {
                        name: 'pixi',
                        chunks: 'all',
                        test: /[\\/]node_modules[\\/](pixi\.js|@pixi)[\\/]/,
                        priority: 30
                    }
                },
            },
            usedExports: true,
            sideEffects: false,
        },
    

    resolve: {
        extensions: ['.ts', '.js', '.mjs', '.json'],
        alias: {
            // Replace fetch with polyfill
            // This might not work for all cases as fetch is a global
        },
        fallback: {
            // Provide polyfills if needed
        }
    },

    plugins: [
        new webpack.ProvidePlugin({
            // Provide global replacements - this is the key addition
        }),
        new webpack.DefinePlugin({
            // Replace fetch globally in build
            'globalThis.fetch': 'fetchPolyfill',
            'window.fetch': 'fetchPolyfill',
            'self.fetch': 'fetchPolyfill'
        })
    ],

    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.mjs$/,
                include: /node_modules/,
                type: 'javascript/auto',
                resolve: { fullySpecified: false }
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif|txt|pac|mp3|wav|ogg|ttf)$/i,
                type: 'asset/inline',
            },
            {
                test: /\.atlas$/,
                type: 'asset/inline',
                generator: {
                    dataUrl: {
                        mimetype: 'text/plain'
                    }
                }
            },
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
        ],
    },

        plugins: [
            new HtmlWebpackPlugin({
                templateContent: fs.readFileSync(path.resolve(__dirname, './src/index.html'), 'utf8'),
                filename: 'index.html',
                inject: 'body',
                minify: {
                    removeComments: true,
                    collapseWhitespace: true,
                    removeRedundantAttributes: true,
                    useShortDoctype: true,
                    removeEmptyAttributes: true,
                    removeStyleLinkTypeAttributes: true,
                    keepClosingSlash: true,
                    minifyJS: true,
                    minifyCSS: true,
                    minifyURLs: true
                }
            }),
            
            new HtmlInlineScriptPlugin(),
            
            new webpack.optimize.LimitChunkCountPlugin({
                maxChunks: 1,
            }),

            new CompressionPlugin({
                algorithm: 'gzip',
                test: /\.(js|css|html)$/,
                threshold: 8192,
                minRatio: 0.8,
            }),

            // Bundle analyzer (only when ANALYZE=true)
            ...(isAnalyze ? [new BundleAnalyzerPlugin({
                analyzerMode: 'static',
                openAnalyzer: false,
                reportFilename: 'bundle-report.html'
            })] : []),

            new webpack.ProvidePlugin({
                // Provide global replacements
            }),
            
            new webpack.DefinePlugin({
                'globalThis.fetch': 'fetchPolyfill',
                'window.fetch': 'fetchPolyfill',
                'self.fetch': 'fetchPolyfill',
                'process.env.NODE_ENV': JSON.stringify('production'),
            })
        ],

        performance: {
            hints: 'warning',
            maxEntrypointSize: 512000,
            maxAssetSize: 512000,
        },
    };
};