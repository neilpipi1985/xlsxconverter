import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  withMobileDialog, Table, TableHead, TableCell, TableBody, TableRow, TableFooter, TablePagination,
  IconButton, Tooltip, Dialog, DialogContent, DialogActions, Button
} from '@material-ui/core';
import { Edit } from '@material-ui/icons';

import DialogRuleMgr from '../dialogrulemgr';

class DialogFixDataList extends Component {
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

    const newState = {
      isWindowsRender: newProps.isWindowsRender || false
    };

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
      const result = data.result || {};
      const fileName = data.fileName || '';
      const sheetName = data.sheetName || '';
      const exportHeaders = rule.headerRules.map((item) => { return item.header; });
      const tableRowHeaderList = (
        <TableRow>
          <TableCell key="headers0">Edit</TableCell>
          <TableCell key="headers01">Convert</TableCell>
          {exportHeaders.map((item, i) => { return (<TableCell key={`headers${i + 1}`}>{item}</TableCell>); })}
        </TableRow>
      );
      const dataList = result.checkList || [];
      const tableRowList = dataList.map((item, i) => { return this.getTableRow(item, i, exportHeaders); });

      Object.assign(newState, {
        page: 0,
        dialogState: {
          type: '',
          data: {}
        },
        exportHeaders,
        fileName,
        sheetName,
        result,
        rule,
        importHeaders: data.importHeaders || [],
        tableRowHeaderList,
        dataList,
        tableRowList
      });
    }

    return newState;
  }

  getTableRow = (data = {}, dataIndex = 0, exportHeaders = []) => {
    return (
      <TableRow key={`${dataIndex + 1}`}>
        <TableCell key={`data${dataIndex}_0`}>
          <Tooltip title="Edit Rule">
            <IconButton aria-label="Edit" onClick={() => this.handleButtonClick({ action: 'editFixedData', dataIndex, data })}>
              <Edit />
            </IconButton>
          </Tooltip>
        </TableCell>
        <TableCell key={`data${dataIndex}_01`}>{data.isFixedData ? 'YES' : 'NO' }</TableCell>
        {exportHeaders.map((item, i) => {
          if (data[item] === undefined) {
            return <TableCell key={`data${dataIndex}_${i + 1}`} />;
          }
          if ((typeof data[item]).toString() === 'object') {
            return <TableCell key={`data${dataIndex}_${i + 1}`}>{JSON.stringify(data[item])}</TableCell>;
          }
          return <TableCell key={`data${dataIndex}_${i + 1}`}>{data[item]}</TableCell>;
        })}
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
      isWindowsRender,
      fileName,
      sheetName,
      dataList,
      result,
      rule,
      importHeaders,
      exportHeaders
    } = this.state;

    switch (opts.action) {
      case 'refreshDialog': {
        this.setState({
          dialogState: {
            type: opts.type || '',
            data: opts.data || {}
          }
        });
        break;
      }
      case 'saveFixedData': {
        if (dataList[opts.dataIndex]) {
          const newDataList = [].concat(dataList);
          newDataList[opts.dataIndex] = opts.data;
          const tableRowList = newDataList.map((item, i) => { return this.getTableRow(item, i, exportHeaders); });
          this.setState({
            dialogState: {
              type: '',
              data: {}
            },
            dataList: newDataList,
            tableRowList
          });
        }
        break;
      }
      case 'editFixedData': {
        this.setState({
          dialogState: {
            type: opts.action || '',
            data: {
              exportHeaders,
              dataIndex: opts.dataIndex,
              data: opts.data
            }
          }
        });
        break;
      }
      case 'saveFixedDataList': {
        const newResult = {
          successList: result.successList || [],
          failList: result.failList || []
        };
        for (let i = 0; i < dataList.length; i += 1) {
          if (!dataList[i].isFixedData) {
            newResult.failList.push(dataList[i].orignalData);
          } else {
            exportHeaders.forEach((item) => {
              if (dataList[i][item] !== undefined) {
                if ((typeof (dataList[i][item])).toString() === 'object') {
                  dataList[i][item] = dataList[i][item].msg || '';
                }
              }
            });
            newResult.successList.push(dataList[i]);
          }
        }
        onClickCallback({
          isWindowsRender,
          action: opts.action,
          fileName,
          sheetName,
          result: newResult,
          rule,
          importHeaders
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
      tableRowHeaderList,
      tableRowList,
      disableBtn,
      dialogState
    } = this.state;

    const tableShowList = tableRowList.slice(page * rowNum, (page * rowNum) + rowNum);
    const emptyRows = rowNum - tableShowList.length;

    return (
      <Dialog open fullScreen>
        <DialogContent>
          <div style={barStyle}>
            <div style={titleStyle}>To Fix The Failed Data</div>
          </div>
          <Table>
            <TableHead>
              {tableRowHeaderList}
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
          <Button disabled={disableBtn} onClick={() => this.handleButtonClick({ action: 'saveFixedDataList' })} color="primary" autoFocus>Confirm</Button>
        </DialogActions>
        <DialogRuleMgr dialogState={dialogState} onClickCallback={this.handleButtonClick} />
      </Dialog>
    );
  }
}

export default withMobileDialog()(DialogFixDataList);
