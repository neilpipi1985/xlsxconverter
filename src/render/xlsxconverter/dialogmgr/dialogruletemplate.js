import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  withMobileDialog, Dialog, DialogTitle, DialogContent, DialogActions, FormControl,
  TextField, Button, FormControlLabel, InputLabel, Select, MenuItem, Checkbox
} from '@material-ui/core';
import Dropzone from 'react-dropzone';
import { withStyles } from '@material-ui/core/styles';

import RuleMgr from '../../../rulemgr';
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

class DialogRuleTemplate extends Component {
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

  onExportDrop = async (acceptedFiles) => {
    const { enableMappingName, name } = this.state;
    try {
      if (acceptedFiles && acceptedFiles.length > 0) {
        const obj = await asyncFileReader(acceptedFiles[0]);
        const exportFileName = obj.name || '';
        const exportWorkBook = XlsxMgr.getWorkBook(obj.content.split(',')[1], { type: 'base64' });

        const exportSheets = exportWorkBook.SheetNames || ['No Sheet'];

        this.setState({
          exportWorkBook,
          exportSheets,
          exportSheet: exportSheets[0] || 'No Sheet',
          exportHeadrsRowNo: '1',
          exportFileName,
          name: enableMappingName ? ((exportFileName).split('.').slice(0, -1).join('.')) : name,
          errorExportFile: ''
        });
      } else {
        this.setState({
          exportWorkBook: {},
          exportSheets: ['No Sheet'],
          exportSheet: 'No Sheet',
          exportHeadrsRowNo: '1',
          exportFileName: '',
          errorExportFile: 'Please Select an Export File'
        });
      }
    } catch (err) {
      this.setState({
        exportWorkBook: {},
        exportSheets: ['No Sheet'],
        exportSheet: 'No Sheet',
        exportHeadrsRowNo: '1',
        exportFileName: '',
        errorExportFile: `File parse error(${err.message})`
      });
    }
  };

