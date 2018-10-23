import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Table, TableHead, TableCell, TableBody, TableRow, TableFooter, TablePagination,
  IconButton, Tooltip, Chip
} from '@material-ui/core';
import { Add, CloudDownload, CloudUpload } from '@material-ui/icons';


class PanelRules extends Component {
  static propTypes = {
    onClickCallback: PropTypes.func.isRequired,
    panelState: PropTypes.object
  };

  static defaultProps = {
    panelState: {}
  };

  constructor(props) {
    super(props);
    this.state = this.getNewState(props.panelState);
  }

  componentDidUpdate(prevProps) {
    const {
      panelState
    } = this.props;
    if (panelState.data !== prevProps.panelState.data || panelState.size !== prevProps.panelState.size) {
      const newState = this.getNewState(panelState, prevProps.panelState);
      this.refreshContext(newState);
    }
  }

  getNewState = (newProps = {}, oldProps = {}) => {
    const oldSize = oldProps.size || {};
    const size = newProps.size || {};
    const oldData = oldProps.data || {};
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
          margin: '4px 2px',
        }
      });
    }

    if (!this.state || data !== oldData) {
      const dataList = data.list || [];
      const tableRowList = [];
      for (let i = 0; i < dataList.length; i += 1) {
        tableRowList.push(this.getTableRow(dataList[i], i));
      }
      if (!this.state) {
        Object.assign(newState, {
          page: 0
        });
      }
      Object.assign(newState, {
        dataList,
        tableRowList
      });
    }

    return newState;
  }

  getTableRow = (rule = {}, ruleIndex = 0) => {
    return (
      <TableRow key={rule.name}>
        <TableCell>
          <Chip label={rule.name} onClick={() => this.handleButtonClick({ action: 'editRuleInfo', data: { ruleIndex, rule } })} />
        </TableCell>
        <TableCell>{rule.bookType}</TableCell>
        <TableCell>{rule.enableMappingName ? 'YES' : 'NO'}</TableCell>
        <TableCell>{rule.enableTimestamp ? 'YES' : 'NO'}</TableCell>
        <TableCell>
          <Chip label={rule.headerRules.length} onClick={() => this.handleButtonClick({ action: 'editRuleHeaders', data: { ruleIndex, rule } })} />
        </TableCell>
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

    switch (opts.action) {
      case 'downloadRules':
      case 'getUploadRulesSetting':
      case 'getRuleTemplate':
      case 'editRuleInfo':
      case 'editRuleHeaders': {
        onClickCallback(opts);
        break;
      }
      default: {
        break;
      }
    }
  }

  render() {
    const {
      style,
      rowNum,
      page,
      gridStyle,
      barStyle,
      titleStyle,
      toolBtnStyle,
      tableRowList
    } = this.state;

    const tableShowList = tableRowList.slice(page * rowNum, (page * rowNum) + rowNum);
    const emptyRows = rowNum - tableShowList.length;

    return (
      <div style={style}>
        <div style={gridStyle}>
          <div style={barStyle}>
            <div style={titleStyle}>Rules</div>
            <div style={toolBtnStyle}>
              <Tooltip title="Download Rules">
                <IconButton aria-label="Download" onClick={() => this.handleButtonClick({ action: 'downloadRules' })}>
                  <CloudDownload />
                </IconButton>
              </Tooltip>
              <Tooltip title="Upload Rules">
                <IconButton aria-label="Upload" onClick={() => this.handleButtonClick({ action: 'getUploadRulesSetting' })}>
                  <CloudUpload />
                </IconButton>
              </Tooltip>
              <Tooltip title="New Rule">
                <IconButton aria-label="Add" onClick={() => this.handleButtonClick({ action: 'getRuleTemplate' })}>
                  <Add />
                </IconButton>
              </Tooltip>
            </div>
          </div>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Mapping</TableCell>
                <TableCell>Timestamp</TableCell>
                <TableCell>Headers Num</TableCell>
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
        </div>
      </div>
    );
  }
}

export default PanelRules;
