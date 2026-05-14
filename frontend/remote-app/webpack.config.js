const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { ModuleFederationPlugin } = require("webpack").container;

module.exports = {
  entry: "./src/index.js",
  output: {
    publicPath: "auto"
  },
  devServer: {
    host: "0.0.0.0",
    port: 3001,
    historyApiFallback: true,
    hot: true,
    allowedHosts: "all"
  },
  resolve: {
    extensions: [".js", ".jsx"]
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react"]
          }
        }
      }
    ]
  },
  plugins: [
    new ModuleFederationPlugin({
      name: "remoteApp",
      filename: "remoteEntry.js",
      exposes: {
        "./ProductCatalog": "./src/ProductCatalog",
        "./useSharedAuth": "./src/ProductCatalog",
        "./useSharedUI": "./src/ProductCatalog",
        "./SharedStoreProvider": "./src/ProductCatalog",
        "./GraphQLProductCatalog": "./src/GraphQLProductCatalog",
      },
      shared: {
        react: { singleton: true, requiredVersion: "18.2.0" },
        "react-dom": { singleton: true, requiredVersion: "18.2.0" },
        "react-redux": { singleton: true, requiredVersion: "^9.2.0" },
        "@reduxjs/toolkit": { singleton: true, requiredVersion: "^2.8.2" },
        "@mui/material": { singleton: true, requiredVersion: "^9.0.1" },
        "@mui/icons-material": { singleton: true, requiredVersion: "^9.0.1" },
        "@emotion/react": { singleton: true, requiredVersion: "^11.14.0" },
        "@emotion/styled": { singleton: true, requiredVersion: "^11.14.1" }
      }
    }),
    new HtmlWebpackPlugin({
      template: "./public/index.html"
    })
  ]
};