  onImportDrop = async (acceptedFiles) => {
    try {
      if (acceptedFiles && acceptedFiles.length > 0) {
        const obj = await asyncFileReader(acceptedFiles[0]);
        const importWorkBook = XlsxMgr.getWorkBook(obj.content.split(',')[1], { type: 'base64' });

        const importSheets = importWorkBook.SheetNames || ['No Sheet'];
        this.setState({
          importWorkBook,
          importSheets,
          importSheet: importSheets[0] || 'No Sheet',
          importHeadrsRowNo: '1',
          importFileName: obj.name,
          errorImportFile: ''
        });
      } else {
        this.setState({
          importWorkBook: {},
          importSheets: ['No Sheet'],
          importSheet: 'No Sheet',
          importHeadrsRowNo: '1',
          importFileName: '',
          errorImportFile: 'Please Select an Import File'
        });
      }
    } catch (err) {
      this.setState({
        importWorkBook: {},
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
      fullScreen: (size.width <= 600 || size.height <= 480)
    };

    if (!this.state) {
      const bookTypes = ['xlsx', 'csv'];
      const bookType = 'xlsx';
      Object.assign(newState, {
        errorMessage: '',
        disableBtn: false,
        exportWorkBook: {},
        exportSheets: ['No Sheet'],
        exportSheet: 'No Sheet',
        exportFileName: '',
        errorExportFile: '',
        exportHeadrsRowNo: '1',
        importWorkBook: {},
        importSheets: ['No Sheet'],
        importSheet: 'No Sheet',
        importFileName: '',
        errorImportFile: '',
        importHeadrsRowNo: '1',
        name: '',
        bookTypes,
        bookType,
        enableMappingName: true,
        enableTimestamp: false
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
      exportWorkBook,
      exportFileName,
      exportSheet,
      exportHeadrsRowNo,
      importWorkBook,
      importSheet,
      importFileName,
      importHeadrsRowNo,
      enableMappingName,
      enableTimestamp,
      name,
      bookType
    } = this.state;

    switch (opts.action) {
      case 'close': {
        onClickCallback(opts);
        break;
      }
      case 'addRule': {
        const exportHeadrsRowIndex = parseInt(exportHeadrsRowNo, 10) - 1;
        const importHeadrsRowIndex = parseInt(importHeadrsRowNo, 10) - 1;
        if (exportFileName === '') {
          this.setState({
            disableBtn: false,
            errorExportFile: 'Please Select the Export File'
          });
        } else if (exportSheet === 'No Sheet') {
          this.setState({
            disableBtn: false,
            errorMessage: 'The Export File is not found any sheets'
          });
        } else if (!Number.isInteger(exportHeadrsRowIndex) && exportHeadrsRowIndex < 0) {
          this.setState({
            disableBtn: false,
            errorMessage: 'Row Number of Header must be a Positive Number'
          });
        } else if (importFileName === '') {
          this.setState({
            disableBtn: false,
            errorImportFile: 'Please Select the Import File'
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

          const exportHeaders = XlsxMgr.getSheetHeaders(exportWorkBook.Sheets[exportSheet], exportHeadrsRowIndex);
          const importHeaders = XlsxMgr.getSheetHeaders(importWorkBook.Sheets[importSheet], importHeadrsRowIndex);

          const headerRules = exportHeaders.map((item) => {
            return (Object.assign(new RuleMgr.HeaderRule(), { header: item }));
          });

          onClickCallback({
            action: opts.action,
            data: {
              ruleIndex: -1,
              rule: (Object.assign(new RuleMgr.ConvertRule(), {
                name,
                bookType,
                importHeaders,
                enableMappingName,
                enableTimestamp,
                headerRules
              }))
            }
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
      exportSheets,
      exportSheet,
      errorExportFile,
      exportFileName,
      exportHeadrsRowNo,
      importFileName,
      importSheets,
      importSheet,
      errorImportFile,
      importHeadrsRowNo,
      name,
      bookTypes,
      bookType,
      enableMappingName,
      enableTimestamp
    } = this.state;

    return (
      <Dialog open fullScreen={fullScreen} aria-labelledby="dialog-title">
        <DialogTitle id="dialog-title">To Create Rule Setting</DialogTitle>
        <DialogContent>
          {
            (errorMessage !== '') ? <div style={{ margin: '5px 0', color: '#F44336' }}>{errorMessage}</div> : undefined
          }
          <div>
            <Dropzone
              accept={['.xlsx', '.csv']}
              ref={(node) => { this.exportdropzone = node; }}
              onDrop={this.onExportDrop}
              multiple={false}
              style={{ display: 'none' }}
            />
            <TextField
              disabled={disableBtn}
              error={errorExportFile !== ''}
              fullWidth
              label="The Export File"
              onClick={(e) => { if (!disableBtn) { this.exportdropzone.onClick(e); } }}
              value={exportFileName}
              helperText={errorExportFile || ''}
            />
          </div>
          <FormControl className={classes.formControl} disabled={disableBtn} fullWidth>
            <InputLabel htmlFor="name-input">The Sheet of The Export File</InputLabel>
            <Select value={exportSheet} onChange={(e) => { this.setState({ exportSheet: e.target.value }); }}>
              {
                exportSheets.map((item, i) => (<MenuItem key={`exportSheets${i + 1}`} value={item}>{item}</MenuItem>))
              }
            </Select>
          </FormControl>
          <TextField
            disabled={disableBtn}
            fullWidth
            type="number"
            label="Row Number of Header on The Sheet of The Export File"
            value={exportHeadrsRowNo}
            onChange={e => this.setState({ exportHeadrsRowNo: e.target.value })}
          />
          <div>
            <Dropzone
              accept={['.xlsx', '.csv']}
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
            <InputLabel htmlFor="name-input">The Sheet of The Import File</InputLabel>
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
            label="Row Number of Header on The Sheet of The Import File"
            value={importHeadrsRowNo}
            onChange={e => this.setState({ importHeadrsRowNo: e.target.value })}
          />
          <FormControlLabel
            control={
              <Checkbox checked={enableMappingName} onChange={(e) => { this.setState({ enableMappingName: e.target.checked }); }} />
            }
            label="To Map The Import File/Sheet Name"
          />
          <FormControlLabel
            control={
              <Checkbox checked={enableTimestamp} onChange={(e) => { this.setState({ enableTimestamp: e.target.checked }); }} />
            }
            label="Timestamp"
          />
          {
            (!enableMappingName) ? (
              <TextField
                disabled={disableBtn}
                fullWidth
                label="Name of Rule"
                value={name}
                onChange={e => this.setState({ name: e.target.value })}
              />) : undefined
          }
          <FormControl className={classes.formControl} disabled={disableBtn} fullWidth>
            <InputLabel htmlFor="name-input">Book Type</InputLabel>
            <Select value={bookType} onChange={(e) => { this.setState({ bookType: e.target.value }); }}>
              {
                bookTypes.map((item, i) => (<MenuItem key={`bookTypes${i + 1}`} value={item}>{item}</MenuItem>))
              }
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button disabled={disableBtn} onClick={() => this.handleButtonClick({ action: 'close' })} color="secondary">Cancel</Button>
          <Button disabled={disableBtn} onClick={() => this.handleButtonClick({ action: 'addRule' })} color="primary" autoFocus>Confirm</Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default withMobileDialog()(withStyles(styles)(DialogRuleTemplate));
