import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  withMobileDialog, Dialog, DialogTitle, DialogContent, FormControlLabel, Checkbox,
  DialogActions, Button, TextField, FormControl, InputLabel, Select, MenuItem
} from '@material-ui/core';

import { withStyles } from '@material-ui/core/styles';

const styles = ({
  formControl: {
    minWidth: 120,
  }
});

class DialogHeaderRule extends Component {
  static propTypes = {
    classes: PropTypes.object.isRequired,
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

    if (dialogState.data !== prevProps.dialogState.data) {
      const newState = this.getNewState(dialogState);
      this.refreshContext(newState);
    }
  }

  getNewState = (newProps = {}) => {
    const data = newProps.data || {};

    const newState = {};

    if (!this.state) {
      const headerRule = data.headerRule || {};
      const importHeaders = data.importHeaders || [];

      Object.assign(newState, {
        disableBtn: false,
        isSubHeaderRules: data.isSubHeaderRules || false,
        headerRuleIndex: data.headerRuleIndex || 0,
        importHeaders,
        importHeader: importHeaders[0] || '',
        header: headerRule.header || '',
        refHeaders: JSON.stringify(headerRule.refHeaders || []),
        defaultVaule: headerRule.defaultVaule || '',
        isDefaultValue: headerRule.isDefaultValue || false,
        isRequireValue: headerRule.isRequireValue || false,
        enableUserFixed: headerRule.enableUserFixed || false,
        errorMessage: ''
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
      name,
      headerRuleIndex,
      header,
      importHeader,
      refHeaders,
      defaultVaule,
      isDefaultValue,
      isRequireValue,
      enableUserFixed
    } = this.state;

    switch (opts.action) {
      case 'close': {
        onClickCallback({ action: 'refreshDialog', type: '', data: {} });
        break;
      }
      case 'earseRefHeaders': {
        this.setState({
          refHeaders: JSON.stringify([])
        });
        break;
      }
      case 'addImportHeader': {
        const tmpRefHeaders = JSON.parse(refHeaders);
        const refHeader = tmpRefHeaders.find((item) => { return (item === importHeader); });
        if (refHeader === undefined) {
          tmpRefHeaders.push(importHeader);
          this.setState({
            refHeaders: JSON.stringify(tmpRefHeaders)
          });
        }
        break;
      }
      case 'delHeaderRule': {
        onClickCallback({
          action: opts.action,
          headerRuleIndex,
          name
        });
        break;
      }
      case 'saveHeaderRuleInfo': {
        onClickCallback({
          action: opts.action,
          headerRuleIndex,
          headerRule: {
            header,
            refHeaders: JSON.parse(refHeaders),
            defaultVaule,
            isDefaultValue,
            isRequireValue,
            enableUserFixed
          }
        });
        break;
      }
      default: {
        break;
      }
    }
  }

  render() {
    const { classes } = this.props;
    const {
      disableBtn,
      isSubHeaderRules,
      headerRuleIndex,
      header,
      defaultVaule,
      importHeaders,
      importHeader,
      refHeaders,
      isDefaultValue,
      isRequireValue,
      enableUserFixed,
      errorMessage
    } = this.state;

    return (
      <Dialog open aria-labelledby="alert-dialog-title">
        <DialogTitle id="dialog-title">Header Rule</DialogTitle>
        <DialogContent>
          {
            (errorMessage !== '') ? <div style={{ margin: '5px 0', color: '#F44336' }}>{errorMessage}</div> : undefined
          }
          <TextField
            disabled
            fullWidth
            label="Export Header"
            value={header}
          />
          <div>
            <FormControl className={classes.formControl} disabled={disableBtn} fullWidth>
              <InputLabel htmlFor="name-input">Reference Headers</InputLabel>
              <Select value={importHeader} onChange={(e) => { this.setState({ importHeader: e.target.value }); }}>
                {
                  importHeaders.map((item, i) => (<MenuItem key={`importHeaders${i + 1}`} value={item}>{item}</MenuItem>))
                }
              </Select>
            </FormControl>
            <Button disabled={disableBtn} onClick={() => this.handleButtonClick({ action: 'earseRefHeaders' })} variant="outlined" color="secondary">
              Earse
            </Button>
            <Button disabled={disableBtn} onClick={() => this.handleButtonClick({ action: 'addImportHeader' })} variant="outlined" color="primary">
              Add
            </Button>
            <TextField
              disabled={disableBtn}
              fullWidth
              label="Reference Headers from Import Headers"
              value={refHeaders}
            />
          </div>
          <TextField
            disabled={disableBtn}
            fullWidth
            label="Default Value"
            value={defaultVaule}
            onChange={e => this.setState({ defaultVaule: e.target.value })}
          />
          <FormControlLabel
            control={
              <Checkbox checked={isDefaultValue} onChange={(e) => { this.setState({ isDefaultValue: e.target.checked }); }} />
            }
            label="To Set Default Value"
          />
          <FormControlLabel
            control={
              <Checkbox checked={isRequireValue} onChange={(e) => { this.setState({ isRequireValue: e.target.checked }); }} />
            }
            label="To Require Header Value"
          />
          <FormControlLabel
            control={
              <Checkbox checked={enableUserFixed} onChange={(e) => { this.setState({ enableUserFixed: e.target.checked }); }} />
            }
            label="To Check Failed Data"
          />
        </DialogContent>
        <DialogActions>
          {
            (isSubHeaderRules && headerRuleIndex > -1) ? (
              <Button disabled={disableBtn} onClick={() => this.handleButtonClick({ action: 'delHeaderRule' })} color="secondary">Remove</Button>
            ) : undefined
          }
          <Button disabled={disableBtn} onClick={() => this.handleButtonClick({ action: 'close' })} color="secondary">Cancel</Button>
          <Button disabled={disableBtn} onClick={() => this.handleButtonClick({ action: 'saveHeaderRuleInfo' })} color="primary" autoFocus>Confirm</Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default withMobileDialog()(withStyles(styles)(DialogHeaderRule));
