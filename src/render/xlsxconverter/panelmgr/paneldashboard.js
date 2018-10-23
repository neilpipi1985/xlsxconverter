import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { List, ListItem, ListItemText, Divider, ListSubheader } from '@material-ui/core';

const styles = theme => ({
  nested: {
    paddingLeft: theme.spacing.unit * 4,
  },
});

class PanelDashboard extends Component {
  static propTypes = {
    classes: PropTypes.object.isRequired,
    onClickCallback: PropTypes.func.isRequired,
    panelState: PropTypes.object
  };

  static defaultProps = {
    panelState: {}
  };

  constructor(props) {
    super(props);
    this.state = this.getNewState(props.panelState);
  }

  componentDidUpdate(prevProps) {
    const {
      panelState
    } = this.props;
    if (
      panelState.isWindowsRender !== prevProps.panelState.isWindowsRender || panelState.size !== prevProps.panelState.size
    ) {
      const newState = this.getNewState(panelState, prevProps.panelState);
      this.refreshContext(newState);
    }
  }

  getNewState = (newProps = {}, oldProps = {}) => {
    const oldSize = oldProps.size || {};
    const size = newProps.size || {};

    const newState = { isWindowsRender: newProps.isWindowsRender };

    if (oldSize.width !== size.width || oldSize.height !== size.height) {
      const width = (size.width || 240);
      const height = (size.height || 240);

      const listWidth = ((width - 235) > 0) ? 240 : width;
      const listHeight = ((height - 235) > 0) ? 240 : height;
      const marginWidth = (width - listWidth) >> 1;
      const marginHeight = (height - listHeight) >> 1;


      Object.assign(newState, {
        style: {
          width: `${width}px`,
          height: `${height}px`,
          backgroundColor: 'transparent'
        },
        listStyle: {
          width: `${listWidth}px`,
          height: `${listHeight}px`,
          margin: `${marginHeight}px ${marginWidth}px`,
          position: 'relative',
          backgroundColor: 'white'
        }
      });
    }

    return newState;
  }

  refreshContext = (newState = {}) => {
    this.setState(newState);
  }

  handleButtonClick = (opts = {}) => {
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
      style,
      listStyle,
      isWindowsRender
    } = this.state;

    return (
      <div style={style}>
        <div style={listStyle}>
          <List component="nav" subheader={<ListSubheader component="div">Menu</ListSubheader>}>
            <ListItem button className={classes.nested} onClick={() => this.handleButtonClick({ action: 'getConvertFileSetting' })}>
              <ListItemText primary="To Convert File" />
            </ListItem>
            <Divider />
            <ListItem button className={classes.nested} onClick={() => this.handleButtonClick({ action: 'goRules' })}>
              <ListItemText primary="Rule Management" />
            </ListItem>
            <Divider />
            <ListItem button className={classes.nested} onClick={() => this.handleButtonClick({ action: 'getSysSetting' })}>
              <ListItemText primary="System Setting" />
            </ListItem>
            {
              (isWindowsRender) ? (
                <Divider />
              ) : undefined
            }
            {
              (isWindowsRender) ? (
                <ListItem button className={classes.nested} onClick={() => this.handleButtonClick({ action: 'exitApp' })}>
                  <ListItemText primary="Exit" />
                </ListItem>
              ) : undefined
            }
          </List>
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(PanelDashboard);
