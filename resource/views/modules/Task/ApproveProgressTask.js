/*
    @description: phê duyệt tiến độ công việc
    @author: duynn
    @since: 15/05/2018
*/
'use strict'
import React, { Component } from 'react';
import { Alert } from 'react-native'
//lib
import {
    Container, Header, Left, Body, Right,
    Icon, Title, Text, Form, Item, Label,
    Input, Picker, Button, Toast, Content,
    Textarea
} from 'native-base';

import { Icon as RneIcon } from 'react-native-elements';

//redux
import { connect } from 'react-redux';

//utilities
import { API_URL, EMPTY_STRING, Colors } from '../../../common/SystemConstant';
import { asyncDelay } from '../../../common/Utilities';
import { executeLoading } from '../../../common/Effect';
import { verticalScale, moderateScale } from '../../../assets/styles/ScaleIndicator';
import * as util from 'lodash';

//firebase
import { pushFirebaseNotify } from '../../../firebase/FireBaseClient';

//styles
import { NativeBaseStyle } from '../../../assets/styles/NativeBaseStyle';

class ApproveProgressTask extends Component {
    constructor(props) {
        super(props);

        this.state = {
            userId: props.userInfo.ID,

            taskId: props.navigation.state.params.taskId,
            taskType: props.navigation.state.params.taskType,

            content: EMPTY_STRING,
            selectedValue: '1',

            executing: false
        }
    }

    onValueChange(value) {
        this.setState({
            selectedValue: value
        })
    }


    navigateBackToDetail() {
        this.props.navigation.navigate('DetailTaskScreen', {
            taskId: this.state.taskId,
            taskType: this.state.taskType
        });
    }


    //kiểm tra chắc chắn phê duyệt tiến độ công việc
    onConfirmApproveCompleteTask = () => {
        if (util.isNull(this.state.content) || util.isEmpty(this.state.content)) {
            Toast.show({
                text: 'Vui lòng nhập nội dung phản hồi',
                type: 'danger',
                buttonText: "OK",
                buttonStyle: { backgroundColor: Colors.WHITE },
                buttonTextStyle: { color: Colors.RED_PANTONE_186C },
            });
        } else {
            Alert.alert(
                'XÁC NHẬN PHẢN HỒI',
                'Bạn có chắc chắn muốn thực hiện việc này?',
                [
                    { text: 'Đồng ý', onPress: () => this.onApproveCompleteTask() },
                    { text: 'Hủy bỏ', onPress: () => { } },
                ]);
        }
    }

    //phản hồi tiến độ công việc
    onApproveCompleteTask = async () => {
        this.setState({
            executing: true
        })

        const url = `${API_URL}/api/HscvCongViec/SaveApproveCompleteTask`;

        const headers = new Headers({
            'Accept': 'application/json',
            'Content-Type': 'application/json;charset=utf-8'
        });

        const body = JSON.stringify({
            userId: this.state.userId,
            taskId: this.state.taskId,
            approveCompleteResult: this.state.selectedValue,
            content: this.state.content
        })

        const result = await fetch(url, {
            method: 'POST',
            headers,
            body
        });

        const resultJson = await result.json();

        await asyncDelay(2000);

        this.setState({
            executing: false
        });

        if (resultJson.Status == true && !util.isNull(resultJson.GroupTokens) && !util.isEmpty(resultJson.GroupTokens)) {
            const message = this.props.userInfo.Fullname + ' đã phê duyệt tiến độ hoàn thành công việc';
            const content = {
                title: 'PHÊ DUYỆT TIẾN ĐỘ HOÀN THÀNH CÔNG VIỆC',
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

        Toast.show({
            text: resultJson.Status ? 'Phản hồi tiến độ công việc thành công' : resultJson.Message,
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

    render() {
        return (
            <Container>
                <Header style={{ backgroundColor: Colors.RED_PANTONE_186C }}>
                    <Left style={NativeBaseStyle.left}>
                        <Button transparent onPress={() => this.navigateBackToDetail()}>
                            <RneIcon name='ios-arrow-round-back' size={moderateScale(40)} color={Colors.WHITE} type='ionicon' />
                        </Button>
                    </Left>

                    <Body style={NativeBaseStyle.body}>
                        <Title style={NativeBaseStyle.bodyTitle}>
                            PHẢN HỒI TIẾN ĐỘ CÔNG VIỆC
                        </Title>
                    </Body>

                    <Right style={NativeBaseStyle.right}/>
                </Header>

                <Content>
                    <Form>
                        <Item stackedLabel style={{ height: verticalScale(200), justifyContent: 'center'}}>
                            <Label>Nội dung phản hồi</Label>
                            <Textarea rowSpan={5} style={{width: '100%'}} 
                            value={this.state.content} bordered
                            onChangeText={(content) => this.setState({ content })} />
                        </Item>

                        <Item stackedLabel>
                            <Label>
                                Đánh giá kết quả
                            </Label>

                            <Picker
                                iosHeader='Chọn kết quả đánh giá'
                                iosIcon={<Icon name='ios-arrow-down-outline' />}
                                style={{ width: '100%' }}
                                selectedValue={this.state.selectedValue}
                                onValueChange={this.onValueChange.bind(this)}
                                mode='dropdown'>
                                <Picker.Item label='Duyệt' value='1' />
                                <Picker.Item label='Trả về' value='0' />
                            </Picker>
                        </Item>

                        <Button block danger
                            style={{ backgroundColor: Colors.RED_PANTONE_186C, marginTop: verticalScale(20) }}
                            onPress={() => this.onConfirmApproveCompleteTask()}>
                            <Text>
                                PHẢN HỒI
                            </Text>
                        </Button>
                    </Form>
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

export default connect(mapStateToProps)(ApproveProgressTask);