/*
	@description: màn hình chọn người xử lý văn bản
	@author: duynn
	@since: 16/05/2018
*/
'use strict'
import React, { Component } from 'react';
import { Animated, View, Text, FlatList, 
	TouchableOpacity, TouchableHighlight, StyleSheet, Image
} from 'react-native';

//native-base
import {
    Button, Icon as NBIcon, Text as NBText, Item, Input, Title, Toast,
    Container, Header, Content, Left, Right, Body, CheckBox,
    Tab, Tabs, TabHeading, ScrollableTab, ListItem as NBListItem,
    Form, Textarea
} from 'native-base';

import { List, ListItem, Icon } from 'react-native-elements';

//constant
import {
    API_URL, DEFAULT_PAGE_INDEX,
    DEFAULT_PAGE_SIZE, EMPTY_DATA_ICON_URI,
    EMPTY_STRING, EMTPY_DATA_MESSAGE,
    HEADER_COLOR, LOADER_COLOR
} from '../../../common/SystemConstant';

//effect
import { dataLoading, executeLoading } from '../../../common/Effect';

//util
import * as util from 'lodash';
import renderIf from 'render-if';

//redux
import { connect } from 'react-redux';
import * as workflowAction from '../../../redux/modules/workflow/WorkflowAction';

//styles
import { TabStyle } from '../../../assets/styles/TabStyle';

import WorkflowStreamProcessUsers from './WorkflowStreamProcessUsers';

import { pushFirebaseNotify } from '../../../firebase/FireBaseClient';

import { asyncDelay } from '../../../common/Utilities';

class WorkflowStreamProcess extends Component {
	constructor(props){
		super(props);
		this.state = {
			userId: this.props.userInfo.ID,
			stepName: util.toUpper(this.props.navigation.state.params.stepName),
			
			docId: this.props.navigation.state.params.docId,
			docType: this.props.navigation.state.params.docType,

			processId: this.props.navigation.state.params.processId,
			stepId: this.props.navigation.state.params.stepId,
			isStepBack: this.props.navigation.state.params.isStepBack,

			loading: false,
			selectedTabIndex: 0,

			groupMainProcess: [],
			groupJoinProcess: [],
			message: EMPTY_STRING,
			filterValue: EMPTY_STRING,
			executeLoading: false
		}
	}
	

	componentDidMount(){
		this.fetchData();
	}

	async fetchData(){
		this.setState({
			loading: true
		});

		const url = `${API_URL}/api/VanBanDi/GetFlow/${this.state.userId}/${this.state.processId}/${this.state.stepId}/${this.state.isStepBack ? 1 : 0}/0`;
		const result = await fetch(url);
		const resultJson = await result.json();
		
		this.setState({
			loading: false,
			groupMainProcess: resultJson.dsNgNhanChinh || [],
			groupJoinProcess: resultJson.dsNgThamGia || []
		});
	}

	//quay về danh sách
	navigateBack(){
		this.props.navigation.navigate('DetailSignDocScreen', {
            docId: this.state.docId,
            docType: this.state.docType
        })
	}

	renderMainProcessItem  = ({item}) => {
		return (
			<WorkflowStreamProcessUsers title={item.PhongBan.NAME} users={item.LstNguoiDung} isMainProcess={true}/>
		);
	}

	renderJoinProcessItem  = ({item}) => {
		return (
			<WorkflowStreamProcessUsers title={item.PhongBan.NAME} users={item.LstNguoiDung} isMainProcess={false}/>
		);
	}

	onFilter(){

	}

