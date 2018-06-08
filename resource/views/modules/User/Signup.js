/**
 * @description: màn hình đăng nhập người dùng
 * @author: duynn
 * @since: 04/05/2018
 */
'use strict'
import React, { Component } from 'react'
import {
  AsyncStorage, View, ScrollView, Text, TextInput,
  Keyboard, Animated, Image, ImageBackground,
  TouchableOpacity
} from 'react-native'

//lib
import {
  Container, Content, CheckBox, Form, Item, Input, Label, Toast,
  Header, Right, Body, Left, Button, Title
} from 'native-base';
import { Icon } from 'react-native-elements';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import * as util from 'lodash';
//constants
import { EMPTY_STRING, API_URL, Colors } from '../../../common/SystemConstant';

//styles
import { LoginStyle } from '../../../assets/styles/LoginStyle';
import { NativeBaseStyle } from '../../../assets/styles/NativeBaseStyle';
import { moderateScale, verticalScale } from '../../../assets/styles/ScaleIndicator';

import { authenticateLoading } from '../../../common/Effect';
import { asyncDelay, emptyDataPage } from '../../../common/Utilities'

//redux
import { connect } from 'react-redux';
import * as userAction from '../../../redux/modules/user/UserAction';

//fcm
import FCM, { FCMEvent } from 'react-native-fcm';

//images
const uriBackground = require('../../../assets/images/background.png');
const uriRibbonBackground = require('../../../assets/images/ribbon-background.png');
const dojiBigIcon = require('../../../assets/images/doji-big-icon.png')
const dojiIcon = require('../../../assets/images/doji-icon.png');
const vietnameIcon = require('../../../assets/images/vietnam-icon.png');
const vnrIcon = require('../../../assets/images/vnr-icon.png');
const showPasswordIcon = require('../../../assets/images/visible-eye.png');
const hidePasswordIcon = require('../../../assets/images/hidden-eye.png');

class Signup extends Component {
  constructor(props) {
    super(props);

    this.state = {
      userName: EMPTY_STRING,
      email: EMPTY_STRING,
      password: EMPTY_STRING,

      headerComponentsDisplayStatus: 'flex',

      isDisabledLoginButton: true,
      isRememberPassword: false,
      isHidePassword: true,
      passwordIconDisplayStatus: 'none',

      loading: false,
      logoMargin: 40,
    }

    this._keyboardDidShow = this._keyboardDidShow.bind(this);
    this._keyboardDidHide = this._keyboardDidHide.bind(this);
  }

