const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const title = require('./package.json').description;

module.exports = function({ gdc = "http://localhost:9001", link = false } = {}) {

  const proxy = {
    "/gdc": {
      "changeOrigin": true,
      "cookieDomainRewrite": "localhost",
      "target": gdc,
      onProxyReq: proxyReq => {
        // Browers may send Origin headers even with same-origin
        // requests. To prevent CORS issues, we have to change
        // the Origin to match the target URL.
        if (proxyReq.getHeader('origin')) {
          proxyReq.setHeader('origin', gdc);
        }
      }
    },
    // This is only needed for localhost:####/account.html to work
    "/packages": {
      "changeOrigin": true,
      "cookieDomainRewrite": "localhost",
      "target": gdc
    },
    "/lib": {
      "changeOrigin": true,
      "cookieDomainRewrite": "localhost",
      "target": gdc
    },
    "/images": {
      "changeOrigin": true,
      "cookieDomainRewrite": "localhost",
      "target": gdc
    },
    "/*.html": {
      "cookieDomainRewrite": "localhost",
      "changeOrigin": true,
      "secure": false,
      "target": gdc
    }
  };

  const resolve = link ? {
    resolve: {
      alias: {
        'react': path.resolve(__dirname, '../node_modules/react'),
        'react-dom': path.resolve(__dirname, '../node_modules/react-dom'),
        '@gooddata/react-components/styles': path.resolve(__dirname, '../styles/'),
        '@gooddata/react-components': path.resolve(__dirname, '../dist/')
      }
    }
  } : {};

  return Object.assign({}, resolve, {
    entry: ["./src/index.js"],
    plugins: [
      new CleanWebpackPlugin(['dist']),
      new HtmlWebpackPlugin({
        title
      })
    ],
    output: {
      filename: '[name].bundle.js',
      path: path.resolve(__dirname, 'dist')
    },
    module: {
      rules: [
        {
          test: /\.css$/,
          loaders: ['style-loader', 'css-loader']
        },
        {
            test: /.scss$/,
            loaders: ['style-loader', 'css-loader', 'sass-loader']
        },
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader"
          }
        },
        {
          test: /\.(eot|woff|ttf|svg)/,
          use: 'file-loader'
        }
      ]
    },
    devServer: {
      contentBase: path.join(__dirname, "dist"),
      historyApiFallback: true,
      compress: true,
      port: 8999,
      proxy
    }
  })
};
