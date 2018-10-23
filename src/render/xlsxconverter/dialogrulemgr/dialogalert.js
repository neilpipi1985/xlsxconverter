import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withMobileDialog, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@material-ui/core';

class DialogAlert extends Component {
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
      const newState = this.getNewState(dialogState);
      this.refreshContext(newState);
    }
  }

  getNewState = (newProps = {}) => {
    const {
      onClickCallback
    } = this.props;

    const size = newProps.size || {};
    const data = newProps.data || {};

    const enableFullScreen = (size.width <= 600 || size.height <= 480);

    let tmpActionBtnList;
    if (!data.disableBtn) {
      let actions;
      if (data.btnList && data.btnList.length > 0) {
        actions = data.btnList.map((item, i) => {
          return (
            <Button key={`key${i + 1}`} onClick={() => onClickCallback(item)} color={item.color || 'primary'}>{item.label}</Button>
          );
        });
      } else {
        actions = (
          <Button onClick={() => onClickCallback({ action: 'close' })} color="primary">OK</Button>
        );
      }
      tmpActionBtnList = (
        <DialogActions>
          {actions}
        </DialogActions>
      );
    }

    return {
      fullScreen: enableFullScreen,
      title: data.title || '',
      message: data.message || '',
      actionBtnList: tmpActionBtnList
    };
  }

  refreshContext = (newState = {}) => {
    this.setState(newState);
  }

  render() {
    const {
      fullScreen,
      title,
      message,
      actionBtnList
    } = this.state;

    return (
      <Dialog
        open
        fullScreen={fullScreen}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="dialog-title">{title}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">{message}</DialogContentText>
        </DialogContent>
        {actionBtnList}
      </Dialog>
    );
  }
}

export default withMobileDialog()(DialogAlert);
