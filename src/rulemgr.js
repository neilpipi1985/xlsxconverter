const MathOperators = Object.freeze({
  Addition: (a = 0, b = 0) => { return (a + b); },
  Subtraction: (a = 0, b = 0) => { return (a - b); },
  Multiplication: (a = 0, b = 0) => { return (a * b); },
  Division: (a = 0, b = 0) => { return (a / b); },
  Remainder: (a = 0, b = 0) => { return (a % b); },
  Round: (a = 0, b = 0) => {
    const bPlus = (10 ** b);
    const v = (Math.round((a * bPlus)) / (bPlus));
    return v;
  }
});

const StrOperators = Object.freeze({
  substring: (a = '', param = []) => {
    if (param.length !== 2) {
      return a;
    }
    const regex = /[^\x00-\xff]/g;
    const index = param[0] || 0;
    const address = param[1] || a.length;

    const array = [];
    let match;
    const aStd = a;

    while (match = regex.exec(aStd)) {
      array.push(match.index);
    }
    const aLen = aStd.length + (array.length);

    if (index >= address || aLen < address) {
      return a;
    }

    let str = '';
    const maxLen = address - index;
    let len = 0;
    for (let i = 0; i < aStd.length; i += 1) {
      if (index <= i) {
        const w = array.find(item => item === i);
        len = (w !== undefined) ? (len + 2) : (len + 1);
        if (maxLen < len) {
          break;
        }
        str += aStd[i];
      }
    }

    return str;
  },
  replace: (a = '', param = []) => {
    let paramA = param[0];
    const paramB = param[1];
    if ((typeof paramA).toString() === 'object') {
      paramA = new RegExp(...paramA);
    }

    return a.replace(paramA, paramB);
  }
});

const RelationalOperators = Object.freeze({
  Equal: (a, b) => {
    if ((typeof a).toString() === 'number' && (typeof b).toString() === 'number') {
      return (a === b);
    }
    if ((typeof b).toString() === 'string') {
      return a === b;
    }

    const regex = new RegExp(...b);
    return regex.test(a);
  },
  NotEqual: (a = 0, b = 0) => {
    if ((typeof a).toString() === 'number' && (typeof b).toString() === 'number') {
      return (a !== b);
    }
    if ((typeof b).toString() === 'string') {
      return a !== b;
    }

    const regex = new RegExp(...b);
    return !(regex.test(a));
  },
  MoreThan: (a = 0, b = 0) => { return (a > b); },
  LessThan: (a = 0, b = 0) => { return (a < b); },
  MoreThanOrEqual: (a = 0, b = 0) => { return (a >= b); },
  LessThanOrEqual: (a = 0, b = 0) => { return (a <= b); }
});

function OperatorRule() {
  this.type = 'string'; // string/number/strLen
  this.operator = '';
  this.value = '';
}

function HeaderRule() {
  this.header = ''; // 匯出欄位名稱

  this.defaultVaule = ''; // 預設值(沒有參考欄位時填入/有參考欄位但是資料沒有欄位數值時填入)
  this.refHeaders = []; // 參考的匯入欄位(依序確認欄位值)
  this.isRequireValue = true; // 必須有資料欄位有值
  this.isDefaultValue = false; // 預設值會覆蓋原始資料值
  this.enableUserFixed = false; // 是否允許使用者於資料格式不符合時進行修正

  this.filterRules = [];
  this.operatorRules = [];

  this.subHeaderRules = []; // 組合式規則
}

function ConvertRule() {
  this.name = '';
  this.bookType = 'xlsx';
  this.enableMappingName = true;
  this.enableTimestamp = false;
  this.importHeaders = [];
  this.headerRules = [];
}

class RuleMgr {
  static get MathOperators() {
    return MathOperators;
  }

  static get StrOperators() {
    return StrOperators;
  }

  static get RelationalOperators() {
    return RelationalOperators;
  }

  static get OperatorRule() {
    return OperatorRule;
  }

  static get HeaderRule() {
    return HeaderRule;
  }

  static get ConvertRule() {
    return ConvertRule;
  }

  static isMatchRule(headers = [], rule = {}) {
    const headerRules = rule.headerRules || [];
    let enableRule = headerRules.length > 0;

    // 檢查是否有符合的規則
    for (let j = 0; j < headerRules.length; j += 1) {
      const headerRule = headerRules[j] || {};
      const refHeaders = headerRule.refHeaders || [];

      // 檢查是否有必要的欄位存在
      if (refHeaders.length > 0) {
        const refheader = refHeaders.find((header) => {
          return (headers.find((item) => {
            return (item === header);
          }));
        });

        enableRule = (refheader !== undefined);
        if (!enableRule) {
          break;
        }
      }
    }

    return enableRule;
  }

