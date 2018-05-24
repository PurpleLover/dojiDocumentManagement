/*
* @description: màn hình giao việc
* @author: duynn
* @since: 13/05/2018
*/
'use strict'
import React, { Component } from 'react';
import {
    ActivityIndicator, View, Text, Modal,
    FlatList, TouchableOpacity, Image,
    StyleSheet
} from 'react-native';

//constant
import {
    API_URL, HEADER_COLOR
} from '../../../common/SystemConstant';

//native-base
import {
    Button, Icon as NBIcon, Text as NBText, Item, Input, Title,
    Container, Header, Content, Left, Right, Body, CheckBox, Toast,
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

//firebase
import { pushFirebaseNotify } from '../../../firebase/FireBaseClient';

class AssignTask extends Component {
	constructor(props){
		super(props)
		this.state = {
			taskId: this.props.navigation.state.params.taskId,
			taskType: this.props.navigation.state.params.taskType,
			subTaskId: this.props.navigation.state.params.subTaskId,
			userId: this.props.userInfo.ID,
			loading: true,
			listUsers: [],
			selectedTabIndex: 0,
			executing: false
		}
	}


	async componentWillMount (){
		this.setState({
			loading: true
		});

		const url = `${API_URL}/api/HscvCongViec/AssignTask/${this.state.taskId}/${this.state.subTaskId}/${this.state.userId}`;
		
		const assignInfo = await fetch(url)
		.then(response => response.json())
		.then(responseJson => {
			return responseJson
		});
		
		this.setState({
			loading: false,
			listUsers: assignInfo.LstUser,
		});
	}

	navigateBack(){
		this.props.navigation.navigate('DetailTaskScreen',{
			taskId: this.state.taskId,
			taskType: this.state.taskType
		})
	}

	async saveAssignTask(){
		this.setState({
			executing: true
		})
		
		const result = await fetch(API_URL + '/api/HscvCongViec/SaveAssignTask', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json; charset=utf-8',
            },
            body: JSON.stringify({
                userId: this.state.userId,
		        AssignTaskId: this.state.taskId,
		        AssignTaskSubId: this.state.subTaskId,
		        XuLyChinhId:this.props.mainProcessUser,
		        ThamGia: this.props.joinProcessUsers.toString()
            })
        });

        const resultJson = await result.json();
        
        await asyncDelay(2000);

		this.setState({
			executing: false
		});
		
		if(resultJson.Status == true && !util.isNull(resultJson.GroupTokens) && !util.isEmpty(resultJson.GroupTokens)){
			const message = this.props.userInfo.Fullname + ' đã giao bạn xử lý một công việc';
			const content = {
				title: 'THÔNG BÁO GIAO VIỆC',
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
            text: resultJson.Status ? 'Giao việc thành công' : 'Giao việc không thành công',
            type: resultJson.Status ? 'success' : 'danger',
            buttonText: "OK",
            buttonStyle: { backgroundColor: '#fff' },
            buttonTextStyle: { color: resultJson.Status ? '#337321' :'#FF0033'},
            duration: 5000,
            onClose: ()=> {
            	this.props.resetTaskProcessors();
            	if(resultJson.Status){
            		this.navigateBack();
            	}
            }
         });
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
                                GIAO VIỆC
                            </Title>
                        </Body>
                        <Right>
                        	<Button transparent onPress={() => this.saveAssignTask()}>
								<Icon name='ios-checkmark-circle' size={30} color={'#fff'} type="ionicon" />
							</Button>
                        </Right>
                </Header>
        			<Content>
					{
						renderIf(this.state.loading)(
							dataLoading(true)
						)
					}


					{
						renderIf(!this.state.loading)(
							<Tabs
			                    initialPage={this.state.selectedTabIndex}
			                    onChangeTab={({selectedTabIndex}) => this.setState({
			                        selectedTabIndex
			                    })}
			                    tabBarUnderlineStyle={{
			                        borderBottomWidth:4,
			                        borderBottomColor: '#FF6600'
			                    }}>
		                    <Tab heading={
		                        <TabHeading style={(this.state.selectedTabIndex == 0 ? TabStyle.activeTab : TabStyle.inActiveTab)}>
		                            <NBIcon name='ios-person-outline' style={(this.state.selectedTabIndex == 0 ? TabStyle.activeText : TabStyle.inActiveText)} />
		                            <NBText style={[TabStyle.tabText,
		                            (this.state.selectedTabIndex == 0 ? TabStyle.activeText : TabStyle.inActiveText)]}>
		                                XỬ LÝ CHÍNH
		                            </NBText>
		                        </TabHeading>
		                    }>
                        		<AssignTaskUsers listUsers={this.state.listUsers} isMainProcess={true}/>
                    		</Tab>


		                    <Tab heading={
		                        <TabHeading style={(this.state.selectedTabIndex == 1 ? TabStyle.activeTab : TabStyle.inActiveTab)}>
		                            <NBIcon name='ios-people-outline' style={(this.state.selectedTabIndex == 1 ? TabStyle.activeText : TabStyle.inActiveText)} />
		                            <NBText style={[TabStyle.tabText,
		                            (this.state.selectedTabIndex == 1 ? TabStyle.activeText : TabStyle.inActiveText)]}>
		                             	THAM GIA XỬ LÝ
		                            </NBText>
		                        </TabHeading>
		                    }>
                        		<AssignTaskUsers listUsers={this.state.listUsers} isMainProcess={false}/>
                    		</Tab>
		                </Tabs>
						)
					}

					{
						executeLoading(this.state.executing)
					}
				</Content>
			</Container>
		);
	}
}

const mapStateToProps = (state) => {
	return {
		userInfo: state.userState.userInfo,
		mainProcessUser: state.taskState.mainProcessUser,
        joinProcessUsers: state.taskState.joinProcessUsers
	}
}

const mapDispatchToProps = (dispatch) => {
	return {
		resetTaskProcessors: () => dispatch(taskAction.resetTaskProcessors())
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(AssignTask);
