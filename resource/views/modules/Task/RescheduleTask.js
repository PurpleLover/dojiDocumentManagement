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
import { asyncDelay, convertDateToString } from '../../../common/Utilities';
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
            userId: this.props.userInfo.ID,
            taskId: this.props.navigation.state.params.taskId,
            taskType: this.props.navigation.state.params.taskType,

            reason: EMPTY_STRING,
            deadline: EMPTY_STRING,
            executing: false,
            chosenDate: new Date(),
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

    // onOpenCalendar = async () => {
    //     try {
    //         const { action, year, month, day } = await DatePickerAndroid.open({
    //             date: new Date()
    //         });

    //         if (action !== DatePickerAndroid.dissmissedAction) {
    //             if (day && month && year) {
    //                 if (day < 10) {
    //                     day = '0' + day;
    //                 }
    //                 if (month < 10) {
    //                     month = '0' + (month + 1);
    //                 }

    //                 const deadline = day + '/' + month + '/' + year;

    //                 this.setState({
    //                     deadline
    //                 });
    //             }
    //         }
    //     } catch ({ code, message }) {
    //         console.warn('Open datepicker error', err);
    //     }
    // }

    onSaveExtendTask = async () => {
        this.setState({
            deadline: convertDateToString(this.state.chosenDate),
        });
        if (util.isNull(this.state.deadline) || util.isEmpty(this.state.deadline)) {
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

            const url = `${API_URL}/api/HscvCongViec/SaveExtendTask?id=${this.state.taskId}&userId=${this.state.userId}&extendDate=${this.state.deadline}&reason=${this.state.reason}`;
            const headers = new Headers({
                'Accept': 'application/json',
                'Content-Type': 'application/json; charset=utf-8'
            });

            const result = await fetch(url, {
                method: 'post',
                headers
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
                text: resultJson.Status ? 'Xin lùi hạn công việc thành công' : 'Xin lùi hạn công việc không thành công',
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
                        <Item>
                            <DatePicker
                                style={{ width: scale(300), alignSelf: 'center', marginTop: verticalScale(30) }}
                                date={this.state.chosenDate}
                                mode="date"
                                placeholder='Hạn hoàn thành'
                                format='YYYY-MM-DD'
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
                            {/* <Input placeholder='Xin lùi tới ngày' value={this.state.deadline} editable={false}
                                onChangeText={(deadline) => this.setState({ deadline })} />
                            <Icon active name='ios-calendar-outline' onPress={() => this.onOpenCalendar()} /> */}
                        </Item>

                        <Item>
                            <Input placeholder='Nguyên nhân xin lùi'
                                value={this.state.reason}
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
