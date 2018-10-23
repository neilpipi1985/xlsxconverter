import path from 'path';

import minimist from 'minimist';
import webpack from 'webpack';
import fse from 'fs-extra';

import Utility from '../src/utility';
import WebpackConfig from './webpackconfig';

const pkg = require('../package.json');

const args = minimist(process.argv.slice(2));

const XLSXMGR = 'xlsxconverter';
const SYS_NAME = args.sysname || XLSXMGR;
const SYS_VER = args.sysver || '1.0.0';
const SYS_TITLE = 'XLSX Converter';

const SYS_MODE = (args.d) ? 'development' : 'production';
const APP_TARGET = args.target || 'node';
const RENDER_FILE = `${XLSXMGR}.js`;
const ELECTRON_RENDER_FILE = `${XLSXMGR}_electron.js`;

const SRC_PATH = `${path.resolve(__dirname, '../src')}`;
const DIST_PATH = path.resolve(__dirname, '../dist');
const BACKEND_DIST_PATH = path.resolve(DIST_PATH, `./${SYS_NAME}${(APP_TARGET === 'electron' ? '_electron' : '')}`);
const FRONTEND_DIST_PATH = path.resolve(BACKEND_DIST_PATH, './public');
const FAVICON = './public/favicon.ico';

async function backend() {
  console.log(`----------${SYS_TITLE}: Build Backend----------`);
  const dependencies = Object.keys(pkg.dependencies);

  const target = ((APP_TARGET === 'electron') ? 'electron-main' : 'node');
  const externals = ['electron'].concat(dependencies);
  const entry = [path.resolve(`./script/${XLSXMGR}${(APP_TARGET === 'electron') ? '_electron' : '_node'}_run.js`)];
  const output = {
    path: BACKEND_DIST_PATH,
    filename: 'index.js',
    publicPath: './',
    libraryTarget: 'commonjs2'
  };

  let ret = await WebpackConfig.backend({
    target,
    externals,
    mode: SYS_MODE,
    entry,
    output,
    plugins: [
      new webpack.EnvironmentPlugin({
        NODE_ENV: SYS_MODE,
        RENDER_FILE,
        ELECTRON_RENDER_FILE,
        SYS_NAME,
        SYS_VER: pkg.version || SYS_VER,
        AUTHOR: pkg.author || 'neilpipi1985'
      })
    ]
  });

  if (ret.error) {
    console.log('----------------------------------------');
    console.error(ret.error.stack || ret.error);
    if (ret.error.details) {
      console.error(ret.error.details);
    }
    console.log('----------------------------------------');

    return false;
  }
  console.log('----------------------------------------');
  console.log(ret.toString({ colors: true }));
  console.log('----------------------------------------');

  console.log('----------Start Copy Files----------');

  const pkgNew = Object.assign({}, {
    name: SYS_NAME,
    private: true,
    author: { name: 'neilpipi1985', email: 'neilpipi1985@gmail.com' },
    homepage: 'https://github.com/neilpipi1985/',
    version: pkg.version || SYS_VER,
    license: 'MIT',
    scripts: (APP_TARGET === 'electron') ? { start: 'electron index.js' } : { start: 'node index.js' },
    description: 'XLSX Converter',
    dependencies: pkg.dependencies
  });

  if (args.d && (APP_TARGET === 'electron')) {
    pkgNew.dependencies['electron'] = pkg.devDependencies.electron;
  }
  ret = await Utility.writeFile(`${BACKEND_DIST_PATH}/package.json`, `${JSON.stringify(pkgNew, null, 2)}\r\n`);

  console.log(`COPY File(package.json) ${(ret && ret.error) ? 'Fail' : 'Success'}\r\n`);

  return true;
}

async function frontend() {
  console.log(`----------${SYS_TITLE}: Build Frontend----------`);
  const target = 'web';
  const entry = ['babel-polyfill', path.resolve(SRC_PATH, `./render/${XLSXMGR}.js`)];
  const output = {
    path: FRONTEND_DIST_PATH,
    filename: `${XLSXMGR}.js`,
    publicPath: './',
    libraryTarget: 'var'
  };

  let ret = await WebpackConfig.frontend({
    target,
    mode: SYS_MODE,
    entry,
    output
  });

  if (ret.error) {
    console.log('----------Webpack Frontend Error----------');
    console.error(ret.error.stack || ret.error);
    if (ret.error.details) {
      console.error(ret.error.details);
    }
    console.log('----------------------------------------');

    return false;
  }
  console.log('----------------------------------------');
  console.log(ret.toString({ colors: true }));
  console.log('----------------------------------------');

  console.log('----------Start Copy Files----------');

  const faviconSrc = path.resolve(SRC_PATH, FAVICON);
  const faviconDist = path.resolve(FRONTEND_DIST_PATH, FAVICON);
  ret = await Utility.promisify(fse.copy)(faviconSrc, faviconDist);

  console.log(`COPY File(${faviconSrc}) ${(ret && ret.error) ? 'Fail' : 'Success'}\r\n`);

  console.log('----------------------------------------');

  return true;
}

async function frontendElectron() {
  console.log(`----------${SYS_TITLE}: Build Electron Frontend----------`);

  const target = ((APP_TARGET === 'electron') ? 'electron-renderer' : 'web');
  const entry = ['babel-polyfill', path.resolve(SRC_PATH, `./render/${ELECTRON_RENDER_FILE}`)];
  const output = {
    path: FRONTEND_DIST_PATH,
    filename: ELECTRON_RENDER_FILE,
    publicPath: './',
    libraryTarget: (APP_TARGET === 'electron' ? 'commonjs2' : 'var')
  };

  const ret = await WebpackConfig.frontend({
    target,
    mode: SYS_MODE,
    entry,
    output
  });

  if (ret.error) {
    console.log('----------------------------------------');
    console.error(ret.error.stack || ret.error);
    if (ret.error.details) {
      console.error(ret.error.details);
    }
    console.log('----------------------------------------');

    return false;
  }
  console.log('----------------------------------------');
  console.log(ret.toString({ colors: true }));
  console.log('----------------------------------------');

  return true;
}

async function run(dt = new Date()) {
  const name = XLSXMGR;
  let ret;
  try {
    ret = await backend();
  } catch (err) {
    ret = false;
    console.log(err.message);
  }
  if (!ret) {
    return ret;
  }

  try {
    ret = await frontend();
    console.log(`Building ${name} Frontend ${(ret) ? 'Success' : 'Fail'}`);
  } catch (err) {
    ret = false;
    console.log(`Building ${name} Frontend Fail(${err.message})`);
  }
  if (!ret) {
    return ret;
  }

  if (APP_TARGET === 'electron') {
    try {
      ret = await frontendElectron();
      console.log(`Building ${name} Frontend Electron ${(ret) ? 'Success' : 'Fail'}`);
    } catch (err) {
      ret = false;
      console.log(`Building ${name} Frontend Electron Fail(${err.message})`);
    }
    if (!ret) {
      return ret;
    }
  } else {
    // build native module
  }

  console.log(`TotalTime: ${(new Date() - dt)}ms`);
  return ret;
}

run();
