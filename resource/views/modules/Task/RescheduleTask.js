/*
	@description: xin lùi hạn công việc
	@author: duynn
	@since: 15/05/2018
*/
'use strict'
import React, { Component } from 'react';
import {
    Alert,ActivityIndicator, View, Text, Modal,
    FlatList, TouchableOpacity, Image,
    StyleSheet, DatePickerAndroid
} from 'react-native';
import { dataLoading, executeLoading } from '../../../common/Effect';

//constant
import {
    API_URL, HEADER_COLOR
} from '../../../common/SystemConstant';

//native-base
import {
    Form, Button, Icon as NBIcon, Text as NBText, Item, Input, Title, Toast,
    Container, Header, Content, Left, Right, Body, CheckBox, Label,Textarea,
    Tab, Tabs, TabHeading, ScrollableTab, List as NBList, ListItem as NBListItem, Radio
} from 'native-base';

//react-native-elements
import { ListItem, Icon } from 'react-native-elements';
//styles
import { DetailSignDocStyle } from '../../../assets/styles/SignDocStyle';
import { MenuStyle, MenuOptionStyle } from '../../../assets/styles/MenuPopUpStyle';
import { TabStyle } from '../../../assets/styles/TabStyle';
import { asyncDelay, unAuthorizePage, openSideBar, convertDateToString } from '../../../common/Utilities';

//lib
import { connect } from 'react-redux';
import renderIf from 'render-if';
import * as util from 'lodash';
import { MenuProvider, Menu, MenuTrigger, MenuOptions, MenuOption } from 'react-native-popup-menu';

//firebase
import { pushFirebaseNotify } from '../../../firebase/FireBaseClient';

class RescheduleTask extends Component {
	constructor(props){
		super(props);
		this.state = {
			reason: '',
			deadline: '',
			userId: this.props.userInfo.ID,
			taskId: this.props.navigation.state.params.taskId,
            taskType: this.props.navigation.state.params.taskType,
			executing: false,
		}
	}
	

	async onOpenCalendar(){
		try{
			const { action, year, month, day } = await DatePickerAndroid.open({
				date: new Date()
			});

			if(action !== DatePickerAndroid.dissmissedAction){
				if (day < 10) {
                    day = '0' + day;
                }
                if (month < 10) {
                    month = '0' + (month + 1);
                }
                const deadline = day + '/' + month + '/' + year;
                
                this.setState({
					deadline
                });
			}
		}catch({code, message}){
			console.warn('Open datepicker error', err);
		}
	}


	async saveExtendTask(){
		const url = `${API_URL}/api/HscvCongViec/SaveExtendTask?id=${this.state.taskId}&userId=${this.state.userId}&extendDate=${this.state.deadline}&reason=${this.state.reason}`;
		//hiển thị modal
        this.setState({
            executing: true
        })
        
        //xử lý api
        const result = await fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json; charset=utf-8',
            }
        });
        const resultJson = await result.json();
        
        console.log('kết quả', resultJson);

        //delay khoảng 2s
        await asyncDelay(2000);
        
        //ẩn modal
        this.setState({
            executing: false
        });
        
        if(resultJson.Status == true && !util.isNull(resultJson.GroupTokens) && !util.isEmpty(resultJson.GroupTokens)){
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
        this.props.navigation.navigate('DetailTaskScreen',{
            taskId: this.state.taskId,
            taskType: this.state.taskType
        })
    }

	render(){
		return(
			<Container>
				<Header style={{ backgroundColor: HEADER_COLOR }} hasTabs>
                        <Left>
                            <Button transparent onPress={() => this.navigateBack()}>
                                <Icon name='ios-arrow-dropleft-circle' size={30} color={'#fff'} type="ionicon" />
                            </Button>
                        </Left>

                        <Body>
                            <Title>
                                XIN LÙI HẠN
                            </Title>
                        </Body>
                        <Right/>
                </Header>

                <Content>
          			<Form>
			            <Item>
			              <Input placeholder='Xin lùi tới ngày' value={this.state.deadline} onChangeText={(text)=>this.setState({deadline: text})}/>
			              <NBIcon active name='ios-calendar-outline' onPress={()=> this.onOpenCalendar()}/>
			            </Item>

			            <Item>
			              <Input placeholder='Nguyên nhân xin lùi' value={this.state.reason} onChangeText={(reason) => this.setState({reason})}/>
			            </Item>
			        </Form>

			        <Button iconLeft full rounded style={{backgroundColor: '#337321', marginTop: 20}} onPress={()=> this.saveExtendTask()}>
            			<NBIcon name='ios-checkmark-circle-outline' />
            			<NBText>LÙI HẠN</NBText>
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