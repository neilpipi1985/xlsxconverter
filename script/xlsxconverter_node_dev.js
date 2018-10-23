const path = require('path');
const webpack = require('webpack');
const { devMiddleware, hotMiddleware } = require('koa-webpack-middleware');

const args = require('minimist')(process.argv.slice(2));

const pkg = require('../package.json');
const WebpackConfig = require('./webpackconfig');

const XLSXMGR = 'xlsxconverter';
const SYS_NAME = args.sysname || XLSXMGR;
const SYS_MODE = 'development';
const APP_TARGET = args.target || 'node';

const WEB_PATH = 'http://localhost';


process.env.RENDER_FILE = `${XLSXMGR}.js`;
process.env.SYS_NAME = SYS_NAME;
process.env.SYS_VER = pkg.version;
process.env.AUTHOR = pkg.author;

async function run() {
  console.log(`Initialize ${SYS_NAME}(Dev)`);
  try {
    const XlsxConverter = require(`../src/${SYS_NAME}.js`);

    const target = ((APP_TARGET === 'electron') ? 'electron-renderer' : 'web');
    const entry = ['babel-polyfill', path.resolve(__dirname, `../src/render/${XLSXMGR}.js`)];
    const output = {
      path: path.resolve(__dirname, '../dev/render'),
      filename: `${XLSXMGR}.js`,
      publicPath: WEB_PATH,
      libraryTarget: (APP_TARGET === 'electron' ? 'commonjs2' : 'var')
    };

    const compile = await WebpackConfig.frontend({
      target,
      mode: SYS_MODE,
      entry,
      output,
      plugins: [
        new webpack.NamedModulesPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.EnvironmentPlugin()
      ],
      devtool: 'cheap-module-eval-source-map'
    }, true);

    XlsxConverter.webApp.use(devMiddleware(compile, {
      // public path to bind the middleware to
      // use the same as in webpack
      publicPath: WEB_PATH,
      // options for formating the statistics
      stats: {
        colors: true
      }
    }));
    XlsxConverter.webApp.use(hotMiddleware(compile));


    await XlsxConverter.initApp({ enableDevMode: true });

    console.log(`${SYS_NAME}(Dev) is running`);
  } catch (err) {
    console.log(`${SYS_NAME}(Dev) Crash(${err.message})`);
  }
}

run();
