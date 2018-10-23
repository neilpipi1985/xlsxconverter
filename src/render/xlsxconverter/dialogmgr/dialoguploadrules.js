import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  withMobileDialog, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button
} from '@material-ui/core';
import Dropzone from 'react-dropzone';

function asyncFileReader(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      return resolve({ name: file.name, content: reader.result });
    };
    reader.readAsDataURL(file);
  });
}

class DialogUploadRules extends Component {
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

  onDrop = (acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      this.setState({
        ruleFile: acceptedFiles[0],
        errorRuleFile: ''
      });
    } else {
      this.setState({
        ruleFile: undefined,
        errorRuleFile: 'File Format Error'
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
      Object.assign(newState, {
        errorMessage: '',
        disableBtn: false,
        ruleFile: undefined,
        errorRuleFile: ''
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
      ruleFile
    } = this.state;

    switch (opts.action) {
      case 'close': {
        onClickCallback(opts);
        break;
      }
      case 'uploadRules': {
        if (ruleFile === undefined) {
          this.setState({
            disableBtn: false,
            errorRuleFile: 'Please Select The Rules File'
          });
        } else {
          this.setState({
            disableBtn: true,
            errorMessage: '',
          });

          const ruleFileObj = await asyncFileReader(ruleFile);

          onClickCallback({
            action: opts.action,
            ruleFileObj
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
      fullScreen,
      errorMessage,
      disableBtn,
      errorRuleFile,
      ruleFile
    } = this.state;

    return (
      <Dialog open fullScreen={fullScreen} aria-labelledby="dialog-title">
        <DialogTitle id="dialog-title">To Upload Rules</DialogTitle>
        <DialogContent>
          {
            (errorMessage !== '') ? <div style={{ margin: '5px 0', color: '#F44336' }}>{errorMessage}</div> : undefined
          }
          <div>
            <Dropzone
              accept=".json"
              ref={(node) => { this.exportdropzone = node; }}
              onDrop={this.onDrop}
              multiple={false}
              style={{ display: 'none' }}
            />
            <TextField
              disabled={disableBtn}
              error={errorRuleFile !== ''}
              fullWidth
              label="Rules File"
              onClick={(e) => { if (!disableBtn) { this.exportdropzone.onClick(e); } }}
              value={(ruleFile) ? ruleFile.name : ''}
              helperText={errorRuleFile || ''}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button disabled={disableBtn} onClick={() => this.handleButtonClick({ action: 'close' })} color="secondary">Cancel</Button>
          <Button disabled={disableBtn} onClick={() => this.handleButtonClick({ action: 'uploadRules' })} color="primary" autoFocus>Confrim</Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default withMobileDialog()(DialogUploadRules);
