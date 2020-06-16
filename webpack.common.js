var HtmlWebpackPlugin = require("html-webpack-plugin");
var CopyPlugin = require("copy-webpack-plugin");
var webpack = require("webpack");

module.exports = {
  stats: "errors-only",
  entry: {
    main: "./src/index.js"
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/template.html"
    }),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      ko: 'knockout'
    }),
    new CopyPlugin({
      patterns: [
        { from: 'src/assets/*', 
          to: "../dist/assets/",
          toType: 'dir',
          flatten: true
        },
        { from: 'src/fonts/*', 
        to: "../dist/fonts/",
        toType: 'dir',
        flatten: true
      }
      ],
    })
  ],
  module: {
    rules: [
      {
        test: /\.html$/,
        use: ["html-loader"]
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: {
          loader: "file-loader",
          options: {
            name: "assets/[folder]/[name].[hash].[ext]"
          }
        }
      },
      {
        test: /\.(ogg|mp3)$/,
        use: {
          loader: "file-loader",
          options: {
            name: "assets/[folder]/[name].[ext]"
          }
        }
      }
    ]
  },
  // webpack runs optimizations for you depending on the chosen mode
  // https://webpack.js.org/configuration/optimization/#root
  optimization: {

    // Now, despite any new local dependencies, our vendor hash should stay consistent between builds
    // https://webpack.js.org/configuration/optimization/#optimizationmoduleids
    moduleIds: 'hashed',

    // Split runtime code into a separate chunk
    // https://webpack.js.org/configuration/optimization/#optimizationruntimechunk
    runtimeChunk: 'single',

    // Extract third-party libraries to seperate chunk called "vendors"
    // Allows clients to request even less from the server to stay up to date
    // https://webpack.js.org/plugins/split-chunks-plugin/#root
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        }
      }
    }
  },
}