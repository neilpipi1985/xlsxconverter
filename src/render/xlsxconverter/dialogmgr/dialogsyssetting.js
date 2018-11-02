import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withMobileDialog, Dialog, DialogTitle, DialogContent, DialogActions,
  Button, FormControl, InputLabel, FormControlLabel, Checkbox, Input, TextField
} from '@material-ui/core';

class DialogSysSetting extends Component {
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
      const newState = this.getNewState(dialogState, prevProps.dialogState.data);
      this.refreshContext(newState);
    }
  }

  getNewState = (newProps = {}, oldProps = {}) => {
    const size = newProps.size || {};
    const data = newProps.data || {};
    const oldData = oldProps.data || {};

    const newState = {
      fullScreen: (size.width <= 600 || size.height <= 480),
      isWindowsRender: newProps.isWindowsRender || false
    };

    if (!this.state) {
      const webOpts = data.webOpts || {};
      Object.assign(newState, {
        disableBtn: false,
        errorMessage: '',
        distPath: data.distPath || '',
        enableWebService: data.enableWebService || false,
        enableWebPwd: data.enableWebPwd || false,
        webPwd: data.webPwd || '',
        webServicePort: `${webOpts.port || 3000}`
      });
    }

    if (data.error !== oldData.error) {
      Object.assign(newState, {
        disableBtn: false,
        errorMessage: data.error || ''
      });
    }

    if (data.distPath !== undefined && data.distPath !== oldData.distPath) {
      Object.assign(newState, {
        disableBtn: false,
        distPath: data.distPath || ''
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
      distPath,
      enableWebService,
      enableWebPwd,
      webPwd,
      webServicePort
    } = this.state;

    switch (opts.action) {
      case 'close': {
        onClickCallback({ action: opts.action });
        break;
      }
      case 'setDistPath': {
        onClickCallback({ action: 'setDistPath', path: distPath });
        break;
      }
      case 'setSysSetting': {
        const port = parseInt(webServicePort, 10);
        if (!Number.isInteger(port)) {
          this.setState({
            disableBtn: false,
            errorMessage: 'Port of Web Service must be a Number'
          });
        } else if (!isWindowsRender) {
          this.setState({ disableBtn: true });
          onClickCallback({
            action: 'setSysSetting',
            setting: {
              enableWebService,
              enableWebPwd,
              webPwd,
              webOpts: { port },
            }
          });
        } else if (distPath === '') {
          this.setState({
            disableBtn: false,
            errorMessage: 'Please select the Export Path'
          });
        } else {
          this.setState({ disableBtn: true });
          onClickCallback({
            action: 'setSysSetting',
            setting: {
              distPath,
              enableWebService,
              enableWebPwd,
              webPwd,
              webOpts: { port },
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
      fullScreen,
      disableBtn,
      isWindowsRender,
      errorMessage,
      distPath,
      enableWebService,
      enableWebPwd,
      webPwd,
      webServicePort
    } = this.state;

    return (
      <Dialog open fullScreen={fullScreen} aria-labelledby="dialog-title">
        <DialogTitle id="dialog-title">Systeim Setting</DialogTitle>
        <DialogContent>
          {
            (errorMessage !== '') ? <div style={{ margin: '5px 0', color: '#F44336' }}>{errorMessage}</div> : undefined
          }
          {
            (isWindowsRender) ? (
              <FormControl fullWidth>
                <InputLabel>Export Path</InputLabel>
                <Input
                  disabled={disableBtn}
                  onClick={() => this.handleButtonClick({ action: 'setDistPath' })}
                  value={distPath}
                />
              </FormControl>
            ) : undefined
          }
          <FormControlLabel
            control={
              <Checkbox checked={enableWebService} onChange={(e) => { this.setState({ enableWebService: e.target.checked }); }} />
            }
            label="Enable Web Service"
          />
          {
            (enableWebService) ? (
              <FormControlLabel
                control={
                  <Checkbox checked={enableWebPwd} onChange={(e) => { this.setState({ enableWebPwd: e.target.checked }); }} />
                }
                label="Enable Password"
              />
            ) : undefined
          }
          {
            (enableWebService && enableWebPwd) ? (
              <TextField
                disabled={disableBtn}
                fullWidth
                label="Password"
                value={webPwd}
                onChange={e => this.setState({ webPwd: e.target.value })}
              />
            ) : undefined
          }
          {
            (enableWebService) ? (
              <TextField
                disabled={disableBtn}
                fullWidth
                type="number"
                label="Port of Web Service"
                value={webServicePort}
                onChange={e => this.setState({ webServicePort: e.target.value })}
              />
            ) : undefined
          }
        </DialogContent>
        <DialogActions>
          {
            (!(isWindowsRender && distPath === '')) ? <Button disabled={disableBtn} onClick={() => this.handleButtonClick({ action: 'close' })} color="secondary">Cancel</Button> : undefined
          }
          <Button disabled={disableBtn} onClick={() => this.handleButtonClick({ action: 'setSysSetting' })} color="primary" autoFocus>Confirm</Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default withMobileDialog()(DialogSysSetting);
