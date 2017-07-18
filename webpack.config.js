const path = require('path');
const webpack = require('webpack');

const globalName = "ReconnectingEventSource";

const srcDir = path.join(__dirname, 'src');
const { BUILD_TARGET = "" } = process.env;

function buildEntry() {
    let entry;
    switch(BUILD_TARGET) {
        case "umd":
        case "umd-min":
            entry = "./index-umd.js";
            break;
        default:
            entry = "./index.js";
    }
    return entry;
}

function buildOutput() {
    let outputDir;
    switch(BUILD_TARGET) {
        case "commonjs":
            outputDir = "lib";
            break;
        default:
            outputDir = "dist";
    }

    const outputPath = path.join(__dirname, outputDir);

    let outputFilename;
    switch(BUILD_TARGET) {
        case "umd":
            outputFilename = globalName + ".js";
            break;
        case "umd-min":
            outputFilename = globalName + ".min.js";
            break;
        default:
            outputFilename = "index.js";
    }

    const output = {
        path: outputPath,
        filename: outputFilename,
    };
    switch(BUILD_TARGET) {
        case "commonjs":
            Object.assign(output, {
                libraryTarget: 'commonjs2'
            });
            break;
        case "umd":
            Object.assign(output, {
                libraryTarget: 'var',
                library: globalName
            });
    }
    return output;
}

function addBabelRule(rules) {
    let moduleType;
    switch(BUILD_TARGET) {
        case "commonjs":
            moduleType = "commonjs";
            break;
        default:
            moduleType = "umd";
    }

    const babelRule = {
        test: /\.js$/,
        use: [
            {
                // Use Babel to transpile ES2015 + ES2017 async syntax
                loader: 'babel-loader',
                options: JSON.stringify({
                    presets: [
                        ['env', {modules: moduleType}]
                    ]
                })
            }
        ],
        include: srcDir
    };

    return [...rules, babelRule];
}

function addMinifyPlugin(plugins) {
    if (BUILD_TARGET === "umd-min") {
        const minifyPlugin = new webpack.optimize.UglifyJsPlugin({
            compress: { warnings: false }
        });
        return [...plugins, minifyPlugin];
    }
    return plugins;
}

const entry = buildEntry();
const output = buildOutput();

let rules = [];
rules = addBabelRule(rules);

let plugins = [];
plugins = addMinifyPlugin(plugins);

const config = {
    context: srcDir,
    entry,
    output,
    module: {
        rules
    },
    plugins
};

module.exports = config;
