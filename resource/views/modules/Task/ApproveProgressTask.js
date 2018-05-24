/*
	@description: phê duyệt tiến độ công việc
	@author: duynn
	@since: 15/05/2018
*/
'use strict'
import React, { Component } from 'react';
import {
    Alert, ActivityIndicator, View, Text, Modal,
    FlatList, TouchableOpacity, Image,
    StyleSheet, DatePickerAndroid
} from 'react-native';

//constant
import {
    API_URL, HEADER_COLOR, EMPTY_STRING
} from '../../../common/SystemConstant';

//native-base
import {
    Form, Button, Icon as NBIcon, Text as NBText, Item, Input, Title, Picker,Toast,
    Container, Header, Content, Left, Right, Body, CheckBox, Label,Textarea,
    Tab, Tabs, TabHeading, ScrollableTab, List as NBList, ListItem as NBListItem, Radio
} from 'native-base';

//react-native-elements
import { ListItem, Icon, Slider } from 'react-native-elements';
//styles
import { DetailSignDocStyle } from '../../../assets/styles/SignDocStyle';
import { MenuStyle, MenuOptionStyle } from '../../../assets/styles/MenuPopUpStyle';
import { TabStyle } from '../../../assets/styles/TabStyle';

import { dataLoading, executeLoading } from '../../../common/Effect';
import { asyncDelay, unAuthorizePage, openSideBar, convertDateToString } from '../../../common/Utilities';

//lib
import { connect } from 'react-redux';
import renderIf from 'render-if';
import * as util from 'lodash';
import { MenuProvider, Menu, MenuTrigger, MenuOptions, MenuOption } from 'react-native-popup-menu';

//firebase
import { pushFirebaseNotify } from '../../../firebase/FireBaseClient';

class ApproveProgressTask extends Component {

    constructor(props){
        super(props);
        this.state = {
            userId: this.props.userInfo.ID,
            selected: '1',
            taskId: this.props.navigation.state.params.taskId,
            taskType: this.props.navigation.state.params.taskType,
            comment: EMPTY_STRING,
            executing: false
        }
    }

    onValueChange(value: string) {
        this.setState({
          selected: value
        });
    }

    onApproveProgressTask(){
        Alert.alert(
          'XÁC NHẬN PHẢN HỒI',
          'Bạn có chắc chắn muốn thực hiện việc này?',
          [
            {text: 'Đồng ý', onPress: () => this.approveProgressTask()},
            {text: 'Hủy bỏ', onPress: () => console.log('OK Pressed')},
          ]);
    }

    async approveProgressTask(){
        //mở modal xử lý
        this.setState({
            executing: true
        });
        
        const url = `${API_URL}/api/HscvCongViec/SaveApproveCompleteTask`;
        
        const result = await fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json; charset=utf-8',
            }, body: JSON.stringify({
                userId: this.state.userId,
                taskId: this.state.taskId,
                approveCompleteResult: this.state.selected,
                comment: this.state.comment
            })
        });

        const resultJson = await result.json();
        
        

        await asyncDelay(2000);
        
        this.setState({
            executing: false
        });

        if(resultJson.Status == true && !util.isNull(resultJson.GroupTokens) && !util.isEmpty(resultJson.GroupTokens)){
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
            text: resultJson.Status ? 'Cập nhật tiến độ công việc thành công' : 'Cập nhật tiến độ công việc không thành công',
            type: resultJson.Status ? 'success' : 'danger',
            buttonText: "OK",
            buttonStyle: { backgroundColor: '#fff' },
            buttonTextStyle: { color: resultJson.Status ? '#337321' :'#FF0033'},
            duration: 5000,
            onClose: ()=> {
                if(resultJson.Status){
                    this.navigateBack();
                }
            }
        });
    }

    navigateBack(){
        this.props.navigation.navigate('DetailTaskScreen', {
            taskId: this.state.taskId,
            taskType: this.state.taskType
        });
    }

    render(){
        return(
            <Container>
                <Header style={{ backgroundColor: HEADER_COLOR }}>
                    <Left>
                        <Button transparent onPress={() => this.navigateBack()}>
                            <Icon name='ios-arrow-dropleft-circle' size={30} color={'#fff'} type="ionicon" />
                        </Button>
                    </Left>

                    <Body>
                        <Title>
                            PHÊ DUYỆT TIẾN ĐỘ CÔNG VIỆC
                        </Title>
                    </Body>
                    <Right/>
                </Header>

                <Content>
                    <Form>
                        <Item stackedLabel>
                            <Label>Nội dung</Label>
                            <Input value={this.state.comment} onChangeText={(comment) => this.setState({comment})}/>
                        </Item>

                        <Item stackedLabel>
                            <Label>Đánh giá kết quả</Label>
                            <Picker mode='dropdown'
                            iosHeader='Chọn kết quả đánh giá'
                            iosIcon={<NBIcon name='ios-arrow-down-outline'/>}
                            style={{width: '100%'}}
                            selectedValue={this.state.selected}
                            onValueChange={this.onValueChange.bind(this)}>
                                <Picker.Item label='Duyệt' value='1'/>
                                <Picker.Item label='Trả lại' value='0'/>       
                            </Picker>
                        </Item>
                    </Form>

                    <Button iconLeft full rounded style={{backgroundColor: '#337321', marginTop: 20}} onPress={()=> this.onApproveProgressTask()}>
                        <NBIcon name='ios-checkmark-circle-outline' />
                        <NBText>PHÊ DUYỆT TIẾN ĐỘ</NBText>
                    </Button>
                </Content>

                {
                    executeLoading(this.state.executing)
                }
            </Container>
        );
    }
}

const mapStateToProps = (state)=> {
    return {
        userInfo: state.userState.userInfo
    }
}

export default connect(mapStateToProps)(ApproveProgressTask);