  static parserHeaderRule(headerRule = {}, json = {}, data = {}, index = 0) {
    let action = 'success';

    let dataHeaderValue;

    if (headerRule.refHeaders.length > 0) {
      const dataHeader = headerRule.refHeaders.find((item) => {
        return (data[item] !== undefined);
      });

      if (dataHeader === undefined && headerRule.isRequireValue) {
        if (!headerRule.enableUserFixed) {
          return 'fail';
        }
        action = 'check';
        json.isFixedData = false;
        json.orignalIndex = index;
        json.orignalData = data;
        json[headerRule.header] = {
          msg: 'Not Found Export Header'
        };
      } else {
        dataHeaderValue = data[dataHeader] || '';

        // 判斷原始值是否需要過濾
        const filterRules = headerRule.filterRules || [];
        for (let i = 0; i < filterRules.length; i += 1) {
          const filterRule = filterRules[i];
          if (RelationalOperators[filterRule.operator] !== undefined) {
            let isFilterValue = false;

            let tmpValue = dataHeaderValue;
            let tmpOptValue = filterRule.value;
            if (filterRule.type === 'number') {
              tmpValue = parseFloat(tmpValue, 10);
              tmpOptValue = parseFloat(tmpOptValue, 10);
            } else if (filterRule.type === 'stringLength') {
              tmpValue = tmpValue.replace(/[^\x00-\xff]/g, 'mm').length;
              tmpOptValue = parseFloat(tmpOptValue, 10);
            }

            isFilterValue = RelationalOperators[filterRule.operator](tmpValue, tmpOptValue);
            if (isFilterValue) {
              if (!headerRule.enableUserFixed) {
                return 'fail';
              }
              action = 'check';
              json.isFixedData = false;
              json.orignalIndex = index;
              json.orignalData = data;
              json[headerRule.header] = {
                msg: `To Match the Filter "${filterRule.operator}(${tmpOptValue})" Rule on the original Data(${dataHeaderValue || ''})`
              };
              break;
            }
          }
        }

        if (action === 'success') {
          if (headerRule.isDefaultValue) {
            dataHeaderValue = headerRule.defaultVaule || '';
          } else {
            dataHeaderValue = data[dataHeader] || headerRule.defaultVaule;
          }
          const operatorRules = headerRule.operatorRules || [];

          for (let i = 0; i < operatorRules.length; i += 1) {
            const operatorRule = operatorRules[i];

            if (operatorRule.type === 'number') {
              const tmpValue = MathOperators[operatorRule.operator](parseFloat(dataHeaderValue, 10), parseFloat(operatorRule.value, 10));
              dataHeaderValue = tmpValue;
            } else if (operatorRule.type === 'string') {
              dataHeaderValue = StrOperators[operatorRule.operator](dataHeaderValue, operatorRule.value);
            }
          }
        }
      }
    } else if (headerRule.isDefaultValue) {
      dataHeaderValue = headerRule.defaultVaule || ''; // 沒有對應任何匯入資料, 但是有預設值時帶入此值
    }

    if (action === 'success' && headerRule.subHeaderRules.length > 0) {
      dataHeaderValue = dataHeaderValue || '';
      const subHeaderRules = headerRule.subHeaderRules || [];
      for (let i = 0; i < subHeaderRules.length; i += 1) {
        const subJson = {};
        const tmpAction = RuleMgr.parserHeaderRule(subHeaderRules[i], subJson, data, index);
        if (tmpAction !== 'success') {
          action = tmpAction;
          break;
        }
        dataHeaderValue += subJson[headerRule.header];
      }
    }

    if (action === 'success' && dataHeaderValue !== undefined && dataHeaderValue !== '') {
      json[headerRule.header] = dataHeaderValue;
    }
    return action;
  }

  static transferData(dataList = [], rule = {}) {
    const list = {
      successList: [], // 成功轉換的資料列
      failList: [], // 失敗轉換的資料列
      checkList: [] // 由使用者決定轉換的資料列
    };

    const headerRules = rule.headerRules || [];


    dataList.forEach((data = {}, index = 0) => {
      const json = {};
      let action = (headerRules.length > 0) ? 'success' : '';
      for (let j = 0; j < headerRules.length; j += 1) {
        const headerRule = headerRules[j] || {};

        const tmpAction = RuleMgr.parserHeaderRule(headerRule, json, data, index);
        action = (action === '' || action === 'success' || tmpAction === 'fail') ? tmpAction : action;
        if (action === 'fail') {
          break;
        }
      }

      switch (action) {
        case 'success': {
          list.successList.push(json);
          break;
        }
        case 'check': {
          list.checkList.push(json);
          break;
        }
        case 'fail': {
          list.failList.push(data);
          break;
        }
        default: {
          console.log(`The ${index + 1}TH data is not process`);
          break;
        }
      }
    });

    return list;
  }
}

export default RuleMgr;
