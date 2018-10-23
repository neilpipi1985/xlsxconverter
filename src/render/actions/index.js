import {
  REFRESH_SIZE_STATE, REFRESH_SYS_STATE, REFRESH_PANEL_STATE, REFRESH_DIALOG_STATE, REFRESH_SNACKBAR_STATE
} from './actionstype';


function refreshSize(opts = {}) {
  return (dispatch) => {
    dispatch({ type: REFRESH_SIZE_STATE, data: opts });
  };
}

function refreshSys(opts = {}) {
  return (dispatch) => {
    dispatch({ type: REFRESH_SYS_STATE, data: opts });
  };
}

function refreshPanel(opts = {}) {
  return (dispatch) => {
    dispatch({ type: REFRESH_PANEL_STATE, data: opts });
  };
}

function refreshDialog(opts = {}) {
  return (dispatch) => {
    dispatch({ type: REFRESH_DIALOG_STATE, data: opts });
  };
}

function refreshSnackbar(opts = {}) {
  return (dispatch) => {
    dispatch({ type: REFRESH_SNACKBAR_STATE, data: opts });
  };
}

const actions = {
  refreshSize,
  refreshSys,
  refreshPanel,
  refreshDialog,
  refreshSnackbar
};

export default actions;
