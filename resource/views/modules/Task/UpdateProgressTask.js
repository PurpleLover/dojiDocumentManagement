/*
    @description: cập nhật tiến độ công việc
    @author: duynn
    @since: 15/05/2018
*/
'use strict'
import React, { Component } from 'react';

//redux
import { connect } from 'react-redux';

//lib
import {
    Container, Header, Left, Text, Content, Label, Toast,
    Body, Right, Icon, Title, Button, Form, Item, Input
} from 'native-base';
import { Icon as RneIcon } from 'react-native-elements';
import Slider from 'react-native-slider';
import * as util from 'lodash';

//utilities
import {
    API_URL, HEADER_COLOR, EMPTY_STRING, LOADER_COLOR, Colors
} from '../../../common/SystemConstant';
import { asyncDelay } from '../../../common/Utilities';
import { executeLoading } from '../../../common/Effect';
import { verticalScale, scale } from '../../../assets/styles/ScaleIndicator';

//firebase
import { pushFirebaseNotify } from '../../../firebase/FireBaseClient';

class UpdateProgressTask extends Component {
    constructor(props) {
        super(props);

        this.progressInitialValue = this.props.navigation.state.params.progressValue;
        this.state = {
            userId: props.userInfo.ID,

            taskId: props.navigation.state.params.taskId,
            taskType: props.navigation.state.params.taskType,

            progressValue: this.props.navigation.state.params.progressValue,
            comment: EMPTY_STRING,

            executing: false,
        }
    }

    onUpdateProgressTask = async () => {
        if (util.isNull(this.state.comment) || util.isEmpty(this.state.comment)) {
            Toast.show({
                text: 'Vui lòng nhập nội dung',
                type: 'danger',
                buttonText: "OK",
                buttonStyle: { backgroundColor: Colors.WHITE },
                buttonTextStyle: { color: Colors.RED_PANTONE_186C },
            });
        } else {
            this.setState({
                executing: true
            })

            const url = `${API_URL}/api/HscvCongViec/UpdateProgressTask`;
            const headers = new Headers({
                'Accept': 'application/json',
                'Content-Type': 'application/json; charset=utf-8'
            });
            const body = JSON.stringify({
                userId: this.state.userId,
                taskId: this.state.taskId,
                percentComplete: this.state.progressValue,
                comment: this.state.comment
            });

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
                const message = this.props.userInfo.Fullname + ' đã cập nhật tiến độ một công việc';
                const content = {
                    title: 'CẬP NHẬT TIẾN ĐỘ CÔNG VIỆC',
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
                text: resultJson.Status ? 'Cập nhật tiến độ công việc thành công' : 'Cập nhật tiến độ công việc không thành công',
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

    navigateBackToDetail = () => {
        this.props.navigation.navigate('DetailTaskScreen', {
            taskId: this.state.taskId,
            taskType: this.state.taskType
        });
    }


    render() {
        return (
            <Container>
                <Header style={{ backgroundColor: Colors.RED_PANTONE_186C }}>
                    <Left style={{flex:1}}>
                        <Button transparent onPress={() => this.navigateBackToDetail()}>
                            <RneIcon name='ios-arrow-round-back' size={verticalScale(40)} color={Colors.WHITE} type='ionicon' />
                        </Button>
                    </Left>

                    <Body style={{flex:3}}>
                        <Title style={{color:'#fff', fontWeight:'bold'}}>
                            CẬP NHẬT TIẾN ĐỘ CÔNG VIỆC
                        </Title>
                    </Body>

                    <Right style={{flex:1}}>
                    </Right>
                </Header>

                <Content>
                    <Slider
                        step={1}
                        minimumValue={0}
                        maximumValue={100}
                        minimumTrackTintColor={Colors.RED_PANTONE_186C}
                        maximumTrackTintColor={Colors.WHITE}
                        value={this.progressInitialValue}
                        onValueChange={progressValue => this.setState({ progressValue })}
                        thumbStyle={{
                            height: verticalScale(50),
                            width: scale(25),
                            backgroundColor: Colors.WHITE,
                            borderRadius: 4,
                            borderColor: '#cccccc',
                            borderWidth: 1
                        }}
                        trackStyle={{
                            height: verticalScale(30),
                            borderWidth: 1,
                            borderColor: '#cccccc'
                        }}

                        style={{
                            borderRadius: 4,
                            marginHorizontal: scale(5),
                            marginVertical: verticalScale(50),
                            height: verticalScale(50),

                        }} />

                    <Form>
                        <Item stackedLabel>
                            <Label>Phần trăm hoàn thành (%)</Label>
                            <Input editable={false} value={this.state.progressValue.toString()} />
                        </Item>

                        <Item stackedLabel>
                            <Label>Nội dung</Label>
                            <Input value={this.state.comment} onChangeText={(comment) => this.setState({ comment })} />
                        </Item>

                        <Button block danger
                            style={{ backgroundColor: Colors.RED_PANTONE_186C, marginTop: verticalScale(20) }}
                            onPress={() => this.onUpdateProgressTask()}>
                            <Text>
                                CẬP NHẬT TIẾN ĐỘ CÔNG VIỆC
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

export default connect(mapStateToProps)(UpdateProgressTask);



