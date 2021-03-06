/*
	@description: xin lùi hạn công việc
	@author: duynn
	@since: 15/05/2018
*/
'use strict'
import React, { Component } from 'react';
import { DatePickerAndroid } from 'react-native';
//redux
import { connect } from 'react-redux';

//lib
import {
    Container, Header, Left, Body, Right,
    Button, Icon, Title, Form, Item, Label,
    Input, Content, Text, Toast
} from 'native-base';
import {
    Icon as RneIcon
} from 'react-native-elements';
import * as util from 'lodash';
import DatePicker from 'react-native-datepicker';

//utilities
import { API_URL, EMPTY_STRING, HEADER_COLOR, Colors } from '../../../common/SystemConstant';
import { asyncDelay, convertDateToString, convertDateTimeToString } from '../../../common/Utilities';
import { executeLoading } from '../../../common/Effect';
import { scale, verticalScale, moderateScale } from '../../../assets/styles/ScaleIndicator';

//firebase
import { pushFirebaseNotify } from '../../../firebase/FireBaseClient';

//styles
import { NativeBaseStyle } from '../../../assets/styles/NativeBaseStyle';

class RescheduleTask extends Component {
    constructor(props) {
        super(props);
        this.state = {
            userId: props.userInfo.ID,
            taskId: props.navigation.state.params.taskId,
            taskType: props.navigation.state.params.taskType,

            reason: EMPTY_STRING,
            currentDeadline: convertDateToString(props.navigation.state.params.currentDeadline),
            deadline: EMPTY_STRING,
            executing: false,
            chosenDate: null,
        }
    }

    setDate = (newDate) => {
        this.setState({
            chosenDate: newDate,
        })
    }

    navigateBackToDetail() {
        this.props.navigation.navigate('DetailTaskScreen', {
            taskId: this.state.taskId,
            taskType: this.state.taskType
        });
    }

    onSaveExtendTask = async () => {
        if (util.isNull(this.state.chosenDate) || util.isEmpty(this.state.chosenDate)) {
            Toast.show({
                text: 'Vui lòng nhập thời hạn xin lùi',
                type: 'danger',
                buttonText: "OK",
                buttonStyle: { backgroundColor: Colors.WHITE },
                buttonTextStyle: { color: Colors.RED_PANTONE_186C },
            });
        } else if (util.isNull(this.state.reason) || util.isEmpty(this.state.reason)) {
            Toast.show({
                text: 'Vui lòng nhập nguyên nhân xin lùi hạn',
                type: 'danger',
                buttonText: "OK",
                buttonStyle: { backgroundColor: Colors.WHITE },
                buttonTextStyle: { color: Colors.RED_PANTONE_186C },
            });
        } else {
            this.setState({
                executing: true
            });

            const url = `${API_URL}/api/HscvCongViec/SaveExtendTask`;
            const headers = new Headers({
                'Accept': 'application/json',
                'Content-Type': 'application/json; charset=utf-8'
            });

            const body = JSON.stringify({
                id: this.state.taskId,
                userId: this.state.userId,
                extendDate: this.state.chosenDate,
                reason: this.state.reason
            })

            const result = await fetch(url, {
                method: 'post',
                headers,
                body
            });

            const resultJson = await result.json();

            await asyncDelay(2000);

            this.setState({
                executing: false
            });

            if (resultJson.Status == true && !util.isNull(resultJson.GroupTokens) && !util.isEmpty(resultJson.GroupTokens)) {
                const message = this.props.userInfo.Fullname + ' đã gửi một yêu cầu lùi hạn công việc';
                const content = {
                    title: 'THÔNG BÁO LÙI HẠN CÔNG VIỆC',
                    message,
                    isTaskNotification: true,
                    targetScreen: 'DetailTaskScreen',
                    targetTaskId: this.state.taskId,
                    targetTaskType: this.state.taskType
                }

                resultJson.GroupTokens.forEach(token => {
                    pushFirebaseNotify(content, token, 'notification');
                })
            }

            //hiển thị kết quả xử lý
            Toast.show({
                text: resultJson.Status ? 'Gửi yêu cầu lùi hạn thành công' : resultJson.Message,
                type: resultJson.Status ? 'success' : 'danger',
                buttonText: "OK",
                buttonStyle: { backgroundColor: Colors.WHITE },
                buttonTextStyle: { color: resultJson.Status ? Colors.GREEN_PANTONE_364C : Colors.RED_PANTONE_186C },
                duration: 3000,
                onClose: () => {
                    if (resultJson.Status) {
                        this.navigateBackToDetail();
                    }
                }
            });
        }
    }

    render() {
        return (
            <Container>
                <Header style={{ backgroundColor: Colors.RED_PANTONE_186C }} hasTabs>
                    <Left style={NativeBaseStyle.left}>
                        <Button transparent onPress={() => this.navigateBackToDetail()}>
                            <RneIcon name='ios-arrow-round-back' size={moderateScale(40)} color={Colors.WHITE} type='ionicon' />
                        </Button>
                    </Left>

                    <Body style={NativeBaseStyle.body}>
                        <Title style={NativeBaseStyle.bodyTitle}>
                            XIN LÙI HẠN
                        </Title>
                    </Body>
                    <Right style={NativeBaseStyle.right} />
                </Header>

                <Content>
                    <Form>
                        <Item stackedLabel>
                            <Label>Ngày hoàn thành mong muốn</Label>
                            <Input editable={false} value={this.state.currentDeadline} />
                        </Item>

                        <Item stackedLabel style={{ height: verticalScale(100), justifyContent: 'center' }}>
                            <Label>Xin lùi tới ngày</Label>
                            <DatePicker
                                style={{ width: scale(300), alignSelf: 'center', marginTop: verticalScale(30) }}
                                date={this.state.chosenDate}
                                mode="date"
                                placeholder='Lùi tới ngày'
                                format='DD/MM/YYYY'
                                minDate={new Date()}
                                confirmBtnText='CHỌN'
                                cancelBtnText='BỎ'
                                customStyles={{
                                    dateIcon: {
                                        position: 'absolute',
                                        left: 0,
                                        top: 4,
                                        marginLeft: 0
                                    },
                                    dateInput: {
                                        marginLeft: scale(36)
                                    }
                                }}
                                onDateChange={this.setDate}
                            />
                        </Item>

                        <Item stackedLabel>
                            <Label>Nguyên nhân xin lùi</Label>
                            <Input value={this.state.reason}
                                onChangeText={(reason) => this.setState({ reason })} />
                        </Item>
                    </Form>

                    <Button block danger
                        style={{ backgroundColor: Colors.RED_PANTONE_186C, marginTop: verticalScale(20) }}
                        onPress={() => this.onSaveExtendTask()}>
                        <Text>
                            LÙI HẠN CÔNG VIỆC
                        </Text>
                    </Button>
                </Content>

                {
                    executeLoading(this.state.executing)
                }
            </Container>
        );
    }
}


const mapStateToProps = (state) => {
    return {
        userInfo: state.userState.userInfo
    }
}

export default connect(mapStateToProps)(RescheduleTask);
