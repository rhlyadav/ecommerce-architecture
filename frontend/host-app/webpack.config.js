const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");
const { ModuleFederationPlugin } = webpack.container;

module.exports = {
  entry: "./index.js",
  output: {
    publicPath: "auto"
  },
  devServer: {
    host: "0.0.0.0",
    port: 3000,
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
    new webpack.DefinePlugin({
      "process.env.USER_API_BASE_URL": JSON.stringify(process.env.USER_API_BASE_URL || "http://localhost:4001/api"),
      "process.env.PRODUCT_API_BASE_URL": JSON.stringify(process.env.PRODUCT_API_BASE_URL || "http://localhost:4002/api")
    }),
    new ModuleFederationPlugin({
      name: "hostApp",
      remotes: {
        remoteApp: "remoteApp@http://localhost:3001/remoteEntry.js"
      },
      shared: {
        react: { singleton: true, requiredVersion: "18.2.0" },
        "react-dom": { singleton: true, requiredVersion: "18.2.0" },
        "react-redux": { singleton: true },
        "@reduxjs/toolkit": { singleton: true }
      }
    }),
    new HtmlWebpackPlugin({
      template: "./index.html"
    })
  ]
};
