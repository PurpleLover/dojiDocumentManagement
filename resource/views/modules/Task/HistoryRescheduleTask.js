/*
	@description: danh sách xin lùi hạn của công việc
	@author: duynn
	@since: 15/05/2018
*/

'use strict'
import React, { Component } from 'react';
import {
    Alert,ActivityIndicator, View, Text, Modal,RefreshControl,
    FlatList, TouchableOpacity, Image,
    StyleSheet
} from 'react-native';

//constant
import {
    API_URL,
    EMPTY_DATA_ICON_URI, EMTPY_DATA_MESSAGE,
    HEADER_COLOR, LOADER_COLOR
} from '../../../common/SystemConstant';

//native-base
import {
    Form, Label, Button, Icon as NBIcon, Text as NBText, Item, Input, Title,
    Container, Header, Content, Left, Right, Body,
    Tab, Tabs, TabHeading, ScrollableTab, SwipeRow,
    View as NBView, Toast
} from 'native-base';

//react-native-elements
import { ListItem, Icon } from 'react-native-elements';
//styles
import { ListTaskStyle } from '../../../assets/styles/TaskStyle';
import { DetailSignDocStyle } from '../../../assets/styles/SignDocStyle';
import { MenuStyle, MenuOptionStyle } from '../../../assets/styles/MenuPopUpStyle';
import { TabStyle } from '../../../assets/styles/TabStyle';
import { indicatorResponsive } from '../../../assets/styles/ScaleIndicator';

import { dataLoading,executeLoading } from '../../../common/Effect';
import { asyncDelay, unAuthorizePage, openSideBar, convertDateToString } from '../../../common/Utilities';
//lib
import { connect } from 'react-redux';
import renderIf from 'render-if';
import * as util from 'lodash';
import { MenuProvider, Menu, MenuTrigger, MenuOptions, MenuOption } from 'react-native-popup-menu';

//firebase
import { pushFirebaseNotify } from '../../../firebase/FireBaseClient';

class HistoryRescheduleTask extends Component {
	constructor(props){
		super(props);
		this.state = {
			userId: this.props.userInfo.ID,
			taskId: this.props.navigation.state.params.taskId,
			taskType: this.props.navigation.state.params.taskType,
			data: [],
			loading: false,
			refreshing: false,
			executing: false
		}
	}
	
	componentWillMount(){
		this.fetchData();
	}

	async fetchData(){
		if(!this.state.refreshing){
			this.setState({
            	loading: true
        	});
		}

        const url = `${API_URL}/api/HscvCongViec/JobDetail/${this.state.taskId}/${this.state.userId}`;
        
        const data = await fetch(url)
        .then(response => response.json())
        .then(responseJson => {
            if(!util.isNull(responseJson)){
            	return responseJson.LstXinLuiHan || [];
            }else{
            	return [];
            }
        }).catch(err => {
            console.log('Xảy ra lỗi', err);
        });

        this.setState({
        	refreshing: false,
            loading: false,
            data
        });
	}
	

	onConfirmSaveExtendTask(isApprove, itemId){
		const message = isApprove ? 'Bạn có chắc chắn đồng ý phê duyệt gia hạn công việc' : 'Bạn có chắc chắn từ chối phê duyệt gia hạn công việc'
		Alert.alert(
			'XÁC NHẬN PHÊ DUYỆT',
			message,
			[
                { text: 'ĐỒNG Ý', onPress: () =>  this.saveExtendTask(isApprove, itemId) },
                { text: 'HỦY BỎ', onPress: () =>  console.log('just close HistoryRescheduleTask modal1') },
            ]
		)
	}
	
	//phê duyệt yêu cầu lùi hạn công việc
	async saveExtendTask(isApprove, itemId){
		this.setState({
			executing: true
		})
		const status = isApprove ? 1 : 0;
		const url = `${API_URL}/api/HscvCongViec/ApproveExtendTask?id=${itemId}&userId=${this.state.userId}&status=${status}`;
		const result = await fetch(url, {
			method:'POST',
			headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json; charset=utf-8',
            }
		});

		const resultJson = await result.json();

		console.log('kết quả', resultJson);

		await asyncDelay(1000);
		
		this.setState({
			executing: false
		});