	async saveFlow(){
		this.setState({
			executeLoading: true
		});

		const result = await fetch(API_URL + '/api/VanBanDi/SaveFlow', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json; charset=utf-8',
            },
            body: JSON.stringify({
            	userId: this.state.userId,
                processID: this.state.processId,
                stepID: this.state.stepId,
                mainUser: this.props.mainProcessUser,
                joinUser: this.props.joinProcessUsers.toString(),
                message: this.state.message,
                IsBack: this.state.isStepBack ? 1 : 0,
                LogID: 0
            })
        });

		const resultJson = await result.json();
		
		await asyncDelay(2000);

        this.setState({
			executeLoading: false
		});

		if(!util.isNull(resultJson.GroupTokens) && !util.isEmpty(resultJson.GroupTokens)){
			const message = this.props.userInfo.Fullname + " đã gửi bạn xử lý văn bản mới";
			const content = {
				title: 'GỬI XỬ LÝ VĂN BẢN TRÌNH KÝ',
                message,
                isTaskNotification: false,
                targetScreen: 'DetailSignDocScreen',
                targetDocId: this.state.docId,
                targetDocType: this.state.docType
            }
			resultJson.GroupTokens.forEach(token => {
				pushFirebaseNotify(content, token, "notification");
			});
		}

		Toast.show({
            text: this.state.stepName + (resultJson.Status ? ' thành công' : ' không thành công'),
            type: resultJson.Status ? 'success' : 'danger',
            buttonText: "OK",
            buttonStyle: { backgroundColor: '#fff' },
            buttonTextStyle: { color: resultJson.Status ? '#337321' :'#FF0033'},
            duration: 5000,
            onClose: ()=> {
                this.props.resetProcessUsers();
                if(resultJson.Status){
                    this.navigateBack();
                }
            }
        });
	}



	render(){
		//điều kiện hiển thị tab
		let tabsContent = null;
		
		if(this.state.groupMainProcess.length > 0 && this.state.groupJoinProcess.length > 0){
			tabsContent = (
			<Tabs renderTabBar={()=> <ScrollableTab />} 
				initialPage={this.state.selectedTabIndex}
				onChangeTab={({selectedTabIndex}) => this.setState({ selectedTabIndex})}
				tabBarUnderlineStyle={{
		        	borderBottomWidth:4,
		        	borderBottomColor: '#FF6600'
            }}>
				<Tab heading={
						<TabHeading style={this.state.selectedTabIndex == 0 ? TabStyle.activeTab : TabStyle.inActiveTab}>
							<NBIcon name='ios-person-outline' style={this.state.selectedTabIndex == 0 ? TabStyle.activeText : TabStyle.inActiveText}/>
							<NBText style={this.state.selectedTabIndex == 0 ? TabStyle.activeText : TabStyle.inActiveText}>
								XỬ LÝ CHÍNH
							</NBText>
						</TabHeading>
				}>
					<Content>
						{/*<Form style={{paddingVertical: 5}}>
							<Item>
								<Input placeholder='Họ tên hoặc chức vụ'
									onSubmitEditing={()=> this.onFilter()}
									onChangeText={(filterValue) => this.setState({filterValue})}/>
								<NBIcon active name='ios-search'/>
							</Item>
						</Form>*/}
						<FlatList 
							keyExtractor={(item, index) => index.toString()}
							data={this.state.groupMainProcess}
							renderItem={this.renderMainProcessItem}/>
					</Content>
				</Tab>

				<Tab heading={
					<TabHeading style={this.state.selectedTabIndex == 1 ? TabStyle.activeTab : TabStyle.inActiveTab}>
						<NBIcon name='ios-people-outline' style={this.state.selectedTabIndex == 1 ? TabStyle.activeText : TabStyle.inActiveText}/>
						<NBText style={this.state.selectedTabIndex == 1 ? TabStyle.activeText : TabStyle.inActiveText}>
							THAM GIA XỬ LÝ
						</NBText>
					</TabHeading>
				}>
					<Content>
						{/*<Form style={{paddingVertical: 5}}>
							<Item>
								<Input placeholder='Họ tên hoặc chức vụ'
									onSubmitEditing={()=> this.onFilter()}
									onChangeText={(filterValue) => this.setState({filterValue})}/>
								<NBIcon active name='ios-search'/>
							</Item>
						</Form>*/}
						<FlatList 
							keyExtractor={(item, index) => index.toString()}
							data={this.state.groupJoinProcess}
							renderItem={this.renderJoinProcessItem}/>
					</Content>
				</Tab>

				<Tab heading={
					<TabHeading style={this.state.selectedTabIndex == 2 ? TabStyle.activeTab : TabStyle.inActiveTab}>
						<NBIcon name='ios-chatbubbles-outline' style={this.state.selectedTabIndex == 2 ? TabStyle.activeText : TabStyle.inActiveText}/>
						<NBText style={this.state.selectedTabIndex == 2 ? TabStyle.activeText : TabStyle.inActiveText}>
							TIN NHẮN
						</NBText>
					</TabHeading>
				}>
					<Form>
						<Textarea rowSpan={5} bordered placeholder="Nội dung tin nhắn" onChangeText ={(message) => this.setState({message})} value={this.state.message}/>
					</Form>
				</Tab>
			</Tabs>
			);
		}else if(this.state.groupMainProcess.length > 0 && this.state.groupJoinProcess.length <= 0){
			tabsContent = (<Tabs
				initialPage={this.state.selectedTabIndex}
				onChangeTab={({selectedTabIndex}) => this.setState({ selectedTabIndex})}
				tabBarUnderlineStyle={{
		        	borderBottomWidth:4,
		        	borderBottomColor: '#FF6600'
            }}>
				<Tab heading={
					<TabHeading style={this.state.selectedTabIndex == 0 ? TabStyle.activeTab : TabStyle.inActiveTab}>
						<NBIcon name='ios-person-outline' style={this.state.selectedTabIndex == 0 ? TabStyle.activeText : TabStyle.inActiveText}/>
						<NBText style={this.state.selectedTabIndex == 0 ? TabStyle.activeText : TabStyle.inActiveText}>
							XỬ LÝ CHÍNH
						</NBText>
					</TabHeading>
			}>
					<FlatList 
						keyExtractor={(item, index) => index.toString()}
						data={this.state.groupMainProcess}
						renderItem={this.renderMainProcessItem}/>
				</Tab>

				<Tab heading={
					<TabHeading style={this.state.selectedTabIndex == 1 ? TabStyle.activeTab : TabStyle.inActiveTab}>
						<NBIcon name='ios-chatbubbles-outline' style={this.state.selectedTabIndex == 1 ? TabStyle.activeText : TabStyle.inActiveText}/>
						<NBText style={this.state.selectedTabIndex == 1 ? TabStyle.activeText : TabStyle.inActiveText}>
							TIN NHẮN
						</NBText>
					</TabHeading>
				}>
					<Form>
						<Textarea rowSpan={5} bordered placeholder="Nội dung tin nhắn" onChangeText ={(message) => this.setState({message})} value={this.state.message}/>
					</Form>
				</Tab>
            </Tabs>)
			
		}else if(this.state.groupMainProcess.length <= 0 && this.state.groupJoinProcess.length > 0){
			tabsContent = (<Tabs
				initialPage={this.state.selectedTabIndex}
				onChangeTab={({selectedTabIndex}) => this.setState({ selectedTabIndex})}
				tabBarUnderlineStyle={{
		        	borderBottomWidth:4,
		        	borderBottomColor: '#FF6600'
            }}>
					<Tab heading={
						<TabHeading style={this.state.selectedTabIndex == 0 ? TabStyle.activeTab : TabStyle.inActiveTab}>
							<NBIcon name='ios-people-outline' style={this.state.selectedTabIndex == 0 ? TabStyle.activeText : TabStyle.inActiveText}/>
							<NBText style={this.state.selectedTabIndex == 0 ? TabStyle.activeText : TabStyle.inActiveText}>
								THAM GIA XỬ LÝ
							</NBText>
						</TabHeading>
					}>
						<FlatList 
							keyExtractor={(item, index) => index.toString()}
							data={this.state.groupJoinProcess}
							renderItem={this.renderJoinProcessItem}/>
					</Tab>

					<Tab heading={
						<TabHeading style={this.state.selectedTabIndex == 1 ? TabStyle.activeTab : TabStyle.inActiveTab}>
							<NBIcon name='ios-chatbubbles-outline' style={this.state.selectedTabIndex == 1 ? TabStyle.activeText : TabStyle.inActiveText}/>
							<NBText style={this.state.selectedTabIndex == 1 ? TabStyle.activeText : TabStyle.inActiveText}>
								TIN NHẮN
							</NBText>
						</TabHeading>
					}>
						<Form>
							<Textarea rowSpan={5} bordered placeholder="Nội dung tin nhắn" onChangeText ={(message) => this.setState({message})} value={this.state.message}/>
						</Form>
					</Tab>
				</Tabs>
            )
		}else{
			tabsContent = (
				<Tabs
				initialPage={this.state.selectedTabIndex}
				onChangeTab={({selectedTabIndex}) => this.setState({ selectedTabIndex})}
				tabBarUnderlineStyle={{
		        	borderBottomWidth:4,
		        	borderBottomColor: '#FF6600'
            	}}>
					<Tab heading={
						<TabHeading style={TabStyle.activeTab}>
							<NBIcon name='ios-chatbubbles-outline' style={TabStyle.activeText }/>
							<NBText style={TabStyle.activeText}>
								TIN NHẮN
							</NBText>
						</TabHeading>
					}>
						<Form>
							<Textarea rowSpan={5} bordered placeholder="Nội dung tin nhắn" onChangeText ={(message) => this.setState({message})} value={this.state.message}/>
						</Form>
					</Tab>
				</Tabs>
			)
		}

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
							{this.state.stepName}
						</Title>
					</Body>

					<Right>
						<Button transparent onPress={() => this.saveFlow()}>
							<Icon name='ios-checkmark-circle' size={30} color={'#fff'} type="ionicon" />
						</Button>
					</Right>
				</Header>
				{
					renderIf(this.state.loading)(
						dataLoading(true)
					)
				}

				{
					renderIf(!this.state.loading)(
						tabsContent
					)
				}

				{
					executeLoading(this.state.executeLoading)
				}
			</Container>
		);
	}
}

const mapStateToProps = (state) => {
	return {
		userInfo: state.userState.userInfo, 
		mainProcessUser: state.workflowState.mainProcessUser,
		joinProcessUsers: state.workflowState.joinProcessUsers
	}
}

const mapDispatchToProps = (dispatch) => {
    return {
        resetProcessUsers: ()=> dispatch(workflowAction.resetProcessUsers())
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(WorkflowStreamProcess);
