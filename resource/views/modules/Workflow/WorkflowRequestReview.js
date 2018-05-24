/*
	@description: màn hình yêu cầu văn bản cần review
	@author: duynn
	@since: 16/05/2018
*/
'use strict'
import React, { Component } from 'react';
import { 
	Alert, Animated, View, Text, FlatList, 
	TouchableOpacity, TouchableHighlight, StyleSheet, Image
} from 'react-native';

//native-base
import {
    Button, Icon as NBIcon, Text as NBText, Item, Input, Title, 
    Container, Header, Content, Left, Right, Body, CheckBox,
    Tab, Tabs, TabHeading, ScrollableTab, ListItem as NBListItem,
    Form, Textarea, Toast
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

//styles
import { TabStyle } from '../../../assets/styles/TabStyle';

import WorkflowRequestReviewUsers from './WorkflowRequestReviewUsers';

import * as workflowAction from '../../../redux/modules/workflow/WorkflowAction'

import { pushFirebaseNotify } from '../../../firebase/FireBaseClient';

import { asyncDelay } from '../../../common/Utilities';

class WorkflowRequestReview extends Component {
	constructor(props){
		super(props);
		this.state = {
			userId: this.props.userInfo.ID,

			docId: this.props.navigation.state.params.docId,
			docType: this.props.navigation.state.params.docType,

			processId: this.props.navigation.state.params.processId,
			stepId: this.props.navigation.state.params.stepId,
			isStepBack: this.props.navigation.state.params.isStepBack,
			stepName: util.toUpper(this.props.navigation.state.params.stepName),

			//danh sách người nhận xử lý chính cùng phòng ban
			selectedTabIndex: 0,
			groupMainProcessorFinal: [],
			groupMainProcessor: [],
			loading: false,
			filterValue: EMPTY_STRING,
			message: EMPTY_STRING,
			executingLoading: false
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
		// console.log('123', url);
		const result = await fetch(url);
		const resultJson = await result.json();
		
		this.setState({
			loading: false,
			groupMainProcessorFinal: resultJson.dsNgNhanChinh,
			groupMainProcessor: resultJson.dsNgNhanChinh
		});	
	}
	
	renderItem  = ({item}) => {
		return (
			<WorkflowRequestReviewUsers title={item.PhongBan.NAME} users={item.LstNguoiDung} />
		);
	}

	navigateBack(){
		this.props.navigation.navigate('DetailSignDocScreen', {
			docId: this.state.docId,
			docType: this.state.docType
		})
	}

	onFilter(filterValue){
	}

	async saveRequestReview(){
		this.setState({
			executingLoading: true
		});
		const result = await fetch(API_URL + '/api/VanBanDi/SaveReview', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json; charset=utf-8',
            },
            body: JSON.stringify({
                userId: this.state.userId,
                joinUser: this.props.reviewUsers.toString(),
                stepID: this.state.stepId,
                processID: this.state.processId,
				message: this.state.message
            })
        });

        const resultJson = await result.json();
		
		await asyncDelay(2000);

        this.setState({
        	executingLoading: false
        });

        //gửi thông báo đến cho người nhận review

		if(!util.isNull(resultJson.GroupTokens) && !util.isEmpty(resultJson.GroupTokens)){
			console.log('resultJson.GroupTokens', resultJson.GroupTokens)
			const message = this.props.userInfo.Fullname + " đã gửi bạn review một văn bản mới";
			const content = {
				title: 'REVIEW VĂN BẢN TRÌNH KÝ',
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
            text: resultJson.Status ? 'Lưu yêu cầu review thành công' : 'Lưu yêu cầu review không thành công',
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
						<Button transparent onPress={() => this.saveRequestReview()}>
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
						<Tabs initialPage={this.state.selectedTabIndex}
							  onChangeTab={({selectedTabIndex}) => this.setState({
							  	selectedTabIndex
							  })}
							  tabBarUnderlineStyle={{
		                        borderBottomWidth:4,
		                        borderBottomColor: '#FF6600'
                    		}}>

							<Tab heading={
								<TabHeading style={this.state.selectedTabIndex == 0 ? TabStyle.activeTab : TabStyle.inActiveTab}>
									<NBIcon name='ios-person-outline' style={this.state.selectedTabIndex == 0 ? TabStyle.activeText : TabStyle.inActiveText}/>
									<NBText style={this.state.selectedTabIndex == 0 ? TabStyle.activeText : TabStyle.inActiveText}>
										NGƯỜI NHẬN
									</NBText>
								</TabHeading>
							}>
								<Content>
									{/*<Form style={{paddingVertical: 5}}>
										<Item>
											<Input placeholder='Họ tên hoặc chức vụ'
											onSubmitEditing={()=> this.onFilter()}
											onChangeText={(filterValue) => this.onFilter(filterValue)}/>
											<NBIcon active name='ios-search'/>
										</Item>
									</Form>*/}
									<FlatList 
										keyExtractor={(item, index) => index.toString()}
										data={this.state.groupMainProcessorFinal}
										renderItem={this.renderItem}
									/>
								</Content>
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
									<Textarea rowSpan={5} bordered placeholder="Nội dung tin nhắn" value={this.state.message} onChangeText={(message)=> this.setState({message})}/>
								</Form>
							</Tab>
						</Tabs>
					)
				}

				{
					executeLoading(this.state.executingLoading)
				}
			</Container>
		);
	}
}

const mapStateToProps = (state) => {
	return {
		userInfo: state.userState.userInfo,
		reviewUsers: state.workflowState.reviewUsers
	}
}

const mapDispatchToProps = (dispatch) => {
	return {
		resetProcessUsers: ()=> (dispatch(workflowAction.resetProcessUsers()))
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(WorkflowRequestReview);

