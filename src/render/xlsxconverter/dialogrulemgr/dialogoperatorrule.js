import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  withMobileDialog, Dialog, DialogTitle, DialogContent, TextField, FormControlLabel, Checkbox,
  DialogActions, Button, FormControl, InputLabel, Select, MenuItem
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';

import RuleMgr from '../../../rulemgr';

const styles = ({
  formControl: {
    minWidth: 120,
  }
});

class DialogOperatorRule extends Component {
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

  getOperator = (type = 'string', isFilterRules) => {
    let operators = [];
    if (isFilterRules) {
      operators = Object.keys(RuleMgr.RelationalOperators);
    } else if (type === 'string') {
      operators = Object.keys(RuleMgr.StrOperators);
    } else if (type === 'number') {
      operators = Object.keys(RuleMgr.MathOperators);
    }
    return operators;
  }

  getNewState = (newProps = {}) => {
    const data = newProps.data || {};
    const newState = {};

    if (!this.state) {
      const rule = data.rule || {};
      const isFilterRules = data.isFilterRules || false;

      const types = ['string', 'number'];
      if (isFilterRules) {
        types.push('stringLength');
      }
      const type = types.find((item) => { return item === rule.type; }) || 'string';
      const operators = this.getOperator(type, isFilterRules);
      const operator = operators.find((item) => { return item === rule.operator; }) || operators[0];

      const isObject = ((typeof rule.value).toString() === 'object');

      Object.assign(newState, {
        dialogState: {
          type: '',
          data: {}
        },
        disableBtn: false,
        isFilterRules,
        name: data.name || '',
        ruleIndex: (data.ruleIndex > -1) ? data.ruleIndex : -1,
        types,
        type,
        operators,
        operator,
        isObject,
        value: isObject ? JSON.stringify(rule.value || '') : (rule.value || ''),
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
      ruleIndex,
      type,
      operator,
      isObject,
      value
    } = this.state;

    switch (opts.action) {
      case 'close': {
        onClickCallback({
          action: 'refreshDialog',
          type: '',
          data: {}
        });
        break;
      }
      case 'delRule': {
        onClickCallback({
          action: opts.action,
          ruleIndex
        });
        break;
      }
      case 'saveRule': {
        try {
          onClickCallback({
            action: opts.action,
            ruleIndex,
            rule: { type, operator, value: isObject ? JSON.parse(value) : value }
          });
        } catch (err) {
          this.setState({
            errorMessage: 'Value is not JSON'
          });
        }
        break;
      }
      default: {
        break;
      }
    }
  }

  chageType = (type = 'string') => {
    const { operator, isFilterRules } = this.state;
    const operators = this.getOperator(type, isFilterRules);
    const tmpOperator = operators.find((item) => { return item === operator; }) || operators[0];
    this.setState({
      type,
      operators,
      operator: tmpOperator
    });
  }

  render() {
    const { classes } = this.props;
    const {
      disableBtn,
      isFilterRules,
      ruleIndex,
      name,
      types,
      type,
      operators,
      operator,
      isObject,
      value,
      errorMessage
    } = this.state;

    return (
      <Dialog open aria-labelledby="alert-dialog-title">
        <DialogTitle id="dialog-title">{`${isFilterRules ? 'Filter' : 'Operator'} Rule of "${name}"`}</DialogTitle>
        <DialogContent>
          {
            (errorMessage !== '') ? <div style={{ margin: '5px 0', color: '#F44336' }}>{errorMessage}</div> : undefined
          }
          <FormControl className={classes.formControl} disabled={disableBtn} fullWidth>
            <InputLabel htmlFor="name-input">Type</InputLabel>
            <Select value={type} onChange={(e) => { this.chageType(e.target.value); }}>
              {
                types.map((item, i) => (<MenuItem key={`type${i + 1}`} value={item}>{item}</MenuItem>))
              }
            </Select>
          </FormControl>
          <FormControl className={classes.formControl} disabled={disableBtn} fullWidth>
            <InputLabel htmlFor="name-input">Operator</InputLabel>
            <Select value={operator} onChange={(e) => { this.setState({ operator: e.target.value }); }}>
              {
                operators.map((item, i) => (<MenuItem key={`operator${i + 1}`} value={item}>{item}</MenuItem>))
              }
            </Select>
          </FormControl>
          <FormControlLabel
            control={
              <Checkbox checked={isObject} onChange={(e) => { this.setState({ isObject: e.target.checked }); }} />
            }
            label="Object Value"
          />
          <TextField
            disabled={disableBtn}
            fullWidth
            label="Value"
            value={value}
            onChange={e => this.setState({ value: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          {
            (ruleIndex > -1) ? <Button disabled={disableBtn} onClick={() => this.handleButtonClick({ action: 'delRule' })} color="secondary">Remove</Button> : undefined
          }
          <Button disabled={disableBtn} onClick={() => this.handleButtonClick({ action: 'close' })} color="secondary">Cancel</Button>
          <Button disabled={disableBtn} onClick={() => this.handleButtonClick({ action: 'saveRule' })} color="primary" autoFocus>Confirm</Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default withMobileDialog()(withStyles(styles)(DialogOperatorRule));
