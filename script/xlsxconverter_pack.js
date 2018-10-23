import path from 'path';

import minimist from 'minimist';

const electronBuilder = require('electron-builder');

const pkg = require('../package.json');

const args = minimist(process.argv.slice(2));

const XLSXMGR = 'xlsxconverter';
const SYS_NAME = args.sysname || XLSXMGR;
const SYS_TITLE = 'XLSX Converter';

const APP_TARGET = 'electron';

const SRC_PATH = `${path.resolve(__dirname, '../src')}`;
const DIST_PATH = path.resolve(__dirname, '../dist');
const BACKEND_DIST_PATH = path.resolve(DIST_PATH, `./${SYS_NAME}${(APP_TARGET === 'electron' ? '_electron' : '')}`);

async function installElectron() {
  console.log(`----------${SYS_TITLE}: Electron Builder----------`);

  const config = {
    appId: `me.neilpipi1985.${SYS_NAME}`,
    productName: XLSXMGR,
    buildVersion: pkg.version,
    electronVersion: pkg.devDependencies.electron.replace('^', ''),
    copyright: 'Copyright (C) 2018 neilpipi1985, All Rights Reserved.',
    asar: false,
    directories: {
      app: BACKEND_DIST_PATH,
      output: path.resolve(DIST_PATH, `./${SYS_NAME}_dist`)
    },
    win: {
      icon: path.resolve(SRC_PATH, './icon/logo.ico')
    },
    mac: {
      target: 'dmg',
      icon: path.resolve(SRC_PATH, './icon/logo.icns')
    },
    linux: {
      target: [{
        target: 'tar.gz',
        arch: ['arm64', 'armv7l']
      }],
      icon: path.resolve(SRC_PATH, './icon/logo.ico')
    },
    nsis: {
      oneClick: false,
      perMachine: true,
      allowToChangeInstallationDirectory: true,
      installerIcon: path.resolve(SRC_PATH, './icon/install.ico'),
      uninstallerIcon: path.resolve(SRC_PATH, './icon/logo.ico')
    }
  };
  // if (os.platform() === 'win32') {
  //   config.electronDownload = { arch: 'ia32', platform: 'win32' };
  // } else if (os.platform() === 'linux' && DEVICE === 'rpi3') {
  //   config.electronDownload = { arch: 'arm', platform: 'linux' };
  // }
  const ret = await (electronBuilder.build)({ config });

  console.log('----------------------------------------');
  console.log(ret.toString({ colors: true }));
  console.log('----------------------------------------');
}


async function run(dt = new Date()) {
  try {
    await installElectron();
  } catch (err) {
    console.log(err);
  }

  console.log(`TotalTime: ${(new Date() - dt)}ms`);
}

run();
