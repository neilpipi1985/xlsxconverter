import fs from 'fs';
import util from 'util';

const WEB_PAGE_DEFAULT_CONTENT = `
<div style="background-color:#90CAF9;position:absolute;top:0;right:0;bottom:0;left:0;">
  <div style="font-size:32px;text-align:center;height:150px;line-height:150px;">Loading...</div>
</div>
`;

class Utility {
  static render(appPath = '', optsState = {}, title = '', content = WEB_PAGE_DEFAULT_CONTENT) {
    return `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
          <title>${title}</title>
        </head>
        <body>
          <!--[if IE]><div>Unfortunately, you are using Internet Explorer, which is obsolete...</div><![endif]-->
          <!--[if !IE]-->
            <div id="app">${content}</div>
            <script>
              window.__PRELOADED_STATE__ = ${JSON.stringify(optsState).replace(/</g, '\\u003c')}
            </script>
            <script src="${appPath}"></script>
          <!--[endif]-->
        </body>
      </html>
    `;
  }

  static promisify(func) {
    try {
      return util.promisify(func);
    } catch (err) {
      return { error: err.message };
    }
  }

  static existFile(file = '') {
    return fs.existsSync(file);
  }

  static existFolder(directory = '') {
    return Utility.promisify(fs.stat)(directory);
  }

  static async createFolder(directory = '') {
    try {
      const isExist = await Utility.existFolder(directory);
      if (!isExist) {
        return Utility.promisify(fs.mkdir)(directory);
      }
    } catch (err) {
      return Utility.promisify(fs.mkdir)(directory);
    }
    return { state: 'Folder Exist' };
  }

  static appendFile(file = '', content) {
    return new Promise((resolve) => {
      fs.appendFile(file, content, (err) => {
        if (err) {
          return resolve({ error: (err.message) ? err.message : err });
        }
        return resolve('Success');
      });
    });
  }

  static async removeFile(file = '') {
    try {
      let val = await Utility.promisify(fs.stat)(file);

      if (!val.error) {
        val = await Utility.promisify(fs.unlink)(file);
      } else if (val.data && val.data.isFile()) {
        val = await Utility.promisify(fs.unlink)(file);
      }
      return val;
    } catch (err) {
      return { error: err.message };
    }
  }

  static writeFile(file = '', content) {
    return new Promise((resolve) => {
      fs.writeFile(file, content, (err) => {
        if (err) {
          return resolve({ error: (err.message) ? err.message : err });
        }
        return resolve('Success');
      });
    });
  }

  static async readFile(file = '', format = 'utf8') {
    try {
      const val = await Utility.promisify(fs.readFile)(file, format);
      if (val.error) return { error: val.error.message };
      return val;
    } catch (err) {
      return { error: err.message };
    }
  }

  static async readJSONFile(file = '') {
    const val = await Utility.readFile(file);
    if (val.error) return val;
    try {
      return JSON.parse(val);
    } catch (err) {
      return { error: err.message };
    }
  }
}

export default Utility;
