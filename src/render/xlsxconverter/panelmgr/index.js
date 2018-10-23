import React, { Component } from 'react';
import PropTypes from 'prop-types';

import PanelDashboard from './paneldashboard';
import PanelRules from './panelrules';

class PanelMgr extends Component {
  static propTypes = {
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
    const { panelState } = this.props;
    if (panelState !== prevProps.panelState) {
      const newState = this.getNewState(panelState);
      this.refreshContext(newState);
    }
  }

  getNewState = (newProps = {}) => {
    const { onClickCallback } = this.props;
    let panel;
    switch (newProps.type) {
      case 'goDashboard': {
        panel = (<PanelDashboard panelState={newProps} onClickCallback={onClickCallback} />);
        break;
      }
      case 'goRules': {
        panel = (<PanelRules panelState={newProps} onClickCallback={onClickCallback} />);
        break;
      }
      default: {
        break;
      }
    }

    return { panel };
  }

  refreshContext = (newState = {}) => {
    this.setState(newState);
  }

  render() {
    const {
      panel
    } = this.state;

    return (<div>{panel}</div>);
  }
}

export default PanelMgr;
