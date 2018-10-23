import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  withMobileDialog, Table, TableHead, TableCell, TableBody, TableRow, TableFooter, TablePagination,
  IconButton, Tooltip, Dialog, DialogContent, DialogActions, Button
} from '@material-ui/core';
import { Add, Edit } from '@material-ui/icons';
import { withStyles } from '@material-ui/core/styles';

import DialogRuleMgr from './index';

const styles = ({
  formControl: {
    minWidth: 120,
  }
});

class DialogOperatorRules extends Component {
  static propTypes = {
    classes: PropTypes.object.isRequired,
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

    if (dialogState.data !== prevProps.dialogState.data) {
      const newState = this.getNewState(dialogState);
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
      const rules = data.rules || [];
      const isFilterRules = data.isFilterRules || false;

      const tableRowList = rules.map((item, i) => { return this.getTableRow(item, i); });

      Object.assign(newState, {
        page: 0,
        dialogState: {
          type: '',
          data: {}
        },
        rules,
        isFilterRules,
        name: data.name || '',
        headerRuleIndex: (data.headerRuleIndex > -1) ? data.headerRuleIndex : -1,
        tableRowList
      });
    }

    return newState;
  }

  getTableRow = (rule = {}, ruleIndex = 0) => {
    const isObject = ((typeof rule.value).toString() === 'object');
    return (
      <TableRow key={`rule${ruleIndex}`}>
        <TableCell>
          <Tooltip title="Edit Rule">
            <IconButton aria-label="Edit" onClick={() => this.handleButtonClick({ action: 'editRule', data: { ruleIndex, rule } })}>
              <Edit />
            </IconButton>
          </Tooltip>
        </TableCell>
        <TableCell>{rule.type}</TableCell>
        <TableCell>{rule.operator}</TableCell>
        <TableCell>{isObject ? 'YES' : 'NO'}</TableCell>
        <TableCell>{isObject ? JSON.stringify(rule.value) : rule.value}</TableCell>
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
      isFilterRules,
      name,
      headerRuleIndex,
      rules
    } = this.state;

    switch (opts.action) {
      case 'close': {
        onClickCallback({ action: 'refreshDialog', type: '', data: {} });
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
      case 'editRule': {
        this.setState({
          dialogState: {
            type: 'editOperatorRule',
            data: Object.assign({ name, isFilterRules }, opts.data || {})
          }
        });
        break;
      }
      case 'delRule': {
        const ruleIndex = (opts.ruleIndex > -1) ? opts.ruleIndex : -1;
        let newRules = [];
        if (ruleIndex === 0) {
          newRules = [].concat(rules.slice(1));
        } else if (ruleIndex === rules.length - 1) {
          newRules = [].concat(rules.slice(0, -1));
        } else if (ruleIndex > 0) {
          newRules = [].concat(
            rules.slice(0, ruleIndex),
            rules.slice(ruleIndex + 1),
          );
        }
        const tableRowList = newRules.map((item, i) => { return this.getTableRow(item, i); });
        this.setState({
          dialogState: {
            type: '',
            data: {}
          },
          rules: newRules,
          tableRowList
        });
        break;
      }
      case 'saveRule': {
        const ruleIndex = (opts.ruleIndex > -1) ? opts.ruleIndex : -1;
        if (ruleIndex === -1) {
          const newRules = [].concat(rules);
          newRules.push(opts.rule || {});
          const tableRowList = newRules.map((item, i) => { return this.getTableRow(item, i); });
          this.setState({
            dialogState: {
              type: '',
              data: {}
            },
            rules: newRules,
            tableRowList
          });
        } else if (rules[ruleIndex] !== undefined) {
          rules[ruleIndex] = opts.rule || {};
          const newRules = [].concat(rules);
          const tableRowList = newRules.map((item, i) => { return this.getTableRow(item, i); });

          this.setState({
            dialogState: {
              type: '',
              data: {}
            },
            rules: newRules,
            tableRowList
          });
        }
        break;
      }
      case 'saveOperatorRules': {
        onClickCallback({
          action: opts.action,
          isFilterRules,
          headerRuleIndex,
          rules
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
      isFilterRules,
      name,
      dialogState
    } = this.state;

    const tableShowList = tableRowList.slice(page * rowNum, (page * rowNum) + rowNum);
    const emptyRows = rowNum - tableShowList.length;

    return (
      <Dialog open fullScreen aria-labelledby="alert-dialog-title">
        <DialogContent>
          <div style={barStyle}>
            <div style={titleStyle}>{`${isFilterRules ? 'Filter' : 'Operator'} Rules of "${name || ''}"`}</div>
            <div style={toolBtnStyle}>
              <Tooltip title="Add Rule">
                <IconButton aria-label="Edit" disabled={disableBtn} onClick={() => this.handleButtonClick({ action: 'editRule', ruleIndex: -1, rule: {} })}>
                  <Add />
                </IconButton>
              </Tooltip>
            </div>
          </div>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Edit</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Operators</TableCell>
                <TableCell>Object Value</TableCell>
                <TableCell>Value</TableCell>
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
          <Button disabled={disableBtn} onClick={() => this.handleButtonClick({ action: 'saveOperatorRules' })} color="primary" autoFocus>Confirm</Button>
        </DialogActions>
        <DialogRuleMgr dialogState={dialogState} onClickCallback={this.handleButtonClick} />
      </Dialog>
    );
  }
}

export default withMobileDialog()(withStyles(styles)(DialogOperatorRules));
