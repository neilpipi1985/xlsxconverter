import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  withMobileDialog, Table, TableHead, TableCell, TableBody, TableRow, TableFooter, TablePagination,
  IconButton, Tooltip, Chip, Dialog, DialogContent, DialogActions, Button
} from '@material-ui/core';
import { Add } from '@material-ui/icons';

import DialogRuleMgr from '../dialogrulemgr';
import RuleMgr from '../../../rulemgr';

class DialogRuleSetting extends Component {
  static propTypes = {
    onClickCallback: PropTypes.func.isRequired,
    dialogState: PropTypes.object
  };

  static defaultProps = {
    dialogState: {}
  };

  constructor(props) {
    super(props);
    this.state = this.getNewState(props.dialogState);
  }

  componentDidUpdate(prevProps) {
    const {
      dialogState
    } = this.props;

    if (dialogState.data !== prevProps.dialogState.data || dialogState.size !== prevProps.dialogState.size) {
      const newState = this.getNewState(dialogState, prevProps.dialogState);
      this.refreshContext(newState);
    }
  }

  getNewState = (newProps = {}, oldProps = {}) => {
    const oldSize = oldProps.size || {};
    const size = newProps.size || {};
    const data = newProps.data || {};

    const newState = {};

    if (oldSize.width !== size.width || oldSize.height !== size.height) {
      const width = (size.width || 240);
      const height = (size.height || 240);
      const gridWidth = width - 10;
      const gridHeight = height - 10;
      const rowNum = Math.ceil((gridHeight - 180) / 60);

      Object.assign(newState, {
        rowNum,
        size,
        style: {
          width: `${width}px`,
          height: `${height}px`,
          margin: '0 auto',
          backgroundColor: 'transparent'
        },
        gridStyle: {
          position: 'relative',
          width: `${gridWidth}px`,
          height: `${gridHeight}px`,
          margin: '5px',
          textAlign: 'left',
          backgroundColor: 'white',
          overflow: 'auto'
        },
        barStyle: {
          position: 'relative',
          width: `${gridWidth - 10}px`,
          height: '48px',
          margin: 0,
          backgroundColor: 'transparent'
        },
        titleStyle: {
          fontWeight: 'bold',
          lineHeight: '48px',
          verticalAlign: 'middle',
          textAlign: 'center',
          float: 'left',
          position: 'relative',
          margin: '0 10px',
          height: '48px'
        },
        toolBtnStyle: {
          float: 'right',
          position: 'relative',
          margin: '4px 2px'
        }
      });
    }

    if (!this.state) {
      const rule = data.rule || {};
      const isSubHeaderRules = data.isSubHeaderRules || false;
      const headerRules = rule.headerRules || [];

      const tableRowList = headerRules.map((item, i) => { return this.getTableRow(item, i, isSubHeaderRules); });

      Object.assign(newState, {
        page: 0,
        dialogState: {
          type: '',
          data: {}
        },
        rule,
        isSubHeaderRules,
        name: rule.name || '',
        ruleIndex: (data.ruleIndex > -1) ? data.ruleIndex : -1,
        importHeaders: rule.importHeaders || [],
        headerRules,
        tableRowList
      });
    }

    return newState;
  }

  getTableRow = (headerRule = {}, headerRuleIndex = 0, isSubHeaderRules) => {
    return (
      <TableRow key={`${headerRule.header}${headerRuleIndex + 1}`}>
        <TableCell>
          <Chip label={headerRule.header} onClick={() => this.handleButtonClick({ action: 'editHeaderRuleInfo', headerRule, headerRuleIndex })} />
        </TableCell>
        <TableCell>{JSON.stringify(headerRule.refHeaders)}</TableCell>
        <TableCell>{headerRule.defaultVaule}</TableCell>
        <TableCell>{`${headerRule.isRequireValue ? 'YES' : 'NO'}/${headerRule.isDefaultValue ? 'YES' : 'NO'}/${headerRule.enableUserFixed ? 'YES' : 'NO'}`}</TableCell>
        <TableCell>
          {
            (headerRule.refHeaders.length > 0) ? (
              <Chip label={headerRule.filterRules.length} onClick={() => this.handleButtonClick({ action: 'editOperatorRules', headerRuleIndex, isFilterRules: true, header: headerRule.header, rules: headerRule.filterRules })} />
            ) : headerRule.filterRules.length
          }
        </TableCell>
        <TableCell>
          {
            (headerRule.refHeaders.length > 0) ? (
              <Chip label={headerRule.operatorRules.length} onClick={() => this.handleButtonClick({ action: 'editOperatorRules', headerRuleIndex, header: headerRule.header, rules: headerRule.operatorRules })} />
            ) : headerRule.operatorRules.length
          }
        </TableCell>
        {
          (!isSubHeaderRules) ? (
            <TableCell>
              <Chip label={headerRule.subHeaderRules.length} onClick={() => this.handleButtonClick({ action: 'editSubRules', headerRuleIndex, header: headerRule.header, subHeaderRules: headerRule.subHeaderRules })} />
            </TableCell>
          ) : undefined
        }
      </TableRow>
    );
  }

