/**
 * @description: màn hình truy vấn thông tin người dùng
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
import { EMPTY_STRING, API_URL, Colors, EMTPY_DATA_MESSAGE } from '../../../common/SystemConstant';

//styles
import { LoginStyle } from '../../../assets/styles/LoginStyle';
import { NativeBaseStyle } from '../../../assets/styles/NativeBaseStyle';
import { moderateScale, verticalScale } from '../../../assets/styles/ScaleIndicator';

import { authenticateLoading } from '../../../common/Effect';
import { asyncDelay, emptyDataPage, convertDateTimeToString, convertDateToString } from '../../../common/Utilities'

//redux
import { connect } from 'react-redux';
import * as userAction from '../../../redux/modules/user/UserAction';

//fcm
import FCM, { FCMEvent } from 'react-native-fcm';

//images
const uriBackground = require('../../../assets/images/background.png');
const dojiBigIcon = require('../../../assets/images/doji-big-icon.png');
const showPasswordIcon = require('../../../assets/images/visible-eye.png');
const hidePasswordIcon = require('../../../assets/images/hidden-eye.png');
const userAvatar = require('../../../assets/images/avatar.png');

class AccountInfo extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      id: props.userInfo.ID,

      userName: EMPTY_STRING,
      fullName: EMPTY_STRING,
      email: EMPTY_STRING,
      dateOfBirth: EMPTY_STRING,
      mobilePhone: EMPTY_STRING,
      address: EMPTY_STRING,

      headerComponentsDisplayStatus: 'flex',

      isDisabledLoginButton: true,
      isRememberPassword: false,
      isHidePassword: true,
      passwordIconDisplayStatus: 'none',

      loading: false,
      logoMargin: 40,
    }
  }

  navigateBackToLogin = () => {
    this.props.navigation.navigate('ListIsNotProcessedScreen');
  }

  navigateToEditAccount = () => {
    this.props.navigation.navigate('AccountEditorScreen', {
      fullName: this.state.fullName,
      email: this.state.email,
      dateOfBirth: this.state.dateOfBirth,
      mobilePhone: this.state.mobilePhone,
      address: this.state.address,
    });
  }

  componentWillMount = async () => {
    const url = `${API_URL}/api/account/GetUserInfo/${this.state.id}`;
    let result = await fetch(url)
      .then(response=>response.json())
      .then(responseJson=>responseJson);

    console.log('Result sau khi mount = ', result);
    this.setState({
      userName: result.TENDANGNHAP,
      fullName: result.HOTEN,
      email: result.EMAIL,
      dateOfBirth: convertDateToString(result.NGAYSINH),
      mobilePhone: result.DIENTHOAI,
      address: result.DIACHI
    });
  }

  render() {
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
              TÀI KHOẢN
            </Title>
          </Body>
          <Right style={NativeBaseStyle.right}>
            {/* <Button transparent onPress={() => this.navigateToEditAccount()}>
              <Icon name='ios-save' size={moderateScale(40)} color={Colors.WHITE} type='ionicon' />
            </Button> */}
          </Right>
        </Header>
        <ImageBackground style={{ flex: 1 }}>
          <Content>
            <Form>
              <Item stackedLabel>
                <Label>Tên đăng nhập</Label>
                <Label style={{ fontSize: moderateScale(16, 1.3), color: Colors.BLACK }}>{this.state.userName}</Label>
              </Item>
              <Item stackedLabel>
                <Label>Họ và tên</Label>
                <Label style={{ fontSize: moderateScale(16, 1.3), color: Colors.BLACK }}>{this.state.fullName}</Label>
              </Item>
              <Item stackedLabel>
                <Label>Email</Label>
                <Label style={{ fontSize: moderateScale(16, 1.3), color: Colors.BLACK }}>{this.state.email}</Label>
              </Item>
              <Item stackedLabel>
                <Label>Ngày sinh</Label>
                <Label style={{ fontSize: moderateScale(16, 1.3), color: Colors.BLACK }}>{this.state.dateOfBirth}</Label>
              </Item>
              <Item stackedLabel>
                <Label>Điện thoại</Label>
                <Label style={{ fontSize: moderateScale(16, 1.3), color: Colors.BLACK }}>{this.state.mobilePhone}</Label>
              </Item>
              <Item stackedLabel last style={{height:'auto'}}>
                <Label>Địa chỉ</Label>
                <Label style={{ fontSize: moderateScale(16, 1.3), color: Colors.BLACK, marginBottom: verticalScale(15) }}>{this.state.address}</Label>
              </Item>
            </Form>
            <TouchableOpacity
              onPress={() => this.navigateToEditAccount()}
              style={[LoginStyle.formButtonLogin, {backgroundColor: '#da2032', marginTop: verticalScale(30)}]}
            >
              <Text style={[LoginStyle.formButtonText, {color: Colors.WHITE}]}>SỬA THÔNG TIN</Text>
            </TouchableOpacity>
          </Content>
        </ImageBackground>
        {
          authenticateLoading(this.state.loading)
        }
      </Container>
    );
  }
}

const mapStatetoProps = (state) => {
  return {
      userInfo: state.userState.userInfo
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    setUserInfo: (data) => dispatch(userAction.setUserInfo(data))
  }
}

export default connect(mapStatetoProps, mapDispatchToProps)(AccountInfo);