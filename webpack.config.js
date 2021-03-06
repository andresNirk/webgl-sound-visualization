/* eslint-env node */
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const PUBLIC = __dirname + "/web";
const TITLE = "Sound visualizations";


const plugins = [
        new HtmlWebpackPlugin({
            title: TITLE,
            filename: 'index.html',
            template: 'src/index.html'
        }),
        //copy the assets (with no css compilation)
        new CopyWebpackPlugin([
            {from:'src/textures',to:'textures'},
            {from:'src/css',to:'css'},
        ]),
        // clean the output folder
        new CleanWebpackPlugin(['web']),
];

module.exports = {
    target: 'web',
    devtool: 'source-map',
    entry: './index.js',
    output: {
        path: PUBLIC,
        filename: 'bundle.js',
        publicPath: ''
    },
    plugins,
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
            }
        ]
    },
    resolve: {
        alias: {
            src: path.resolve(__dirname, "./src"),
        },
    },
};
