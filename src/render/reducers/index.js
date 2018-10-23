import {
  INIT_SIZE_STATE, REFRESH_SIZE_STATE,
  INIT_SYS_STATE, REFRESH_SYS_STATE,
  INIT_PANEL_STATE, REFRESH_PANEL_STATE,
  INIT_DIALOG_STATE, REFRESH_DIALOG_STATE,
  INIT_SNACKBAR_STATE, REFRESH_SNACKBAR_STATE
} from '../actions/actionstype';

const DEFAULT_SIZE_STATE = Object.freeze({ pageSize: {}, panelSize: {} });
const DEFAULT_SYS_STATE = Object.freeze({});
const DEFAULT_PANEL_STATE = Object.freeze({ type: '' });
const DEFAULT_DIALOG_STATE = Object.freeze({ type: '' });
const DEFAULT_SNACKBAR_STATE = Object.freeze({ open: false, message: '', autoHideDuration: 3000 });

function sizeState(state = DEFAULT_SIZE_STATE, action = {}) {
  switch (action.type) {
    case REFRESH_SIZE_STATE:
      return Object.assign({}, state, action.data);
    case INIT_SIZE_STATE:
      return Object.assign({}, DEFAULT_SIZE_STATE);
    default:
      return state;
  }
}

function sysState(state = DEFAULT_SYS_STATE, action = {}) {
  switch (action.type) {
    case REFRESH_SYS_STATE:
      return Object.assign({}, state, action.data);
    case INIT_SYS_STATE:
      return Object.assign({}, DEFAULT_SYS_STATE);
    default:
      return state;
  }
}

function panelState(state = DEFAULT_PANEL_STATE, action = {}) {
  switch (action.type) {
    case REFRESH_PANEL_STATE:
      return Object.assign({}, state, action.data);
    case INIT_PANEL_STATE:
      return Object.assign({}, DEFAULT_PANEL_STATE);
    default:
      return state;
  }
}

function dialogState(state = DEFAULT_DIALOG_STATE, action = {}) {
  switch (action.type) {
    case REFRESH_DIALOG_STATE:
      return Object.assign({}, state, action.data);
    case INIT_DIALOG_STATE:
      return Object.assign({}, DEFAULT_DIALOG_STATE);
    default:
      return state;
  }
}

function snackbarState(state = DEFAULT_SNACKBAR_STATE, action = {}) {
  switch (action.type) {
    case REFRESH_SNACKBAR_STATE:
      return Object.assign({}, state, action.data);
    case INIT_SNACKBAR_STATE:
      return Object.assign({}, DEFAULT_SNACKBAR_STATE);
    default:
      return state;
  }
}

const reducers = {
  sizeState,
  sysState,
  panelState,
  dialogState,
  snackbarState
};

export default reducers;
