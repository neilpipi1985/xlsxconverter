import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  withMobileDialog, Dialog, DialogTitle, DialogContent, FormControlLabel,
  Checkbox, DialogActions, Button, TextField, FormControl, InputLabel, Select, MenuItem
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';

import DialogRuleMgr from '../dialogrulemgr';

const styles = ({
  formControl: {
    minWidth: 120,
  }
});

class DialogRuleInfo extends Component {
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
      const rule = data.rule || {};
      const ruleIndex = (data.ruleIndex > -1) ? data.ruleIndex : -1;
      const bookTypes = ['xlsx', 'csv'];
      const bookType = bookTypes.find((item) => { return (item === rule.bookType); }) || 'xlsx';

      Object.assign(newState, {
        dialogState: {
          type: '',
          data: {}
        },
        disableBtn: false,
        ruleIndex,
        lastName: rule.name || '',
        name: rule.name || '',
        enableMappingName: rule.enableMappingName || false,
        enableDateTime: rule.enableDateTime || false,
        bookTypes,
        bookType
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
      ruleIndex,
      lastName,
      name,
      enableMappingName,
      enableDatestamp,
      bookType
    } = this.state;

    switch (opts.action) {
      case 'close': {
        onClickCallback(opts);
        break;
      }
      case 'refreshDialog': {
        this.setState({
          dialogState: {
            type: opts.type || '',
            data: opts.data || {}
          }
        });
        break;
      }
      case 'delRuleAlarm': {
        this.setState({
          dialogState: {
            type: 'alert',
            data: {
              title: 'Alert',
              message: `Are you sure to Remove "${lastName || ''}" Rule`,
              btnList: [
                { label: 'Cancel', action: 'close', color: 'secondary' },
                { label: 'Confirm', action: 'delRule' }
              ]
            }
          }
        });
        break;
      }
      case 'delRule': {
        this.setState({
          dialogState: {
            type: opts.type || '',
            data: opts.data || {}
          }
        });
        onClickCallback({ action: opts.action, ruleIndex, name: lastName });
        break;
      }
      case 'saveRule': {
        onClickCallback({
          action: opts.action,
          ruleIndex,
          name: lastName,
          rule: { name, enableMappingName, enableDatestamp, bookType }
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
      dialogState,
      ruleIndex,
      name,
      enableMappingName,
      enableDatestamp,
      bookTypes,
      bookType
    } = this.state;

    return (
      <Dialog open aria-labelledby="alert-dialog-title">
        <DialogTitle id="dialog-title">Rule Setting</DialogTitle>
        <DialogContent>
          <TextField
            disabled={disableBtn}
            fullWidth
            label="Name of Rule"
            value={name}
            onChange={e => this.setState({ name: e.target.value })}
          />
          <FormControlLabel
            control={
              <Checkbox checked={enableMappingName} onChange={(e) => { this.setState({ enableMappingName: e.target.checked }); }} />
            }
            label="To Map The Import File/Sheet Name"
          />
          <FormControlLabel
            control={
              <Checkbox checked={enableDatestamp} onChange={(e) => { this.setState({ enableDatestamp: e.target.checked }); }} />
            }
            label="Timestamp"
          />
          <FormControl className={classes.formControl} disabled={disableBtn} fullWidth>
            <InputLabel htmlFor="name-input">Book Type</InputLabel>
            <Select value={bookType} onChange={(e) => { this.setState({ bookType: e.target.value }); }}>
              {
                bookTypes.map((item, i) => (<MenuItem key={`bookTypes${i + 1}`} value={item}>{item}</MenuItem>))
              }
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          {
            (ruleIndex > -1) ? <Button disabled={disableBtn} onClick={() => this.handleButtonClick({ action: 'delRuleAlarm' })} color="secondary">Remove</Button> : undefined
          }
          <Button disabled={disableBtn} onClick={() => this.handleButtonClick({ action: 'close' })} color="secondary">Cancel</Button>
          <Button disabled={disableBtn} onClick={() => this.handleButtonClick({ action: 'saveRule' })} color="primary" autoFocus>Confirm</Button>
        </DialogActions>
        <DialogRuleMgr dialogState={dialogState} onClickCallback={this.handleButtonClick} />
      </Dialog>
    );
  }
}

export default withMobileDialog()(withStyles(styles)(DialogRuleInfo));
