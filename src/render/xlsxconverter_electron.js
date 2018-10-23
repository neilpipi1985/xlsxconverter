import { applyMiddleware, createStore, combineReducers, bindActionCreators } from 'redux';
import thunk from 'redux-thunk';
import React from 'react';
import { render } from 'react-dom';
import { Provider, connect } from 'react-redux';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';

import reducers from './reducers';
import actions from './actions';
import Socket from './socket/electronsocket';

import app from './xlsxconverter/app';
import props from './xlsxconverter/props';

props.isWindowsRender(true);

// Grab the state from a global variable injected into the server-generated HTML
const preloadedState = window.__PRELOADED_STATE__;
// Allow the passed state to be garbage-collected
delete window.__PRELOADED_STATE__;

const store = createStore(combineReducers(reducers), preloadedState, applyMiddleware(thunk));

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(actions, dispatch);
};

const Main = connect(props.mapStateToProps, mapDispatchToProps)(app);

const theme = createMuiTheme({});
// Render the main component into the dom
render(
  (
    <Provider store={store}>
      <MuiThemeProvider theme={theme}>
        <Main Socket={Socket} />
      </MuiThemeProvider>
    </Provider>
  ), document.querySelector('#app')
);
