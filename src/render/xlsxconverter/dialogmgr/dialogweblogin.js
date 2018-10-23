import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  withMobileDialog, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button
} from '@material-ui/core';

class DialogWebLogin extends Component {
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
    const oldData = oldProps.data || {};
    const size = newProps.size || {};
    const data = newProps.data || {};

    const newState = {
      fullScreen: (size.width <= 600 || size.height <= 480)
    };

    if (!this.state) {
      Object.assign(newState, {
        errorMessage: '',
        password: '',
        disableBtn: false
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
      password
    } = this.state;

    switch (opts.action) {
      case 'login': {
        this.setState({
          disableBtn: true,
          errorMessage: '',
        });
        onClickCallback({
          action: opts.action,
          password
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
      fullScreen,
      errorMessage,
      password,
      disableBtn
    } = this.state;

    return (
      <Dialog open fullScreen={fullScreen} aria-labelledby="dialog-title">
        <DialogTitle id="dialog-title">請輸入登入密碼</DialogTitle>
        <DialogContent>
          {
            (errorMessage !== '') ? <div style={{ margin: '5px 0', color: '#F44336' }}>{errorMessage}</div> : undefined
          }
          <TextField
            disabled={disableBtn}
            fullWidth
            type="password"
            label="密碼"
            value={password}
            onChange={e => this.setState({ password: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button disabled={disableBtn} onClick={() => this.handleButtonClick({ action: 'login' })} color="primary" autoFocus>送出</Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default withMobileDialog()(DialogWebLogin);
