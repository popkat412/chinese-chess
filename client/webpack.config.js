const path = require("path");
const webpack = require("webpack");
const CopyPlugin = require('copy-webpack-plugin');

const distPath = path.resolve(__dirname, "..", "dist", "client");
const nodeEnv = process.env.NODE_ENV;

module.exports = {
  entry: "./index.ts",
  mode: nodeEnv,
  devtool: "inline-source-map",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      vue: "vue/dist/vue.esm.browser.js",
    }
  },
  output: {
    filename: 'bundle.js',
    path: distPath,
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: "index.html", to: path.resolve(distPath, "index.html") },
        { from: "styles.css", to: path.resolve(distPath, "styles.css") },
      ]
    }),

    new webpack.DefinePlugin({
      __DEPLOY_URL__: JSON.stringify(nodeEnv == "production" ? "" : "https://localhost:8080"),
    }),
  ]
};