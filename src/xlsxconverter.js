import path from 'path';

import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import Static from 'koa-static';
import Router from 'koa-router';

import XlsxMgr from './xlsxmgr';
import RuleMgr from './rulemgr';
import SocketMgr from './socketmgr';
import Utility from './utility';

const WEB_RES_PATH = path.resolve(__dirname, './public');

const webApp = new Koa();

let appPath;
let settingFile;
const setting = {
  distPath: '',
  logPath: '',
  enableWebService: false,
  enableWebPwd: false,
  webPwd: '',
  webOpts: { port: 3000 }
};
let rulesFile;
const rules = { list: [] };

class XlsxConverter {
  static get webApp() {
    return webApp;
  }

  static get SocketMgr() {
    return SocketMgr;
  }

  static get distPath() {
    return (setting.distPath !== '') ? setting.distPath : appPath;
  }

  static render(script = '') {
    return Utility.render(script, {}, 'XLSX Converter');
  }

  static async saveWindowImage(opts = {}) {
    if (opts.file) {
      const logPath = (setting.distPath !== '') ? setting.distPath : appPath;
      await Utility.writeFile(path.resolve(logPath, `./${Utility.toDateTimeString(opts.dateTime)}${opts.ext || '.txt'}`), opts.file);
    }
  }

  static async initApp(opts = {}) {
    // 初始化路徑或是讀取設定檔
    if (opts.enableDevMode) {
      appPath = path.resolve('./dev');
      setting.distPath = path.resolve('./dev');
    } else {
      appPath = path.resolve(opts.appPath || './');
    }
    await Utility.createFolder(appPath);

    settingFile = path.resolve(appPath, './setting.json');
    if (Utility.existFile(settingFile)) {
      const json = await Utility.readJSONFile(settingFile);
      if (json.error) {
        console.log(json.error);
      } else {
        Object.assign(setting, json);
      }
    }

    rulesFile = path.resolve(appPath, './rules.json');
    if (Utility.existFile(rulesFile)) {
      const json = await Utility.readJSONFile(rulesFile);
      if (json.error) {
        console.log(json.error);
      } else {
        Object.assign(rules, json);
      }
    }

    if (opts.enableDevMode || setting.enableWebService) {
      await XlsxConverter.initWebService(setting.webOpts);
    }
  }

  static async initWebService(opts = {}) {
    const router = new Router();
    router.get('/', async (ctx = {}) => {
      ctx.type = 'text/html';
      ctx.body = XlsxConverter.render(process.env.RENDER_FILE);
    });

    XlsxConverter.webApp.use(Static(WEB_RES_PATH));
    XlsxConverter.webApp.use(bodyParser());
    XlsxConverter.webApp.use(router.routes());

    // 運行Web Service
    const port = opts.port || 3000;
    const serv = XlsxConverter.webApp.listen(port, (err) => {
      if (err) {
        console.log(`Web Service Error${err}`);
      } else {
        console.log(`Web Service listening on port(${port})`);

        const webSocket = SocketMgr.SocketIO(serv, { path: '/api/socket' });

        SocketMgr.on(webSocket, 'connection', (socket) => {
          XlsxConverter.injectSocketEvent(socket);
        });

        SocketMgr.addSocket('web', webSocket);
      }
    });

    return true;
  }

