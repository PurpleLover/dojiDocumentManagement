/*
	@description: lịch sử cập nhật tiến độ công việc
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
    View as NBView
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


class HistoryProgressTask extends Component {
	constructor(props){
		super(props)
		this.state = {
			userId: this.props.userInfo.ID,
			taskId: this.props.navigation.state.params.taskId ,
            taskType: this.props.navigation.state.params.taskType ,
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
            	return responseJson.LstCapNhat || [];
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

	renderItem = ({item}) => {
		return (
			<SwipeRow
                style={{borderColor: '#ececec', borderBottomWidth: 1}}
            	rightOpenValue={-60}
            	disableLeftSwipe={true}
            	disableRightSwipe={true}
	            body={
	              <NBView style={styles.rowContainer}>
	              	<Item fixedLabel style={styles.rowItem}>
              			<NBIcon name='ios-person-outline' size={40}/>
              			<Label style={styles.rowLabel}>
							{item.NGUOITAO}
              			</Label>
            		</Item>

            		<Item fixedLabel style={styles.rowItem}>
              			<NBIcon name='ios-time-outline'size={40}/>
              			<Label style={styles.rowLabel}>
							{convertDateToString(item.NGAYCAPNHATTIENDO)}
              			</Label>
            		</Item>

            		<Item fixedLabel style={styles.rowItem}>
              			<NBIcon name='ios-trending-up'size={40}/>
              			<Label style={styles.rowLabel}>
							{item.TIENDOCONGVIEC + '%'}
              			</Label>
            		</Item>
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
                            LỊCH SỬ CẬP NHẬT TIẾN ĐỘ
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
		minHeight: 40,
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

export default connect(mapStateToProps)(HistoryProgressTask);




