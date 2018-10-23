import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withMobileDialog, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@material-ui/core';

class DialogAppInfo extends Component {
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
    if (
      dialogState.data !== prevProps.dialogState.data ||
      dialogState.size !== prevProps.dialogState.size
    ) {
      const newState = this.getNewState(dialogState, prevProps.dialogState.data);
      this.refreshContext(newState);
    }
  }

  getNewState = (newProps = {}) => {
    const data = newProps.data || {};

    const newState = {};

    if (!this.state) {
      Object.assign(newState, {
        name: data.name || '',
        version: data.version || '',
        author: data.author || ''
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
    onClickCallback({ action: opts.action });
  }

  render() {
    const {
      name,
      version,
      author
    } = this.state;

    return (
      <Dialog
        open
        aria-labelledby="dialog-title"
      >
        <DialogTitle id="dialog-title">System Information</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Name"
            value={name}
          />
          <TextField
            fullWidth
            label="Version"
            value={version}
          />
          <TextField
            fullWidth
            label="Author"
            value={author}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => this.handleButtonClick({ action: 'close' })} color="primary">OK</Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default withMobileDialog()(DialogAppInfo);