		if(resultJson.Status == true && !util.isNull(resultJson.GroupTokens) && !util.isEmpty(resultJson.GroupTokens)){
            const message = this.props.userInfo.Fullname + ' đã ' + (isApprove ? 'phê duyệt' : 'từ chối')+ ' yêu cầu lùi hạn';
            const content = {
                title: (isApprove ? 'ĐỒNG Ý' : 'TỪ CHỐI') + ' YÊU CẦU GIA HẠN CÔNG VIỆC',
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
            text: resultJson.Status ? 'Phê duyệt yêu cầu lùi hạn thành công' : 'Phê duyệt yêu cầu lùi hạn không thành công',
            type: resultJson.Status ? 'success' : 'danger',
            buttonText: "OK",
            buttonStyle: { backgroundColor: '#fff' },
            buttonTextStyle: { color: resultJson.Status ? '#337321' :'#FF0033'},
            duration: 5000,
            onClose: ()=> {
                if(resultJson.Status){
                    this.fetchData();
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
	
	renderItem = ({item}) => {
		return (
			<SwipeRow
				style={{borderColor: '#ececec', borderBottomWidth: 1}}
            	rightOpenValue={-60}
            	disableLeftSwipe={!util.isNull(item.IS_APPROVED)}
            	disableRightSwipe={!util.isNull(item.IS_APPROVED)}
	            body={
	              <NBView style={styles.rowContainer}>
	              	<Item fixedLabel style={styles.rowItem}>
              			<NBIcon name='ios-person-outline' size={40}/>
              			<Label style={styles.rowLabel}>
							{item.FullName}
              			</Label>
            		</Item>

            		<Item fixedLabel style={styles.rowItem}>
              			<NBIcon name='ios-time-outline'size={40}/>
              			<Label style={styles.rowLabel}>
							Xin lùi hạn đến ngày {convertDateToString(item.HANKETHUC)}
              			</Label>
            		</Item>

            		<Item fixedLabel style={styles.rowItem}>
              			<NBIcon name='ios-text-outline'size={40}/>
              			<Label style={styles.rowLabel}>
							{item.NOIDUNG}
              			</Label>
            		</Item>

            		<Item fixedLabel style={styles.rowItem}>
              			<NBIcon name='ios-time-outline'size={40}/>
              			<Label style={styles.rowLabel}>
							{convertDateToString(item.NGAYTAO)}
              			</Label>
            		</Item>
            		<Item fixedLabel style={styles.rowItem}>
              			<NBIcon name='ios-alert-outline'size={40}/>
              			<Label style={styles.rowLabel}>
							{util.isNull(item.IS_APPROVED) ? 
								<Text style={[styles.notConfirmText, styles.statusText]}>Chưa phê duyệt</Text> : 
								(item.IS_APPROVED ? <Text style={[styles.approveText, styles.statusText]}>Đã phê duyệt</Text> : <Text style={[styles.denyText, styles.statusText]}>Không phê duyệt</Text>)}
              			</Label>
            		</Item>
	              </NBView>
	            }
	            right={
	              <NBView>
	                {
	                	renderIf(util.isNull(item.IS_APPROVED))(
							<NBView>
								<Button onPress={() => this.onConfirmSaveExtendTask(true, item.ID)} 
	                			style={[styles.rowButton, styles.rowButtonApprove]}>
	                				<NBIcon active name="ios-checkmark-circle-outline" />
	              				</Button>

				              	<Button onPress={() => this.onConfirmSaveExtendTask(false, item.ID)} 
				              		style={[styles.rowButton, styles.rowButtonDeny]}>
				                	<NBIcon active name="ios-close-circle-outline" />
				              	</Button>
							</NBView>
	                	)
	                }
	              </NBView>
	            }
          />
		)
	}

	handleEnd = () => {
    }

    handleRefresh = () => {
        this.setState({
            refreshing: true,
        }, () => {
            this.fetchData();
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
                            LỊCH SỬ LÙI HẠN
                        </Title>
                    </Body>

                    <Right />
                </Header>

                <Content>
					<FlatList
                        onEndReached={() => this.handleEnd()}
                        onEndReachedThreshold={0.1}
                        data={this.state.data}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={this.renderItem}
                        ListFooterComponent={() => this.state.loading ? <ActivityIndicator size={indicatorResponsive} animating color={LOADER_COLOR} /> : null}
                        ListEmptyComponent={() =>
                            this.state.loading ? null : (
                                <View style={ListTaskStyle.emtpyContainer}>
                                    <Image source={EMPTY_DATA_ICON_URI} style={ListTaskStyle.emptyIcon} />
                                    <Text style={ListTaskStyle.emptyMessage}>
                                        {EMTPY_DATA_MESSAGE}
                                    </Text>
                                </View>
                            )
                        }

                        refreshControl={
                            <RefreshControl
                                refreshing={this.state.refreshing}
                                onRefresh={this.handleRefresh}
                                title='Kéo để làm mới'
                                colors={[LOADER_COLOR]}
                            />
                        }
                    />
                </Content>
                {
                    executeLoading(this.state.executing)
                }
			</Container>
		)
	}
}

const styles = StyleSheet.create({
	rowContainer: {
		minHeight: 50,
		width: '100%'
	},
	rowItem: {
		borderColor: '#fff'
	},
	rowLabel:{
		fontSize:12,
		color: '#000'
	},
	rowButton: {
		height: '50%',
		borderRadius: 0,
		alignItems: 'center',
		width: 60
	}, rowButtonApprove: {
		backgroundColor: '#337321'
	}, rowButtonDeny: {
		backgroundColor: '#FF6600'
	}, notConfirmText: {
		color: '#FF6600'
	}, approveText: {
		color: '#337321'
	}, denyText: {
		color: '#FF0033'
	},statusText: {
		fontWeight: 'bold'
	}
})

const mapStateToProps = (state) => {
    return {
        userInfo: state.userState.userInfo
    }
}

export default connect(mapStateToProps)(HistoryRescheduleTask)


