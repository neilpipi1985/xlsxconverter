import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { AppBar, Toolbar, Typography, IconButton, Avatar } from '@material-ui/core';
import { SubdirectoryArrowLeft } from '@material-ui/icons';

const logo = require('../../public/images/neil.png');

const styles = {
  avatar: {
    backgroundColor: 'transparent',
    width: 50,
    height: 50,
    marginLeft: -12,
    marginRight: 20,
  },
  flex: {
    flex: 1,
  }
};

class AppToolbar extends Component {
  static propTypes = {
    classes: PropTypes.object.isRequired,
    onClickCallback: PropTypes.func.isRequired,
    toolbarState: PropTypes.object
  };

  static defaultProps = {
    toolbarState: {}
  };

  constructor(props) {
    super(props);
    this.state = this.getNewState(props.toolbarState);
  }

  componentDidUpdate(prevProps) {
    const {
      toolbarState
    } = this.props;
    if (toolbarState.panelType !== prevProps.toolbarState.panelType) {
      const newState = this.getNewState(toolbarState, prevProps.toolbarState);
      this.refreshContext(newState);
    }
  }

  getNewState = (newProps = {}) => {
    const panelType = newProps.panelType || '';

    const newState = {
      titile: 'XLSX Converter',
      appRightIcon: undefined
    };
    if (panelType !== 'goDashboard') {
      Object.assign(newState, {
        appRightIcon: (
          <IconButton color="inherit" aria-label="Return" onClick={() => this.handleToolbarClick({ action: 'goDashboard' })}>
            <SubdirectoryArrowLeft />
          </IconButton>
        )
      });
    }

    return newState;
  }

  refreshContext = (newState = {}) => {
    this.setState(newState);
  }

  handleToolbarClick(opts = {}) {
    const {
      onClickCallback
    } = this.props;

    onClickCallback(opts);
  }

  render() {
    const {
      classes
    } = this.props;
    const {
      appRightIcon
    } = this.state;

    return (
      <div className={{ width: '100%' }}>
        <AppBar position="static" color="primary">
          <Toolbar>
            <Avatar alt="LOGO" src={logo} className={classes.avatar} onClick={() => this.handleToolbarClick({ action: 'getAppInfo' })} />
            <Typography type="title" color="inherit" className={classes.flex} style={{ WebkitAppRegion: 'drag', cursor: 'move' }}>
              XLSX Converter
            </Typography>
            {appRightIcon}
          </Toolbar>
        </AppBar>
      </div>
    );
  }
}

export default withStyles(styles)(AppToolbar);
