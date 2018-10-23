let isWindowsRender;

const mapStateToProps = (state = {}) => {
  return {
    isWindowsRender,
    socket: state.sysState.socket || {},
    toolbarState: {
      panelType: state.panelState.type
    },
    panelState: {
      isWindowsRender,
      type: state.panelState.type,
      data: state.panelState.data,
      size: state.sizeState.panelSize
    },
    dialogState: {
      isWindowsRender,
      type: state.dialogState.type,
      data: state.dialogState.data,
      size: state.sizeState.dialogSize,
    },
    snackbarState: state.snackbarState
  };
};

class Props {
  static isWindowsRender(isWindows) {
    isWindowsRender = isWindows;
  }

  static get mapStateToProps() {
    return mapStateToProps;
  }
}

export default Props;