  static injectSocketEvent(socket) {
    SocketMgr.on(socket, 'disconnect', () => {
      console.log('Socket Disconnect');
    });

    SocketMgr.on(socket, 'initRenderState', async (...para) => {
      const obj = SocketMgr.getSocketPara(para, socket);
      const opts = obj.opts || {};

      SocketMgr.send(obj, 'refreshPanel', {
        type: 'goDashboard',
        data: { slotReportList: XlsxConverter.slotReportList }
      });

      if (opts.isWindowsRender) {
        if (setting.distPath === '') {
          SocketMgr.send(obj, 'refreshDialog', {
            type: 'getSysSetting',
            data: setting
          });
        }
      } else if (!opts.isWindowsRender && setting.enableWebPwd) {
        SocketMgr.send(obj, 'refreshDialog', {
          type: 'login',
          data: {}
        });
      }
    });

    SocketMgr.on(socket, 'getAppInfo', async (...para) => {
      const obj = SocketMgr.getSocketPara(para, socket);

      SocketMgr.send(obj, 'refreshDialog', {
        type: 'appInfo',
        data: { name: process.env.SYS_NAME, version: process.env.SYS_VER, author: process.env.AUTHOR }
      });
    });

    SocketMgr.on(socket, 'login', async (...para) => {
      const obj = SocketMgr.getSocketPara(para, socket);
      const opts = obj.opts || {};

      if (setting.webPwd === opts.password) {
        SocketMgr.send(obj, 'refreshDialog', {
          type: '',
          data: {}
        });
      } else {
        SocketMgr.send(obj, 'refreshDialog', {
          type: 'login',
          data: { error: 'Password Error' }
        });
      }
    });

    SocketMgr.on(socket, 'getSysSetting', async (...para) => {
      const obj = SocketMgr.getSocketPara(para, socket);

      SocketMgr.send(obj, 'refreshDialog', {
        type: 'getSysSetting',
        data: setting
      });
    });

    SocketMgr.on(socket, 'setSysSetting', async (...para) => {
      const obj = SocketMgr.getSocketPara(para, socket);
      const opts = obj.opts || {};

      Object.assign(setting, opts.setting || {});

      const ret = await Utility.writeFile(settingFile, JSON.stringify(setting, null, 2));
      if (ret.error) {
        SocketMgr.send(obj, 'refreshDialog', {
          type: 'alert', data: { title: 'System Setting Fail', message: `Error Message: ${ret.error}` }
        });
      } else {
        SocketMgr.send(obj, 'refreshDialog', { type: '', data: {} });
        SocketMgr.send(obj, 'refreshSnackbar', { open: true, message: 'Success: To Change System Setting' });
      }
    });

    SocketMgr.on(socket, 'goRules', async (...para) => {
      const obj = SocketMgr.getSocketPara(para, socket);

      SocketMgr.send(obj, 'refreshPanel', {
        type: 'goRules',
        data: rules
      });
    });

    SocketMgr.on(socket, 'uploadRules', async (...para) => {
      const obj = SocketMgr.getSocketPara(para, socket);
      const opts = obj.opts || {};

      try {
        if (
          opts.ruleFileObj && opts.ruleFileObj.content && /;base64/.test(opts.ruleFileObj.content)
        ) {
          const str = Buffer.from((opts.ruleFileObj.content.split(',')[1]), 'base64').toString();
          const tmpRules = JSON.parse(str);

          Object.assign(rules, tmpRules);
          await Utility.writeFile(rulesFile, JSON.stringify(rules, null, 2));

          SocketMgr.send(obj, 'refreshPanel', {
            type: 'goRules',
            data: rules
          });

          SocketMgr.send(obj, 'refreshDialog', { type: '', data: {} });
          SocketMgr.send(obj, 'refreshSnackbar', { open: true, message: 'Success: To Upload Rules' });
        } else {
          SocketMgr.send(obj, 'refreshDialog', {
            type: 'alert', data: { title: 'To Upload Rules Fail', message: 'File Format Error' }
          });
        }
      } catch (err) {
        SocketMgr.send(obj, 'refreshDialog', {
          type: 'alert', data: { title: 'To Upload Rules Fail', message: `Error Message: ${err.message}` }
        });
      }
    });

    SocketMgr.on(socket, 'downloadRules', async (...para) => {
      const obj = SocketMgr.getSocketPara(para, socket);

      SocketMgr.send(obj, 'saveFiles', { files: [{ key: 'rules.json', value: JSON.stringify(rules, null, 2) }] });
    });

    SocketMgr.on(socket, 'saveRule', async (...para) => {
      const obj = SocketMgr.getSocketPara(para, socket);
      const opts = obj.opts || {};

      const rule = opts.rule || {};
      const ruleIndex = rules.list.findIndex((item) => { return (item.name === opts.name); });
      if (ruleIndex === opts.ruleIndex) {
        if (ruleIndex > -1) {
          Object.assign(rules.list[ruleIndex], rule);
        } else {
          rules.list.push(rule);
        }
        await Utility.writeFile(rulesFile, JSON.stringify(rules, null, 2));
        SocketMgr.send(obj, 'refreshPanel', { type: 'goRules', data: rules });
        SocketMgr.send(obj, 'refreshDialog', { type: '', data: {} });
        SocketMgr.send(obj, 'refreshSnackbar', { open: true, message: `Success: To ${(ruleIndex > -1) ? 'Update' : 'Create'} "${rule.name}" Rule` });
      } else {
        SocketMgr.send(obj, 'refreshDialog', {
          type: 'alert', data: { title: 'To Update Rule Fail', message: `Not found Rule of "${opts.name}"` }
        });
      }
    });

    SocketMgr.on(socket, 'delRule', async (...para) => {
      const obj = SocketMgr.getSocketPara(para, socket);
      const opts = obj.opts || {};

      const ruleIndex = opts.ruleIndex;
      const rule = rules.list[opts.ruleIndex];
      if (rule) {
        if (ruleIndex === 0) {
          rules.list = [].concat(rules.list.slice(1));
        } else if (ruleIndex === rules.list.length - 1) {
          rules.list = [].concat(rules.list.slice(0, -1));
        } else if (ruleIndex > 0) {
          rules.list = [].concat(
            rules.list.slice(0, ruleIndex),
            rules.list.slice(ruleIndex + 1),
          );
        }
        await Utility.writeFile(rulesFile, JSON.stringify(rules, null, 2));

        SocketMgr.send(obj, 'refreshPanel', {
          type: 'goRules',
          data: rules
        });
        SocketMgr.send(obj, 'refreshDialog', { type: '', data: {} });
        SocketMgr.send(obj, 'refreshSnackbar', { open: true, message: `Success: To Remove "${opts.name}" Rule` });
      } else {
        SocketMgr.send(obj, 'refreshDialog', {
          type: 'alert', data: { title: 'To Remove Rule Fail', message: `Not found Rule of "${opts.name}"` }
        });
      }
    });

    SocketMgr.on(socket, 'getConvertFileSetting', async (...para) => {
      const obj = SocketMgr.getSocketPara(para, socket);

      const tmpRules = rules.list || [];
      if (tmpRules.length > 0) {
        SocketMgr.send(obj, 'refreshDialog', {
          type: 'getConvertFileSetting', data: { rules: tmpRules.map((item) => { return item.name; }) }
        });
      } else {
        SocketMgr.send(obj, 'refreshDialog', {
          type: 'alert', data: { title: 'Not Found Any Rules', message: 'Please To Add Rule First' }
        });
      }
    });

    SocketMgr.on(socket, 'convertFile', async (...para) => {
      const obj = SocketMgr.getSocketPara(para, socket);
      const opts = obj.opts || {};

      try {
        let rule;

        const importHeaders = opts.importHeaders || [];
        if (opts.ruleName !== '') {
          rule = (rules.list || []).find((item) => {
            return (opts.ruleName === item.name) && RuleMgr.isMatchRule(importHeaders, item);
          });
        } else {
          rule = (rules.list || []).find((item) => {
            return RuleMgr.isMatchRule(importHeaders, item);
          });
        }

        if (rule) {
          const fileName = rule.enableMappingName ? opts.fileName : rule.name;
          const sheetName = rule.enableMappingName ? opts.sheetName : 'Success';
          const dataList = opts.dataList || [];

          const result = RuleMgr.transferData(dataList, rule);

          if (result.checkList.length > 0) {
            SocketMgr.send(obj, 'refreshDialog', { type: 'fixDataList', data: { result, importHeaders, rule, fileName, sheetName } });
          } else {
            const dt = new Date();
            let str = `${dt.getFullYear()}${(dt.getMonth() + 1).toString().padStart(2, 0)}${dt.getDate().toString().padStart(2, 0)}`;
            str += `${dt.getHours().toString().padStart(2, 0)}${dt.getMinutes().toString().padStart(2, 0)}${dt.getSeconds().toString().padStart(2, 0)}`;

            const workBook = XlsxMgr.newWorkBook;
            const exportHeaders = rule.headerRules.map((item) => { return item.header; });
            XlsxMgr.transferDataToWorkbook(workBook, sheetName, result.successList, { header: exportHeaders });
            XlsxMgr.transferDataToWorkbook(workBook, 'Fail', result.failList, { header: importHeaders });

            const bookType = rule.bookType || 'xlsx';
            const file = `${fileName}${rule.enableTimestamp ? `_${str}` : ''}.${bookType}`;

            if (setting.distPath !== '') {
              const content = XlsxMgr.write(workBook, { type: 'buffer', bookType, bookSST: false });
              const filePath = path.resolve(setting.distPath, file);
              await Utility.writeFile(filePath, content);
            }

            if (!opts.isWindowsRender) {
              SocketMgr.send(obj, 'saveFiles', { files: [{ key: file, value: XlsxMgr.write(workBook) }] });
            }
            SocketMgr.send(obj, 'refreshDialog', { type: '', data: {} });
            SocketMgr.send(obj, 'refreshSnackbar', { open: true, message: 'Success' });
          }
        } else {
          SocketMgr.send(obj, 'refreshDialog', {
            type: 'alert', data: { title: 'To Convert Error', message: 'Not Found Match Rule' }
          });
        }
      } catch (err) {
        SocketMgr.send(obj, 'refreshDialog', {
          type: 'alert', data: { title: 'To Convert Error', message: `Error Message: ${err.message}` }
        });
      }
    });


    SocketMgr.on(socket, 'saveFixedDataList', async (...para) => {
      const obj = SocketMgr.getSocketPara(para, socket);
      const opts = obj.opts || {};

      try {
        const rule = opts.rule;

        const importHeaders = opts.importHeaders || [];

        if (rule) {
          const fileName = rule.enableMappingName ? opts.fileName : rule.name;
          const sheetName = rule.enableMappingName ? opts.sheetName : 'Success';
          const result = opts.result;

          const dt = new Date();
          let str = `${dt.getFullYear()}${(dt.getMonth() + 1).toString().padStart(2, 0)}${dt.getDate().toString().padStart(2, 0)}`;
          str += `${dt.getHours().toString().padStart(2, 0)}${dt.getMinutes().toString().padStart(2, 0)}${dt.getSeconds().toString().padStart(2, 0)}`;

          const workBook = XlsxMgr.newWorkBook;
          const exportHeaders = rule.headerRules.map((item) => { return item.header; });
          XlsxMgr.transferDataToWorkbook(workBook, sheetName, result.successList, { header: exportHeaders });
          XlsxMgr.transferDataToWorkbook(workBook, 'Fail', result.failList, { header: importHeaders });

          const bookType = rule.bookType || 'xlsx';
          const file = `${fileName}${rule.enableTimestamp ? `_${str}` : ''}.${bookType}`;

          if (setting.distPath !== '') {
            const content = XlsxMgr.write(workBook, { type: 'buffer', bookType, bookSST: false });
            const filePath = path.resolve(setting.distPath, file);
            await Utility.writeFile(filePath, content);
          }

          if (!opts.isWindowsRender) {
            SocketMgr.send(obj, 'saveFiles', { files: [{ key: file, value: XlsxMgr.write(workBook) }] });
          }
          SocketMgr.send(obj, 'refreshDialog', { type: '', data: {} });
          SocketMgr.send(obj, 'refreshSnackbar', { open: true, message: 'Success' });
        } else {
          SocketMgr.send(obj, 'refreshDialog', {
            type: 'alert', data: { title: 'To Convert Error', message: 'Not Found Rule' }
          });
        }
      } catch (err) {
        SocketMgr.send(obj, 'refreshDialog', {
          type: 'alert', data: { title: 'To Convert Error', message: `Error Message: ${err.message}` }
        });
      }
    });
  }
}

export default XlsxConverter;
