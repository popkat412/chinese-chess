/* eslint-disable @typescript-eslint/no-var-requires */

const path = require("path");

const srcPath = path.join(__dirname, "src");
const clientPath = path.join(srcPath, "client");
const sharedPath = path.join(srcPath, "shared");

module.exports = {
  devServer: {
    proxy: "http://localhost:3000",
  },
  configureWebpack: {
    entry: {
      app: path.join(clientPath, "main.ts"),
    },
    // resolve: {
    //   alias: {
    //     "@app": clientPath,
    //     "@shared": sharedPath,
    //   },
    // },
  },
};
