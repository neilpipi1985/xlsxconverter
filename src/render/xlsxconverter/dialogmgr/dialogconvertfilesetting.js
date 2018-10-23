import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  withMobileDialog, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, FormControl, InputLabel, Select, MenuItem, FormControlLabel, Checkbox
} from '@material-ui/core';
import Dropzone from 'react-dropzone';
import { withStyles } from '@material-ui/core/styles';

import XlsxMgr from '../../../xlsxmgr';

const styles = ({
  formControl: {
    minWidth: 120,
  }
});

function asyncFileReader(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      return resolve({ name: file.name, content: reader.result });
    };
    reader.readAsDataURL(file);
  });
}

class DialogConvertFileSetting extends Component {
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

    if (dialogState.data !== prevProps.dialogState.data || dialogState.size !== prevProps.dialogState.size) {
      const newState = this.getNewState(dialogState, prevProps.dialogState);
      this.refreshContext(newState);
    }
  }

  onImportDrop = async (acceptedFiles) => {
    try {
      if (acceptedFiles && acceptedFiles.length > 0) {
        const importFileObj = await asyncFileReader(acceptedFiles[0]);
        const workBook = XlsxMgr.getWorkBook(importFileObj.content.split(',')[1], { type: 'base64' });

        const importSheets = workBook.SheetNames || ['No Sheet'];
        this.setState({
          workBook,
          importSheets,
          importSheet: importSheets[0] || 'No Sheet',
          importHeadrsRowNo: '1',
          importFileName: importFileObj.name,
          errorImportFile: ''
        });
      } else {
        this.setState({
          workBook: {},
          importSheets: ['No Sheet'],
          importSheet: 'No Sheet',
          importHeadrsRowNo: '1',
          importFileName: '',
          errorImportFile: 'Please Select an Import File'
        });
      }
    } catch (err) {
      this.setState({
        workBook: {},
        importSheets: ['No Sheet'],
        importSheet: 'No Sheet',
        importHeadrsRowNo: '1',
        importFileName: '',
        errorImportFile: `File parse error(${err.message})`
      });
    }
  };

  getNewState = (newProps = {}, oldProps = {}) => {
    const oldData = oldProps.data || {};
    const size = newProps.size || {};
    const data = newProps.data || {};

    const newState = {
      isWindowsRender: newProps.isWindowsRender || false,
      fullScreen: (size.width <= 600 || size.height <= 480)
    };

    if (!this.state) {
      const rules = data.rules || ['No Rule'];
      Object.assign(newState, {
        errorMessage: '',
        disableBtn: false,
        importFileName: '',
        errorImportFile: '',
        enableAutoRule: true,
        rules,
        rule: (rules.length > 0) ? rules[0] : 'No Rule',
        importSheets: ['No Sheet'],
        importSheet: 'No Sheet',
        importHeadrsRowNo: '1',
        workBook: {}
      });
    }

    if (data.error !== oldData.error) {
      Object.assign(newState, {
        errorMessage: data.error || '',
        disableBtn: false
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
      isWindowsRender,
      workBook,
      importSheet,
      importFileName,
      enableAutoRule,
      rule,
      importHeadrsRowNo
    } = this.state;

    switch (opts.action) {
      case 'close': {
        onClickCallback(opts);
        break;
      }
      case 'convertFile': {
        const importHeadrsRowIndex = parseInt(importHeadrsRowNo, 10) - 1;
        if (rule === 'No Rule') {
          this.setState({
            disableBtn: false,
            errorMessage: 'Please Add Rule first'
          });
        } else if (importFileName === '') {
          this.setState({
            disableBtn: false,
            errorMessage: 'Please Select the Import File'
          });
        } else if (importSheet === 'No Sheet') {
          this.setState({
            disableBtn: false,
            errorMessage: 'The Import File is not found any sheets'
          });
        } else if (!Number.isInteger(importHeadrsRowIndex) && importHeadrsRowIndex < 0) {
          this.setState({
            disableBtn: false,
            errorMessage: 'Row Number of Header must be a Positive Number'
          });
        } else {
          this.setState({
            disableBtn: true,
            errorMessage: '',
          });

          const workSheet = workBook.Sheets[importSheet];

          const importHeaders = XlsxMgr.getSheetHeaders(workSheet, importHeadrsRowIndex);
          const dataList = XlsxMgr.getSheetData(workSheet, importHeadrsRowIndex);

          onClickCallback({
            action: opts.action,
            isWindowsRender,
            dataList,
            importHeaders,
            ruleName: (!enableAutoRule) ? rule : '',
            fileName: importFileName.split('.').slice(0, -1).join('.'),
            sheetName: importSheet
          });
        }
        break;
      }
      default: {
        break;
      }
    }
  }

  render() {
    const {
      classes
    } = this.props;
    const {
      fullScreen,
      errorMessage,
      disableBtn,
      errorImportFile,
      importFileName,
      importSheets,
      importSheet,
      importHeadrsRowNo,
      enableAutoRule,
      rules,
      rule
    } = this.state;

    return (
      <Dialog open fullScreen={fullScreen} aria-labelledby="dialog-title">
        <DialogTitle id="dialog-title">To Set the Converted File</DialogTitle>
        <DialogContent>
          {
            (errorMessage !== '') ? <div style={{ margin: '5px 0', color: '#F44336' }}>{errorMessage}</div> : undefined
          }
          <div>
            <Dropzone
              accept={['.csv', '.xlsx']}
              ref={(node) => { this.importdropzone = node; }}
              onDrop={this.onImportDrop}
              multiple={false}
              style={{ display: 'none' }}
            />
            <TextField
              disabled={disableBtn}
              error={errorImportFile !== ''}
              fullWidth
              label="The Import File"
              onClick={(e) => { if (!disableBtn) { this.importdropzone.onClick(e); } }}
              value={importFileName}
              helperText={errorImportFile || ''}
            />
          </div>
          <FormControl className={classes.formControl} disabled={disableBtn} fullWidth>
            <InputLabel htmlFor="name-input">The Sheet of The Inport File</InputLabel>
            <Select value={importSheet} onChange={(e) => { this.setState({ importSheet: e.target.value }); }}>
              {
                importSheets.map((item, i) => (<MenuItem key={`importSheets${i + 1}`} value={item}>{item}</MenuItem>))
              }
            </Select>
          </FormControl>
          <TextField
            disabled={disableBtn}
            fullWidth
            type="number"
            label="Row Number of Header on the Sheet"
            value={importHeadrsRowNo}
            onChange={e => this.setState({ importHeadrsRowNo: e.target.value })}
          />
          <FormControlLabel
            control={
              <Checkbox checked={enableAutoRule} onChange={(e) => { this.setState({ enableAutoRule: e.target.checked }); }} />
            }
            label="Auto Rule"
          />
          {
            (!enableAutoRule) ? (
              <FormControl className={classes.formControl} disabled={disableBtn} fullWidth>
                <InputLabel htmlFor="name-input">Convert Rule</InputLabel>
                <Select value={rule} onChange={(e) => { this.setState({ rule: e.target.value }); }}>
                  {
                    rules.map((item, i) => (<MenuItem key={`rules${i + 1}`} value={item}>{item}</MenuItem>))
                  }
                </Select>
              </FormControl>
            ) : undefined
          }
        </DialogContent>
        <DialogActions>
          <Button disabled={disableBtn} onClick={() => this.handleButtonClick({ action: 'close' })} color="secondary">Cancel</Button>
          <Button disabled={disableBtn} onClick={() => this.handleButtonClick({ action: 'convertFile' })} color="primary" autoFocus>Submit</Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default withMobileDialog()(withStyles(styles)(DialogConvertFileSetting));
