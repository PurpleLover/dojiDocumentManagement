/*
	@description: màn hình phản hồi văn bản cần review
	@author: duynn
	@since: 16/05/2018
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
    Form, Button, Icon as NBIcon, Text as NBText, Item, Input, Title, Picker, Toast,
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

import * as workflowAction from '../../../redux/modules/workflow/WorkflowAction';

import { pushFirebaseNotify } from '../../../firebase/FireBaseClient';

class WorkflowReplyReview extends Component {
	constructor(props){
		super(props);
		this.state = {
			userId: this.props.userInfo.ID,

			docId: this.props.navigation.state.params.docId,
            docType: this.props.navigation.state.params.docType,
            
            itemType: this.props.navigation.state.params.itemType,
            message: EMPTY_STRING,
			selected: 1,
            executeLoading: false
		}
	}

	onValueChange(value: string) {
        this.setState({
          selected: value
        });
    }

    navigateBack(){
        this.props.navigation.navigate('DetailSignDocScreen', {
            docId: this.state.docId,
            docType:this.state.docType
        })
    }

    onConfirmReplyReview(){
        Alert.alert(
            'XÁC NHẬN PHẢN HỒI', 
            'Bạn có chắc chắn muốn thực hiện việc này?', 
            [
                {
                    text: 'Đồng ý', onPress: ()=> {
                        this.saveReplyReview();
                    }
                },

                {
                    text: 'Hủy bỏ', onPress: ()=> {

                    }
                }
            ]
        )
    }

    async saveReplyReview(){
        this.setState({
            executeLoading: true
        });

        const result = await fetch(API_URL + '/api/VanBanDi/SaveReplyReview', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json; charset=utf-8',
            },
            body: JSON.stringify({
                userID: this.state.userId,
                phanHoiVanBan: this.state.message,
                pheDuyetVanBan: this.state.selected,
                itemId: this.state.docId,
                itemType: this.state.itemType
            })
        });

        const resultJson = await result.json();
        
        await asyncDelay(2000);
        
        this.setState({
            executeLoading: false
        });
        
        if(!util.isNull(resultJson.GroupTokens) && !util.isEmpty(resultJson.GroupTokens)){
            const message = this.props.userInfo.Fullname + " đã trả lời yêu cầu review 1 văn bản";
            const content = {
                title: 'TRẢ LỜI REVIEW VĂN BẢN',
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
            text: resultJson.Status ? 'Phản hồi yêu cầu review thành công' : 'Phản hồi yêu cầu review không thành công',
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
                <Header style={{ backgroundColor: HEADER_COLOR }}>
                    <Left>
						<Button transparent onPress={() => this.navigateBack()}>
							<Icon name='ios-arrow-dropleft-circle' size={30} color={'#fff'} type="ionicon" />
						</Button>
					</Left>

                    <Body>
                        <Title>
                            REVIEW VĂN BẢN TRÌNH KÝ
                        </Title>
                    </Body>
                    <Right>
						<Button transparent onPress={()=> this.onConfirmReplyReview()}>
							<Icon name='ios-checkmark-circle' size={30} color={'#fff'} type="ionicon" />
						</Button>
					</Right>
                </Header>

                <Content>
                    <Form>
                        <Item stackedLabel>
                            <Label>Phản hồi</Label>
                            <Input onChangeText={(message) => this.setState({message})}/>
                        </Item>

                        <Item stackedLabel>
                            <Label>Đánh giá</Label>
                            <Picker mode='dropdown'
                            iosHeader='Chọn kết quả đánh giá'
                            iosIcon={<NBIcon name='ios-arrow-down-outline'/>}
                            style={{width: '100%'}}
                            selectedValue={this.state.selected}
                            onValueChange={this.onValueChange.bind(this)}>
                                <Picker.Item label='Đồng ý' value='1'/>
                                <Picker.Item label='Trả lại' value='0'/>       
                            </Picker>
                        </Item>
                    </Form>
                </Content>

                {
                    executeLoading(this.state.executeLoading)
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

const mapDispatchToProps = (dispatch) => {
    return {
        resetProcessUsers: ()=> dispatch(workflowAction.resetProcessUsers())
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(WorkflowReplyReview);