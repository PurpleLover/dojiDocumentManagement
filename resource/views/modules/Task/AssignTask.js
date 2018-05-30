/*
* @description: màn hình giao việc
* @author: duynn
* @since: 13/05/2018
*/
'use strict'
import React, { Component } from 'react';

//redux
import { connect } from 'react-redux';

//utilities
import { API_URL, HEADER_COLOR } from '../../../common/SystemConstant';
import { dataLoading, executeLoading } from '../../../common/Effect';
import { verticalScale, indicatorResponsive } from '../../../assets/styles/ScaleIndicator';

//lib
import renderIf from 'render-if';
import { 
	Container, Content, Header, Left, Button, 
	Body, Title, Right, Tabs, Tab, TabHeading,
	Icon, Text
} from 'native-base';
import { Icon as RneIcon } from 'react-native-elements';

class AssignTask extends Component {

	constructor(props){
		super(props);
		this.state = {
			userId: this.props.userInfo.ID,

			taskId: this.props.navigation.state.params.taskId,
			taskType: this.props.navigation.state.params.taskType,
			subTaskId: this.props.navigation.state.params.subTaskId,

			currentTabIndex: 0
		}
	}
	
	componentWillMount = () => {
		this.fetchData();
	}

	fetchData = async () => {
		this.setState({
			loading: true
		});
		
		const url = `${API_URL}/api/HscvCongViec/AssignTask/${this.state.taskId}/${this.state.subTaskId}/${this.state.userId}`;

		const result = await fetch(url);
		const resultJson = await result.json();

		this.setState({
			loading: false
		})
	}
	
	//lưu thông tin giao việc
	saveAssignTask = async () => {
		
	}

	navigateBackToDetail = () => {
		this.props.navigation.navigate('DetailTaskScreen',{
			taskId: this.state.taskId,
			taskType: this.state.taskType
		});
	}

	render(){
		return(
			<Container>
				<Header hasTabs style={{backgroundColor: HEADER_COLOR}}>
					<Left>
						<Button transparent onPress={()=> this.navigateBackToDetail()}>
							<RneIcon name='ios-arrow-round-back' size={verticalScale(40)} color={'#fff'} type='ionicon' />
						</Button>
					</Left>

					<Body>
						<Title>
							GIAO VIỆC
						</Title>
					</Body>

					<Right>
						<Button transparent onPress={() => this.saveAssignTask()}>
							<RneIcon name='md-send' size={verticalScale(30)} color={'#fff'} type='ionicon'/>
						</Button>
					</Right>
				</Header>

				<Content contentContainerStyle={{flex: 1}}>
					{
						renderIf(this.state.loading)(
							dataLoading(true)
						)
					}
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

export default connect(mapStateToProps)(AssignTask)