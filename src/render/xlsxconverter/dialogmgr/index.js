import React, { Component } from 'react';
import PropTypes from 'prop-types';

import DialogAlert from './dialogalert';
import DialogAppInfo from './dialogappinfo';
import DialogWebLogin from './dialogweblogin';
import DialogSysSetting from './dialogsyssetting';
import DialogRuleTemplate from './dialogruletemplate';
import DialogRuleInfo from './dialogruleinfo';
import DialogRuleHeaders from './dialogruleheaders';
import DialogConvertFileSetting from './dialogconvertfilesetting';
import DialogUploadRules from './dialoguploadrules';
import DialogFixDataList from './dialogfixdatalist';

class DialogMgr extends Component {
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
      case 'appInfo': {
        dialog = (<DialogAppInfo dialogState={newProps} onClickCallback={onClickCallback} />);
        break;
      }
      case 'login': {
        dialog = (<DialogWebLogin dialogState={newProps} onClickCallback={onClickCallback} />);
        break;
      }
      case 'getSysSetting': {
        dialog = (<DialogSysSetting dialogState={newProps} onClickCallback={onClickCallback} />);
        break;
      }
      case 'fixDataList': {
        dialog = (<DialogFixDataList dialogState={newProps} onClickCallback={onClickCallback} />);
        break;
      }
      case 'getRuleTemplate': {
        dialog = (<DialogRuleTemplate dialogState={newProps} onClickCallback={onClickCallback} />);
        break;
      }
      case 'editRuleInfo': {
        dialog = (<DialogRuleInfo dialogState={newProps} onClickCallback={onClickCallback} />);
        break;
      }
      case 'editRuleHeaders': {
        dialog = (<DialogRuleHeaders dialogState={newProps} onClickCallback={onClickCallback} />);
        break;
      }
      case 'getConvertFileSetting': {
        dialog = (<DialogConvertFileSetting dialogState={newProps} onClickCallback={onClickCallback} />);
        break;
      }
      case 'getUploadRulesSetting': {
        dialog = (<DialogUploadRules dialogState={newProps} onClickCallback={onClickCallback} />);
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

export default DialogMgr;
