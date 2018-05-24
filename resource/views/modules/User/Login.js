/**
 * @description: màn hình đăng nhập người dùng
 * @author: duynn
 * @since: 04/05/2018
 */
'use strict'
import React, { Component } from 'react'
import {
    AsyncStorage, View, ScrollView, Text, TextInput, Button,
    Keyboard, Animated, Image, ImageBackground,
    TouchableOpacity
} from 'react-native'

//lib
import { Container, Content, CheckBox, Form, Item, Input, Label, Toast } from 'native-base';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import * as util from 'lodash';
//constants
import { EMPTY_STRING, API_URL } from '../../../common/SystemConstant';

//styles
import { LoginStyle } from '../../../assets/styles/LoginStyle';

import { authenticateLoading } from '../../../common/Effect';
import { asyncDelay } from '../../../common/Utilities'

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

class Login extends Component {
    constructor(props) {
        super(props);

        this.state = {
            userName: EMPTY_STRING,
            password: EMPTY_STRING,

            headerAnimation: new Animated.Value(2),
            footerAnimation: 'flex',
            headerComponentsDisplayStatus: 'flex',

            isDisabledLoginButton: true,
            isRememberPassword: false,
            isHidePassword: true,
            passwordIconDisplayStatus: 'none',

            loading: false
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
            footerAnimation: 'none',
            headerComponentsDisplayStatus: 'none'
        }, () => {
            Animated.spring(this.state.headerAnimation, {
                toValue: 0
            }).start();
        });
    }

    _keyboardDidHide() {
        this.setState({
            footerAnimation: 'flex',
            headerComponentsDisplayStatus: 'flex'
        }, () => {
            Animated.spring(this.state.headerAnimation, {
                toValue: 2
            }).start();
        });
    }

    onRememberPassword() {
        this.setState({
            isRememberPassword: !this.state.isRememberPassword
        })
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
        //delay
        // const timeout = (ms)=> {
        //     return new Promise(result => setTimeout(result, ms));
        // };

        this.setState({
            loading: true
        });

        const userLoginResult = await fetch(API_URL + '/api/Account/Login', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json; charset=utf-8',
            },
            body: JSON.stringify({
                UserName: this.state.userName,
                Password: this.state.password
            })
        });

        const userLoginJsonResult = await userLoginResult.json();
        
        await asyncDelay(2000);

        if (!util.isNull(userLoginJsonResult)) {
            //tạo token cho thiết bị nếu lần đầu đăng nhập
            await FCM.getFCMToken().then(token => {
                userLoginJsonResult.Token = token;
            });
            

            //trường hợp lần đầu cài đặt thiết bị token có thể bị null;
            if(util.isNull(userLoginJsonResult.Token) || util.isEmpty(userLoginJsonResult.Token)){
                await FCM.on(FCMEvent.RefreshToken, token => {
                    userLoginJsonResult.Token = token;
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
                    userId: userLoginJsonResult.ID,
                    token: userLoginJsonResult.Token
                })
            }).then(response => response.json()).then( responseJson => {
                return responseJson;
            });
            
            if(activeTokenResult){
                AsyncStorage.setItem('userInfo', JSON.stringify(userLoginJsonResult)).then(() => {
                    this.props.setUserInfo(userLoginJsonResult);
                    this.props.navigation.navigate('App');
                });
            } else {
                this.setState({
                    loading: false
                }, () => {
                    Toast.show({
                        text: 'Hệ thống đang cập nhật! Vui lòng trở lại sau!',
                        textStyle: { fontSize: 11 },
                        buttonText: "OK",
                        buttonStyle:{ backgroundColor: "#acb7b1" },
                        duration: 5000
                    });
                });
            }
        } else {
            this.setState({
                loading: false
            }, () => {
                Toast.show({
                    text: 'Tên đăng nhập hoặc mật khẩu không chính xác!',
                    textStyle: { fontSize: 11 },
                    buttonText: "OK",
                    buttonStyle:{ backgroundColor: "#acb7b1" },
                    duration: 5000
                });
            });
        }
    }

    render() {
        return (
            <ImageBackground source={uriBackground} style={{ flex: 1 }}>
                <Container>
                    <Animated.View style={[
                        {
                            flex: this.state.headerAnimation
                        },
                        LoginStyle.formHeader
                    ]}>
                        <Image source={dojiBigIcon} style={[{ display: this.state.headerComponentsDisplayStatus }, LoginStyle.formHeaderIcon]} />
                        <Text style={[LoginStyle.formHeaderCompanyTitle,
                        { display: this.state.headerComponentsDisplayStatus }]}>
                            TẬP ĐOÀN VÀNG BẠC ĐÁ QUÝ DOJI
                        </Text>

                        <Text style={[LoginStyle.formHeaderSoftwareTitle,
                        { display: this.state.headerComponentsDisplayStatus }]}>
                            PHẦN MỀM QUẢN LÝ ĐIỀU HÀNH VĂN BẢN
                        </Text>

                        <Text style={[LoginStyle.formHeaderSoftwareName,
                        { display: this.state.headerComponentsDisplayStatus }]}>
                            D-OFFICE
                        </Text>
                    </Animated.View>
                    <ImageBackground source={uriRibbonBackground} style={LoginStyle.formContainerImageBackground}>
                        <View style={LoginStyle.formContainer}>
                            <View style={LoginStyle.formTitle}>
                                <Text style={LoginStyle.formTitleText}>
                                    ĐĂNG NHẬP HỆ THỐNG
                                </Text>
                            </View>

                            <View style={LoginStyle.formInputs}>
                                <View style={LoginStyle.formLabel}>
                                    <Text style={LoginStyle.formLabelText}>
                                        Tên đăng nhập
                                    </Text>
                                </View>
                                <View style={LoginStyle.formInput}>
                                    <TextInput
                                        onChangeText={(userName) => this.onChangeUserNameText(userName)}
                                        value={this.state.userName}
                                        style={LoginStyle.formInputText}
                                        underlineColorAndroid={'#f7f7f7'} 
                                        />
                                </View>

                                <View style={LoginStyle.formLabel}>
                                    <Text style={LoginStyle.formLabelText}>
                                        Mật khẩu
                                    </Text>
                                </View>
                                <View style={LoginStyle.formInput}>
                                    <TextInput
                                        value={this.state.password}
                                        onChangeText={(password) => this.onChangePasswordText(password)}
                                        secureTextEntry={this.state.isHidePassword}
                                        style={LoginStyle.formInputText}
                                        underlineColorAndroid={'#f7f7f7'} />
                                    <TouchableOpacity onPress={this.onChangePasswordVisibility.bind(this)} style={LoginStyle.formPasswordVisibility}>
                                        <Image source={(this.state.isHidePassword) ? showPasswordIcon : hidePasswordIcon}
                                            style={{ display: this.state.passwordIconDisplayStatus }} />
                                    </TouchableOpacity>

                                </View>
                            </View>

                            <View style={LoginStyle.formNotes}>
                                <View style={LoginStyle.formRemember}>
                                    <TouchableOpacity onPress={() => this.onRememberPassword()} style={LoginStyle.formRememberButton}>
                                        <CheckBox
                                            color={'#c4c4c4'}
                                            checked={this.state.isRememberPassword}
                                            onPress={() => this.onRememberPassword()} />
                                        <Text style={LoginStyle.formRememberText}>
                                            Nhớ mật khẩu
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                <View style={LoginStyle.formForgot}>
                                    <TouchableOpacity style={LoginStyle.formForgotButton}>
                                        <Text style={LoginStyle.formForgotText}>
                                            Quên mật khẩu?
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={LoginStyle.formButton}>
                                <Button
                                    disabled={this.state.isDisabledLoginButton}
                                    color={'#da2032'}
                                    onPress={() => this.onLogin()}
                                    title={'ĐĂNG NHẬP'}>
                                </Button>
                            </View>
                        </View>
                    </ImageBackground>
                    <Animated.View style={[LoginStyle.formFooter, { display: this.state.footerAnimation }]}>
                        <View style={LoginStyle.formIconContainer}>
                            <Image source={vietnameIcon} />
                        </View>

                        <View style={LoginStyle.formIconContainer}>
                            <Image source={dojiIcon} />
                        </View>

                        <View style={LoginStyle.formIconContainer}>
                            <Image source={vnrIcon} />
                        </View>
                    </Animated.View>

                    {
                        authenticateLoading(this.state.loading)
                    }
                </Container>
            </ImageBackground>
        );
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        setUserInfo: (data) => dispatch(userAction.setUserInfo(data))
    }
}

export default connect(null, mapDispatchToProps)(Login);