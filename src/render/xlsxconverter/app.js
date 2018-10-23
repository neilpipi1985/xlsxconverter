import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Snackbar } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { blue } from '@material-ui/core/colors';

import AppToolbar from './apptoolbar';
import PanelMgr from './panelmgr';
import DialogMgr from './dialogmgr';

require('../../public/styles/normalize.css');
require('../../public/styles/App.css');

const STAGE_STYLE = Object.freeze({
  backgroundColor: blue[200],
  backgroundSize: '100% auto',
  position: 'relative',
  width: '100%',
  height: '100%'
});

const styles = theme => ({
  snackbar: {
    margin: theme.spacing.unit,
  },
});

class App extends Component {
  static propTypes = {
    Socket: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired,
    refreshSize: PropTypes.func.isRequired,
    refreshSys: PropTypes.func.isRequired,
    refreshPanel: PropTypes.func.isRequired,
    refreshDialog: PropTypes.func.isRequired,
    refreshSnackbar: PropTypes.func.isRequired,
    isWindowsRender: PropTypes.bool.isRequired,
    socket: PropTypes.object.isRequired,
    toolbarState: PropTypes.object.isRequired,
    panelState: PropTypes.object.isRequired,
    dialogState: PropTypes.object.isRequired,
    snackbarState: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.handleResize();
    window.addEventListener('resize', this.handleResize);
    this.initSocket();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }

  handleResize = () => {
    const {
      refreshSize
    } = this.props;

    const stageSpecs = this.stage.getBoundingClientRect();

    const tmpWidth = (stageSpecs.width > 240) ? stageSpecs.width : 240;
    const tmpHeight = (stageSpecs.height > 240) ? stageSpecs.height : 240;

    refreshSize({
      dialogSize: {
        width: tmpWidth,
        height: tmpHeight
      },
      panelSize: {
        width: tmpWidth,
        height: (tmpHeight - 64)
      }
    });
  }

  handleToolbarClick = async (opts = {}) => {
    const {
      socket,
      refreshPanel
    } = this.props;

    switch (opts.action) {
      case 'goDashboard': {
        refreshPanel({ type: opts.action, data: {} });
        break;
      }
      case 'getAppInfo': {
        if (socket) {
          socket.send(opts.action, opts);
        }
        break;
      }
      default: {
        console.log(opts);
        break;
      }
    }
  }

  handleSnackbarClose = () => {
    const {
      refreshSnackbar
    } = this.props;
    refreshSnackbar({ open: false });
  }

  handleDialogClick = async (opts = {}) => {
    const {
      socket,
      refreshDialog
    } = this.props;

    switch (opts.action) {
      case 'close': {
        refreshDialog({ type: '', data: {} });
        break;
      }
      case 'addRule': {
        refreshDialog({
          type: 'editRuleHeaders',
          data: opts.data || {}
        });
        break;
      }
      case 'login':
      case 'setDistPath':
      case 'setSysSetting':
      case 'delRule':
      case 'saveRule':
      case 'saveRuleHeaders':
      case 'uploadRules':
      case 'convertFile':
      case 'saveFixedDataList': {
        if (socket) {
          socket.send(opts.action, opts);
        }
        break;
      }
      default: {
        break;
      }
    }
  }

  handlePanelClick = (opts = {}) => {
    const {
      socket,
      refreshDialog
    } = this.props;

    switch (opts.action) {
      case 'getRuleTemplate':
      case 'getUploadRulesSetting':
      case 'editRuleInfo':
      case 'editRuleHeaders': {
        refreshDialog({ type: opts.action, data: opts.data || {} });
        break;
      }
      case 'getConvertFileSetting':
      case 'goRules':
      case 'downloadRules':
      case 'getSysSetting':
      case 'exitApp': {
        if (socket) {
          socket.send(opts.action, opts);
        }
        break;
      }
      default: {
        console.log(opts);
        break;
      }
    }
  }

  saveFiles = async (opts = {}) => {
    const files = opts.files || [];
    for (let i = 0; i < files.length; i += 1) {
      const filename = files[i].key;
      const data = files[i].value;

      const blob = new Blob([data], { type: 'application/octet-stream' });
      if (typeof window.navigator.msSaveBlob !== 'undefined') {
        // IE workaround for "HTML7007: One or more blob URLs were
        // revoked by closing the blob for which they were created.
        // These URLs will no longer resolve as the data backing
        // the URL has been freed."
        window.navigator.msSaveBlob(blob, filename);
      } else {
        const blobURL = window.URL.createObjectURL(blob);
        const tempLink = document.createElement('a');
        tempLink.href = blobURL;
        tempLink.setAttribute('download', filename);
        tempLink.setAttribute('target', '_blank');
        document.body.appendChild(tempLink);
        tempLink.click();
        document.body.removeChild(tempLink);
      }
    }
  }

  initSocket() {
    const {
      isWindowsRender,
      Socket,
      socket,
      refreshSys,
      refreshPanel,
      refreshDialog,
      refreshSnackbar
    } = this.props;

    if (!isWindowsRender && socket.disconnect) {
      socket.disconnect();
    }

    const newSocket = new Socket({ path: '/api/socket' });
    newSocket.on('refreshSys', refreshSys);
    newSocket.on('refreshPanel', refreshPanel);
    newSocket.on('refreshDialog', refreshDialog);
    newSocket.on('refreshSnackbar', refreshSnackbar);
    newSocket.on('saveFiles', this.saveFiles);
    newSocket.on('console', (msg = '') => console.log(msg));

    refreshSys({ socket: newSocket });
    newSocket.send('initRenderState', { isWindowsRender });
  }

  render() {
    const {
      classes,
      toolbarState,
      panelState,
      dialogState,
      snackbarState
    } = this.props;

    return (
      <div style={STAGE_STYLE} ref={(s) => { this.stage = s; }}>
        <AppToolbar toolbarState={toolbarState} onClickCallback={this.handleToolbarClick} />
        <PanelMgr panelState={panelState} onClickCallback={this.handlePanelClick} />
        <DialogMgr dialogState={dialogState} onClickCallback={this.handleDialogClick} />
        <Snackbar
          className={classes.snackbar}
          ContentProps={{ 'aria-describedby': 'message-id' }}
          open={snackbarState.open}
          onClose={this.handleSnackbarClose}
          message={<span id="message-id">{snackbarState.message}</span>}
          autoHideDuration={snackbarState.autoHideDuration}
        />
      </div>
    );
  }
}

export default withStyles(styles)(App);
