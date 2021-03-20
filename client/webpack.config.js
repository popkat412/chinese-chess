const path = require("path");
const webpack = require("webpack");
const CopyPlugin = require('copy-webpack-plugin');
const TerserPlugin = require("terser-webpack-plugin");

const distPath = path.resolve(__dirname, "..", "dist");
const nodeEnv = process.env.NODE_ENV;

console.log(`nodeEnv: ${nodeEnv}`);

module.exports = {
  entry: "./index.ts",
  mode: nodeEnv,
  devtool: nodeEnv == "production" ? "source-map" : "eval-cheap-source-map",
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
      vue: nodeEnv == "production" ? "vue/dist/vue.esm.browser.min.js" : "vue/dist/vue.esm.browser.js",
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
      __DEPLOY_URL__: JSON.stringify(nodeEnv == "production" ? "" : "http://localhost:8080"),
      __SERVER_URL__: JSON.stringify(nodeEnv == "production" ? "" : "http://localhost:3000"),
    }),
  ],
  performance: {
    hints: false,
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin({
      terserOptions: {
        compress: {
          drop_console: true,
        }
      }
    })],
  },
};
