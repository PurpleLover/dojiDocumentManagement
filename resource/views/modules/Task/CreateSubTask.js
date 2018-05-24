/*
	@description: tạo công việc con
	@author: duynn
	@since: 19/05/2018
*/

'use strict'
import React, { Component } from 'react';
import {
    ActivityIndicator, View, Text, Modal, DatePickerAndroid,
    FlatList, TouchableOpacity, Image,
    StyleSheet
} from 'react-native';

//constant
import {
    API_URL, HEADER_COLOR, EMPTY_STRING
} from '../../../common/SystemConstant';

//native-base
import {
    Button, Icon as NBIcon, Text as NBText, Item, Input, Title, Form, Textarea,
    Container, Header, Content, Left, Right, Body, CheckBox, Toast, Picker,Label,
    Tab, Tabs, TabHeading, ScrollableTab, List as NBList, ListItem as NBListItem, Radio
} from 'native-base';

//react-native-elements
import { ListItem, Icon } from 'react-native-elements';
//styles
import { DetailSignDocStyle } from '../../../assets/styles/SignDocStyle';
import { MenuStyle, MenuOptionStyle } from '../../../assets/styles/MenuPopUpStyle';
import { TabStyle } from '../../../assets/styles/TabStyle';

import { dataLoading, executeLoading } from '../../../common/Effect';
import { asyncDelay, unAuthorizePage, openSideBar } from '../../../common/Utilities';

//lib
import { connect } from 'react-redux';
import renderIf from 'render-if';
import * as util from 'lodash';
import { MenuProvider, Menu, MenuTrigger, MenuOptions, MenuOption } from 'react-native-popup-menu';

import AssignTaskUsers from './AssignTaskUsers';
import * as taskAction from '../../../redux/modules/task/TaskAction';

class CreateSubTask extends Component {
	constructor(props){
		super(props);
		this.state = {
			taskId: this.props.navigation.state.params.taskId,
			taskType: this.props.navigation.state.params.taskType,
			taskContent: EMPTY_STRING,
			deadline: EMPTY_STRING,
			priorityValue: '101',
			urgencyValue: '98',
			executing: false,
		}
	}

	navigateBack(){
		this.props.navigation.navigate('DetailTaskScreen', {
			taskId: this.state.taskId,
			taskType: this.state.taskType
		});
	}

	async createSubTask(){
		this.setState({
			executing: true
		});
		
		const result = await fetch(`${API_URL}/api/HscvCongViec/CreateSubTask`, {
			method: 'POST',
			headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json; charset=utf-8',
            },
            body: JSON.stringify({
            	beginTaskId: this.state.taskId,
            	taskContent: this.state.taskContent,
            	priority: this.state.priorityValue,
            	urgency: this.state.urgencyValue,
            	deadline: this.state.deadline
            })
		});

		const resultJson = await result.json();
		
		await asyncDelay(2000);

		this.setState({
			executing: false
		});

		Toast.show({
            text: resultJson.Status ? 'Tạo công việc con thành công' : 'Tạo công việ con không thành công',
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

	onProrityValueChange(priorityValue){
		this.setState({
			priorityValue
		})
	}

	onUrgencyValueChange(urgencyValue){
		this.setState({
			urgencyValue
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
                            	TẠO CÔNG VIỆC CON
                            </Title>
                        </Body>
                        <Right/>
                </Header>

                <Content>
                	<Form>
						<Textarea rowSpan={5} bordered placeholder="Nội dung công việc" 
							value={this.state.taskContent} 
							onChangeText={(taskContent) => this.setState({taskContent})}/>
						
						<Item stackedLabel>
                            <Label>Độ ưu tiên</Label>
                            <Picker
				              iosHeader="Chọn độ ưu tiên"
				              mode="dropdown"
				              iosIcon={<NBIcon name='ios-arrow-down-outline'/>}
                              style={{width: '100%'}}
				              selectedValue={this.state.priorityValue}
				              onValueChange={this.onProrityValueChange.bind(this)}>
					              <Picker.Item value="101" label="Cao" />
					              <Picker.Item value="102" label="Thấp" />
					              <Picker.Item value="103" label="Trung bình" />
            				</Picker>
                        </Item>
						
						<Item stackedLabel>
                            <Label>Độ khẩn</Label>
                            <Picker
				              iosHeader="Chọn độ khẩn"
				              mode="dropdown"
				              iosIcon={<NBIcon name='ios-arrow-down-outline'/>}
                              style={{width: '100%'}}
				              selectedValue={this.state.urgencyValue}
				              onValueChange={this.onUrgencyValueChange.bind(this)}>
					              <Picker.Item value="98" label="Khẩn" />
					              <Picker.Item value="99" label="Thường" />
					              <Picker.Item value="100" label="Thượng khẩn" />
            				</Picker>
                        </Item>


                        <Item>
                        	<Input placeholder={'Hạn hoàn thành'} value={this.state.deadline}/>
                        	<NBIcon active name='ios-calendar-outline' onPress={()=> this.onOpenCalendar()}/>
                        </Item>

                        <Button iconLeft full rounded style={{backgroundColor: '#337321', marginTop: 20}} onPress={()=> this.createSubTask()}>
                        	<NBIcon name='ios-checkmark-circle-outline' />
                        	<NBText>TẠO CÔNG VIỆC CON</NBText>
                    	</Button>
                	</Form>
                </Content>
			</Container>
		);
	}
}

const mapStateToProps = (state) => {
	return {
		userInfo: state.userState.userInfo
	}
}

export default connect(mapStateToProps)(CreateSubTask);