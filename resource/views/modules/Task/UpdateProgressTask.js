/*
	@description: cập nhật tiến độ công việc
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

//constant
import {
    API_URL, HEADER_COLOR, EMPTY_STRING
} from '../../../common/SystemConstant';

//native-base
import {
    Form, Button, Icon as NBIcon, Text as NBText, Item, Input, Title, Toast,
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

class UpdateProgressTask extends Component {
	constructor(props){
		super(props)
		this.state = {
			taskId: this.props.navigation.state.params.taskId,
            taskType: this.props.navigation.state.params.taskType,
			userId: this.props.userInfo.ID,
			progressValue: this.props.navigation.state.params.progressValue,
			comment: EMPTY_STRING,
			executing: false,
		}
	}
	
	onProgressChange(value){
		this.setState({
			progressValue: value
		});
	}


	async updateProgressTask(){
		const url = `${API_URL}/api/HscvCongViec/UpdateProgressTask`
		
		//xử lý api
		this.setState({
			executing: true
		})
		
		//xử lý api
        const result = await fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json; charset=utf-8',
            }, body: JSON.stringify({
                userId: this.state.userId,
                taskId: this.state.taskId,
                percentComplete: this.state.progressValue,
                comment: this.state.comment
            })
        });
        const resultJson = await result.json();
	    
        console.log('Kết quả', resultJson);   

        await asyncDelay(2000);
        
		//kết thúc xử lý api
		this.setState({
			executing: false
		});

        if(resultJson.Status == true && !util.isNull(resultJson.GroupTokens) && !util.isEmpty(resultJson.GroupTokens)){
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
				<Header style={{ backgroundColor: HEADER_COLOR }} hasTabs>
                        <Left>
                            <Button transparent onPress={() => this.navigateBack()}>
                                <Icon name='ios-arrow-dropleft-circle' size={30} color={'#fff'} type="ionicon" />
                            </Button>
                        </Left>

                        <Body>
                            <Title>
                            	CẬP NHẬT TIẾN ĐỘ CÔNG VIỆC
                            </Title>
                        </Body>
                        <Right/>
                </Header>

                <View style={styles.content}>
                	<Form>
                		<View style={styles.sliderContainer}>
                			<Slider
                			 minimumTrackTintColor={'#4FA800'}
                			 thumbStyle={styles.sliderThumb}
                		     style={styles.slider}
                			 animateTransitions={true}
                			 minimumValue={0} maximumValue={100}
                			 step={1}
    						 value={this.state.progressValue}
   							 onValueChange={this.onProgressChange.bind(this)} />
                		</View>

                		<Item stackedLabel>
                			<Label>Tiến độ hoành thành (%)</Label>
							<Input editable={false} value={this.state.progressValue.toString()} onChangeText={(comment) => this.setState({comment})}/>
                		</Item>

                		<Item stackedLabel>
                			<Label>Nội dung</Label>
                			<Input />
                		</Item>
                	</Form>

                	<Button iconLeft full rounded style={{backgroundColor: '#337321', marginTop: 20}} onPress={()=> this.updateProgressTask()}>
            			<NBIcon name='ios-checkmark-circle-outline' />
            			<NBText>CẬP NHẬT</NBText>
        			</Button>
                </View>

                {
                    executeLoading(this.state.executing)
                }
			</Container>
		);
	}
}

const styles = StyleSheet.create({
	content: {
		flex: 1,
		paddingTop: 20
	},slider: {
		marginHorizontal: 5
	}, sliderContainer: {
		backgroundColor: '#fff',
		height: 50,
		borderWidth: 1,
		borderColor: '#4FA800',
		borderRadius: 4,
		justifyContent: 'center',
		marginHorizontal: 20
	},sliderThumb: {
		backgroundColor: '#7DBA00',
		borderRadius: 0,
		width: 20,
		height: 30,
	},
});


const mapStateToProps = (state) => {
	return {
		userInfo: state.userState.userInfo
	}
}

export default connect(mapStateToProps)(UpdateProgressTask);
