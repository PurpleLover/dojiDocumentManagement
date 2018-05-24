/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
} from 'react-native';
// import { Container, Header, Content, SwipeRow, View, Text, Icon, Button } from 'native-base';
//views
import { Root } from 'native-base';
import { CommonDrawerNavigator } from './resource/views/common/CommonDrawerNavigator';

//redux
import { Provider } from 'react-redux';
import { globalStore } from './resource/redux/common/GlobalStore'

export default class App extends Component {
  render() {
    return (
      <Provider store={globalStore}>
        <Root>
          <CommonDrawerNavigator/>
        </Root>
      </Provider>
    );
  }
}