  componentWillMount() {
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow);
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);
  }

  _keyboardDidShow() {
    this.setState({
      logoMargin: 20,
    })
  }

  _keyboardDidHide() {
    this.setState({
      logoMargin: 40,
    })
  }

  onRememberPassword() {
    this.setState({
      isRememberPassword: !this.state.isRememberPassword
    })
  }

  onChangeEmailText(email) {
    this.setState({
      email
    }, () => {
      this.setState({
        isDisabledLoginButton: (email.length <= 0 || this.state.password.length <= 0)
      });
    });
  }

  onChangeUserNameText(userName) {
    this.setState({
      userName
    }, () => {
      this.setState({
        isDisabledLoginButton: (userName.length <= 0 || this.state.password.length <= 0)
      });
    });
  }

  onChangePasswordText(password) {
    if (password.length > 0) {
      this.setState({
        password,
        passwordIconDisplayStatus: 'flex'
      }, () => {
        if (this.state.userName.length > 0) {
          this.setState({
            isDisabledLoginButton: false
          })
        }
      });
    } else {
      this.setState({
        isHidePassword: true,
        password,
        passwordIconDisplayStatus: 'none'
      }, () => {
        this.setState({
          isDisabledLoginButton: true
        })
      })
    }
  }

  onChangePasswordVisibility() {
    //show and hide password
    this.setState({
      isHidePassword: !this.state.isHidePassword
    });
  }

  async onLogin() {

    this.setState({
      loading: true
    });

    if (this.state.userName.length<6 || this.state.userName.length>16) {
      this.setState({
        loading: false
      }, () => {
        Toast.show({
          text: 'Tên đăng nhập phải có 6 - 16 kí tự',
          textStyle: { fontSize: moderateScale(12, 1.5) },
          buttonText: "OK",
          buttonStyle: { backgroundColor: "#acb7b1" },
          duration: 3000
        });
      });
    }

    if (!this.state.email.match(/\S+@\S+\.\S+/)) {
      this.setState({
        loading: false
      }, () => {
        Toast.show({
          text: 'Hãy nhập đúng Email',
          textStyle: { fontSize: moderateScale(12, 1.5) },
          buttonText: "OK",
          buttonStyle: { backgroundColor: "#acb7b1" },
          duration: 3000
        });
      });
    }

    if (!this.state.password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[!@#$%^&*])(?=.*[A-Z])[0-9a-zA-Z!@#$%^&*]{8,}$/)) {
      this.setState({
        loading: false
      }, () => {
        Toast.show({
          text: 'Mật khẩu phải có ít nhất 8 kí tự, 1 kí tự số,\n1 kí tự viết hoa và 1 kí tự đặc biệt',
          textStyle: { fontSize: moderateScale(12, 1.5) },
          buttonText: "OK",
          buttonStyle: { backgroundColor: "#acb7b1" },
          duration: 3000
        });
      });
    }

    

    const url = `${API_URL}/api/Account/Login`;
    const headers = new Headers({
      'Accept': 'application/json',
      'Content-Type': 'application/json; charset=utf-8',
    });

    const body = JSON.stringify({
      UserName: this.state.userName,
      Password: this.state.password
    });

    const result = await fetch(url, {
      method: 'POST',
      headers,
      body
    });

    const resultJson = await result.json();

    await asyncDelay(2000);

    if (!util.isNull(resultJson)) {
      //tạo token cho thiết bị nếu lần đầu đăng nhập
      await FCM.getFCMToken().then(token => {
        resultJson.Token = token;
      });


      //trường hợp lần đầu cài đặt thiết bị token có thể bị null;
      if (util.isNull(resultJson.Token) || util.isEmpty(resultJson.Token)) {
        await FCM.on(FCMEvent.RefreshToken, token => {
          resultJson.Token = token;
        });
      }

      //cập nhật token vào csdl qua api

      const activeTokenResult = await fetch(`${API_URL}/api/Account/ActiveUserToken`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify({
          userId: resultJson.ID,
          token: resultJson.Token
        })
      }).then(response => response.json()).then(responseJson => {
        return responseJson;
      });

      if (activeTokenResult) {
        AsyncStorage.setItem('userInfo', JSON.stringify(resultJson)).then(() => {
          this.props.setUserInfo(resultJson);
          this.props.navigation.navigate('App');
        });
      } else {
        this.setState({
          loading: false
        }, () => {
          Toast.show({
            text: 'Hệ thống đang cập nhật! Vui lòng trở lại sau!',
            textStyle: { fontSize: moderateScale(12, 1.5) },
            buttonText: "OK",
            buttonStyle: { backgroundColor: "#acb7b1" },
            duration: 3000
          });
        });
      }
    } else {
      this.setState({
        loading: false
      }, () => {
        Toast.show({
          text: 'Thông tin đăng nhập không chính xác!',
          textStyle: { fontSize: moderateScale(12, 1.5) },
          buttonText: "OK",
          buttonStyle: { backgroundColor: "#acb7b1" },
          duration: 3000
        });
      });
    }
  }

  navigateBackToLogin = () => {
    this.props.navigation.navigate('LoginScreen');
  }

  render() {
    const { fullName, email, password } = this.state;
    const toggleLoginStyleButton = (fullName !== EMPTY_STRING && email !== EMPTY_STRING && password !== EMPTY_STRING) ? { backgroundColor: '#da2032' } : { backgroundColor: 'lightgrey' };
    const toggleLoginStyleText = (fullName !== EMPTY_STRING && email !== EMPTY_STRING && password !== EMPTY_STRING) ? { color: 'white' } : { color: 'grey' };
    return (
      <Container>
        <Header style={{ backgroundColor: Colors.RED_PANTONE_186C }}>
          <Left style={NativeBaseStyle.left}>
            <Button transparent onPress={() => this.navigateBackToLogin()}>
              <Icon name='ios-arrow-round-back' size={moderateScale(40)} color={Colors.WHITE} type='ionicon' />
            </Button>
          </Left>

          <Body style={NativeBaseStyle.body}>
            <Title style={NativeBaseStyle.bodyTitle}>
              ĐĂNG KÝ
            </Title>
          </Body>
          <Right style={NativeBaseStyle.right} />
        </Header>
        <ImageBackground source={uriBackground} style={{ flex: 1 }}>
          <Content>
            <Form>
              <View style={{justifyContent:'center', flexDirection:'row', marginTop:verticalScale(this.state.logoMargin)}}>
                <Image source={dojiBigIcon} />
              </View>
              <Item stackedLabel>
                <Label>Tên đăng nhập</Label>
                <Input
                  onChangeText={(userName) => this.onChangeUserNameText(userName)}
                  value={this.state.userName}
                  autoCorrect={false}
                />
              </Item>
              <Item stackedLabel>
                <Label>Email</Label>
                <Input
                  onChangeText={(email) => this.onChangeEmailText(email)}
                  value={this.state.email}
                  keyboardType={'email-address'}
                  autoCorrect={false}
                />
              </Item>
              <Item stackedLabel last>
                <Label>Mật khẩu</Label>
                <Input
                  onChangeText={(password) => this.onChangePasswordText(password)}
                  value={this.state.password}
                  secureTextEntry={this.state.isHidePassword}
                  autoCorrect={false}
                />
              </Item>
              <View style={[LoginStyle.formInputs, LoginStyle.formButton]}>
                <TouchableOpacity
                  disabled={this.state.isDisabledLoginButton}
                  onPress={() => this.onLogin()}
                  style={[LoginStyle.formButtonLogin, toggleLoginStyleButton]}
                >
                  <Text style={[LoginStyle.formButtonText, toggleLoginStyleText]}>ĐĂNG KÝ</Text>
                </TouchableOpacity>
              </View>
            </Form>
          </Content>
        </ImageBackground>
        {
          authenticateLoading(this.state.loading)
        }
      </Container>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    setUserInfo: (data) => dispatch(userAction.setUserInfo(data))
  }
}

export default connect(null, mapDispatchToProps)(Signup);