  refreshContext = (newState = {}) => {
    this.setState(newState);
  }

  handleButtonClick = async (opts = {}) => {
    const {
      onClickCallback
    } = this.props;
    const {
      size,
      isSubHeaderRules,
      ruleIndex,
      rule,
      name,
      headerRules,
      importHeaders
    } = this.state;

    switch (opts.action) {
      case 'close': {
        if (isSubHeaderRules) {
          onClickCallback({ action: 'refreshDialog', type: '', data: {} });
        } else {
          onClickCallback(opts);
        }
        break;
      }
      case 'refreshDialog': {
        this.setState({
          dialogState: {
            type: opts.type || '',
            data: opts.data || {}
          }
        });
        break;
      }
      case 'editHeaderRuleInfo': {
        this.setState({
          dialogState: {
            type: opts.action || '',
            data: {
              isSubHeaderRules,
              headerRuleIndex: opts.headerRuleIndex,
              headerRule: opts.headerRule,
              importHeaders
            }
          }
        });
        break;
      }
      case 'saveHeaderRuleInfo': {
        if (headerRules[opts.headerRuleIndex]) {
          Object.assign(headerRules[opts.headerRuleIndex], opts.headerRule);
          const newHeaderRules = [].concat(headerRules);
          const tableRowList = newHeaderRules.map((item, i) => { return this.getTableRow(item, i, isSubHeaderRules); });
          this.setState({
            dialogState: {
              type: '',
              data: {}
            },
            headerRules: newHeaderRules,
            tableRowList
          });
        }
        break;
      }
      case 'editOperatorRules': {
        this.setState({
          dialogState: {
            size: { width: size.width - 20, height: size.height - 20 },
            type: opts.action || '',
            data: {
              isFilterRules: opts.isFilterRules,
              headerRuleIndex: opts.headerRuleIndex,
              name: opts.header,
              rules: opts.rules
            }
          }
        });
        break;
      }
      case 'saveOperatorRules': {
        if (headerRules[opts.headerRuleIndex]) {
          const isFilterRules = opts.isFilterRules || false;
          const newHeaderRules = [].concat(headerRules);
          if (isFilterRules) {
            newHeaderRules[opts.headerRuleIndex].filterRules = opts.rules;
          } else {
            newHeaderRules[opts.headerRuleIndex].operatorRules = opts.rules;
          }
          const tableRowList = newHeaderRules.map((item, i) => { return this.getTableRow(item, i, isSubHeaderRules); });
          this.setState({
            dialogState: {
              type: '',
              data: {}
            },
            headerRules: newHeaderRules,
            tableRowList
          });
        }
        break;
      }
      case 'editSubRules': {
        this.setState({
          dialogState: {
            size: { width: size.width - 20, height: size.height - 20 },
            type: opts.action || '',
            data: {
              isSubHeaderRules: true,
              ruleIndex: opts.headerRuleIndex,
              rule: {
                name: opts.header,
                importHeaders,
                headerRules: opts.subHeaderRules
              }
            }
          }
        });
        break;
      }
      case 'delHeaderRule': {
        const headerRuleIndex = (opts.headerRuleIndex > -1) ? opts.headerRuleIndex : -1;
        let newHeaderRuleIndex = [];
        if (headerRuleIndex === 0) {
          newHeaderRuleIndex = [].concat(headerRules.slice(1));
        } else if (headerRuleIndex === headerRules.length - 1) {
          newHeaderRuleIndex = [].concat(headerRules.slice(0, -1));
        } else if (headerRuleIndex > 0) {
          newHeaderRuleIndex = [].concat(
            headerRules.slice(0, headerRuleIndex),
            headerRules.slice(headerRuleIndex + 1),
          );
        }
        const tableRowList = newHeaderRuleIndex.map((item, i) => { return this.getTableRow(item, i, isSubHeaderRules); });
        this.setState({
          dialogState: { type: '', data: {} },
          headerRules: newHeaderRuleIndex,
          tableRowList
        });
        break;
      }
      case 'addHeaderRule': {
        const subHeaderRules = [].concat(headerRules);
        subHeaderRules.push(Object.assign(new RuleMgr.HeaderRule(), { header: name }));
        const tableRowList = subHeaderRules.map((item, i) => { return this.getTableRow(item, i, isSubHeaderRules); });
        // 切換到最後一頁
        this.setState({
          headerRules: subHeaderRules,
          tableRowList
        });
        break;
      }
      case 'saveSubRuleHeaders': {
        if (isSubHeaderRules) {
          onClickCallback({
            action: opts.action,
            ruleIndex,
            name,
            subHeaderRules: headerRules
          });
        } else if (headerRules[opts.ruleIndex]) {
          Object.assign(headerRules[opts.ruleIndex], { subHeaderRules: opts.subHeaderRules });
          const newHeaderRules = [].concat(headerRules);
          const tableRowList = newHeaderRules.map((item, i) => { return this.getTableRow(item, i, isSubHeaderRules); });
          this.setState({
            dialogState: { type: '', data: {} },
            headerRules: newHeaderRules,
            tableRowList
          });
        }
        break;
      }
      case 'saveRule': {
        onClickCallback({
          action: opts.action,
          ruleIndex,
          name,
          rule: Object.assign({}, rule, { headerRules })
        });
        break;
      }
      default: {
        break;
      }
    }
  }

