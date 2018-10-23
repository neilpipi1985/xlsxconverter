import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  withMobileDialog, Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button, FormControlLabel, Checkbox
} from '@material-ui/core';

class DialogFixData extends Component {
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

    if (dialogState.data !== prevProps.dialogState.data) {
      const newState = this.getNewState(dialogState);
      this.refreshContext(newState);
    }
  }

  getNewState = (newProps = {}) => {
    const data = newProps.data || {};
    const newState = {};

    if (!this.state) {
      const exportHeaders = data.exportHeaders || [];
      const headerDatas = Object.assign({}, data.data || {});

      const fixDataList = [];
      exportHeaders.forEach((item) => {
        if (headerDatas[item] && headerDatas[item].msg) {
          fixDataList.push({ header: item, value: headerDatas[item].msg });
        }
      });

      Object.assign(newState, {
        dialogState: {
          type: '',
          data: {}
        },
        disableBtn: false,
        isFixedData: data.isFixedData,
        dataIndex: data.dataIndex,
        data: headerDatas,
        fixDataList
      });
    }

    return newState;
  }

  refreshContext = (newState = {}) => {
    this.setState(newState);
  }

  handleButtonClick = async (opts = {}) => {
    const {
      onClickCallback
    } = this.props;
    const {
      dataIndex,
      data,
      isFixedData,
      fixDataList
    } = this.state;

    switch (opts.action) {
      case 'close': {
        onClickCallback({
          action: 'refreshDialog',
          type: '',
          data: {}
        });
        break;
      }
      case 'saveFixedData': {
        fixDataList.forEach((item) => {
          data[item.header] = { msg: item.value };
        });
        data.isFixedData = isFixedData;
        onClickCallback({
          action: opts.action,
          dataIndex,
          data
        });
        break;
      }
      default: {
        break;
      }
    }
  }

  handleValueChange = async (value = '', item = {}, index = 0) => {
    const {
      fixDataList
    } = this.state;

    const newFixDataList = [].concat(fixDataList);
    newFixDataList[index] = Object.assign({}, item, { value });
    this.setState({
      fixDataList: newFixDataList
    });
  }

  render() {
    const {
      disableBtn,
      isFixedData,
      fixDataList
    } = this.state;

    const tableFixDataList = fixDataList.map((item, i) => {
      return (
        <TextField
          key={`header${i + 1}`}
          disabled={disableBtn}
          fullWidth
          label={item.header}
          value={item.value}
          onChange={e => this.handleValueChange(e.target.value, item, i)}
        />
      );
    });

    return (
      <Dialog open aria-labelledby="alert-dialog-title">
        <DialogTitle id="dialog-title">To Fixe Header Value</DialogTitle>
        <DialogContent>
          <FormControlLabel
            control={
              <Checkbox checked={isFixedData} onChange={(e) => { this.setState({ isFixedData: e.target.checked }); }} />
            }
            label="To Add Success List"
          />
          {tableFixDataList}
        </DialogContent>
        <DialogActions>
          <Button disabled={disableBtn} onClick={() => this.handleButtonClick({ action: 'close' })} color="secondary">Cancel</Button>
          <Button disabled={disableBtn} onClick={() => this.handleButtonClick({ action: 'saveFixedData' })} color="primary" autoFocus>Confirm</Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default withMobileDialog()(DialogFixData);
