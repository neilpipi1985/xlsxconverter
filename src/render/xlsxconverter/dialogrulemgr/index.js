import React, { Component } from 'react';
import PropTypes from 'prop-types';

import DialogAlert from './dialogalert';
import DialogFixData from './dialogfixdata';
import DialogRuleHeaderInfo from './dialogruleheaderinfo';
import DialogOperatorRules from './dialogoperatorrules';
import DialogOperatorRule from './dialogoperatorrule';
import DialogRuleHeaders from '../dialogmgr/dialogruleheaders';

class DialogRuleMgr extends Component {
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
    const { dialogState } = this.props;
    if (dialogState !== prevProps.dialogState) {
      const newState = this.getNewState(dialogState);
      this.refreshContext(newState);
    }
  }

  getNewState = (newProps = {}) => {
    const { onClickCallback } = this.props;

    let dialog;
    switch (newProps.type) {
      case 'alert': {
        dialog = (<DialogAlert dialogState={newProps} onClickCallback={onClickCallback} />);
        break;
      }
      case 'editFixedData': {
        dialog = (<DialogFixData dialogState={newProps} onClickCallback={onClickCallback} />);
        break;
      }
      case 'editHeaderRuleInfo': {
        dialog = (<DialogRuleHeaderInfo dialogState={newProps} onClickCallback={onClickCallback} />);
        break;
      }
      case 'editOperatorRules': {
        dialog = (<DialogOperatorRules dialogState={newProps} onClickCallback={onClickCallback} />);
        break;
      }
      case 'editOperatorRule': {
        dialog = (<DialogOperatorRule dialogState={newProps} onClickCallback={onClickCallback} />);
        break;
      }
      case 'editSubRules': {
        dialog = (<DialogRuleHeaders dialogState={newProps} onClickCallback={onClickCallback} />);
        break;
      }
      default: {
        break;
      }
    }

    return { dialog };
  }


  refreshContext = (newState = {}) => {
    this.setState(newState);
  }

  render() {
    const {
      dialog
    } = this.state;

    return (<div>{dialog}</div>);
  }
}

export default DialogRuleMgr;