  render() {
    const {
      rowNum,
      page,
      barStyle,
      titleStyle,
      toolBtnStyle,
      tableRowList,
      disableBtn,
      isSubHeaderRules,
      name,
      dialogState
    } = this.state;

    const tableShowList = tableRowList.slice(page * rowNum, (page * rowNum) + rowNum);
    const emptyRows = rowNum - tableShowList.length;

    return (
      <Dialog open fullScreen>
        <DialogContent>
          <div style={barStyle}>
            <div style={titleStyle}>{`${isSubHeaderRules ? 'Sub' : ''}Header Rules of "${name || ''}"`}</div>
            <div style={toolBtnStyle}>
              {
                (isSubHeaderRules) ? (
                  <Tooltip title="Add Sub Header Rule">
                    <IconButton aria-label="Edit" disabled={disableBtn} onClick={() => this.handleButtonClick({ action: 'addHeaderRule' })}>
                      <Add />
                    </IconButton>
                  </Tooltip>
                ) : undefined
              }
            </div>
          </div>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Export Headers</TableCell>
                <TableCell>Ref. Headers</TableCell>
                <TableCell>Default</TableCell>
                <TableCell>Require/Default/Check</TableCell>
                <TableCell>Filters</TableCell>
                <TableCell>Operators</TableCell>
                {
                  (!isSubHeaderRules) ? (
                    <TableCell>Sub Rules</TableCell>
                  ) : undefined
                }
              </TableRow>
            </TableHead>
            <TableBody>
              {tableShowList}
              {emptyRows > 0 && (
                <TableRow style={{ height: 55 * emptyRows }}>
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TablePagination
                  colSpan={6}
                  count={tableRowList.length}
                  rowsPerPage={rowNum}
                  page={page}
                  backIconButtonProps={{ 'aria-label': 'Previous Page', }}
                  nextIconButtonProps={{ 'aria-label': 'Next Page', }}
                  onChangePage={(event, num) => this.setState({ page: num })}
                  rowsPerPageOptions={[]}
                />
              </TableRow>
            </TableFooter>
          </Table>
        </DialogContent>
        <DialogActions>
          <Button disabled={disableBtn} onClick={() => this.handleButtonClick({ action: 'close' })} color="secondary">Cancel</Button>
          <Button disabled={disableBtn} onClick={() => this.handleButtonClick({ action: isSubHeaderRules ? 'saveSubRuleHeaders' : 'saveRule' })} color="primary" autoFocus>Confirm</Button>
        </DialogActions>
        <DialogRuleMgr dialogState={dialogState} onClickCallback={this.handleButtonClick} />
      </Dialog>
    );
  }
}

export default withMobileDialog()(DialogRuleSetting);
