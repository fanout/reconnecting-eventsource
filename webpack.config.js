const path = require("path");

const config = {
  entry: path.resolve(__dirname, 'src/main.browser.ts'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'ReconnectingEventSource.min.js',
    library: {
      type: 'var',
      name: '_ReconnectingEventSource',
    },
    umdNamedDefine: true
  },
  mode: 'production',
  optimization: {
    minimize: true
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  devtool: 'source-map',
  module: {
    rules: [{
      test: /\.tsx?$/,
      loader: 'ts-loader',
      exclude: /node_modules/,
      options: {
        compilerOptions: {
          declaration: false,
          declarationMap: false,
        },
      },
    }],
  },
}

module.exports = config;
