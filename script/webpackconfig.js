import util from 'util';

import webpack from 'webpack';
import merge from 'webpack-merge';

function promisify(func) {
  try {
    return util.promisify(func);
  } catch (err) {
    return { error: err.message };
  }
}

class WebpackConfig {
  static async frontend(opts = {}, enableDev = false) {
    const config = merge.smart(Object.assign({}, {
      module: {
        rules: [
          {
            test: /\.js$/,
            exclude: /(node_modules|bower_components)/,
            use: {
              loader: 'babel-loader',
              options: {
                babelrc: false,
                presets: [
                  ['env', { targets: { browsers: ['last 2 Chrome versions', 'ie >= 11'] } }],
                  'react',
                  'stage-0'
                ]
              }
            }
          },
          {
            test: /\.css$/,
            use: [
              'style-loader',
              'css-loader'
            ]
          },
          {
            test: /\.(png|jpg|gif|woff|woff2)$/,
            use: 'url-loader?limit=8192'
          },
          {
            test: /\.(mp4|ogg|eot|ttf|svg)$/,
            use: 'file-loader'
          }
        ]
      }
    }, opts));

    if (enableDev) {
      return webpack(config);
    }

    return promisify(webpack)(config);
  }

  static async backend(opts = {}) {
    const config = merge.smart(Object.assign({}, {
      module: {
        rules: [
          {
            test: /\.js$/,
            exclude: /(node_modules|bower_components)/,
            use: {
              loader: 'babel-loader',
              options: {
                babelrc: false,
                presets: [[
                  'env',
                  {
                    targets: { node: 'current' }
                  }
                ]]
              }
            }
          }
        ]
      },
      node: {
        __dirname: false
      }
    }, opts));

    return promisify(webpack)(config);
  }
}

export default WebpackConfig;
