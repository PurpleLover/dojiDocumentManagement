/*
	@description: đánh giá công việc
	@author: duynn
	@since: 15/05/2018
*/
'use strict'
import React, { Component } from 'react';
import {
    ActivityIndicator, View, Text, Modal,
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
    Container, Header, Content, Left, Right, Body, CheckBox, Label,Textarea, Picker,
    Tab, Tabs, TabHeading, ScrollableTab, List as NBList, ListItem as NBListItem, Radio
} from 'native-base';

//react-native-elements
import { ListItem, Icon } from 'react-native-elements';
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

class EvaluationTask extends Component{
	constructor(props){
		super(props);
        this.state = {
            taskId: this.props.navigation.state.params.taskId,
            taskType: this.props.navigation.state.params.taskType,
            userId: this.props.userInfo.ID,

            TDG_TUCHUCAO: '0',
            TDG_TRACHNHIEMLON: '0',
            TDG_TUONGTACTOT: '0',
            TDG_TOCDONHANH: '0',
            TDG_TIENBONHIEU: '0',
            TDG_THANHTICHVUOT: '0',
            executing: false
        }
	}

    navigateBack(){
        this.props.navigation.navigate('DetailTaskScreen', {
            taskId: this.state.taskId,
            taskType: this.state.taskType
        });
    }

    async evaluateTask(){
        const url = `${API_URL}/api/HscvCongViec/SaveEvaluationTask`;

        this.setState({
            executing: true
        })

        const result = await fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json; charset=utf-8',
            }, body: JSON.stringify({
                userId: this.state.userId,
                taskId: this.state.taskId,
                TDG_TUCHUCAO: this.state.TDG_TUCHUCAO == EMPTY_STRING ? 0 : this.state.TDG_TUCHUCAO,
                TDG_TRACHNHIEMLON: this.state.TDG_TRACHNHIEMLON == EMPTY_STRING ? 0 : this.state.TDG_TRACHNHIEMLON,
                TDG_TUONGTACTOT: this.state.TDG_TUONGTACTOT == EMPTY_STRING ? 0 : this.state.TDG_TUONGTACTOT,
                TDG_TOCDONHANH: this.state.TDG_TOCDONHANH == EMPTY_STRING ? 0 : this.state.TDG_TOCDONHANH,
                TDG_TIENBONHIEU: this.state.TDG_TIENBONHIEU == EMPTY_STRING ? 0 : this.state.TDG_TIENBONHIEU,
                TDG_THANHTICHVUOT: this.state.TDG_THANHTICHVUOT == EMPTY_STRING ? 0 : this.state.TDG_THANHTICHVUOT
            })
        });

        const resultJson = await result.json();

        await asyncDelay(2000);

        this.setState({
            executing: false
        });

        if(resultJson.Status == true && !util.isNull(resultJson.GroupTokens) && !util.isEmpty(resultJson.GroupTokens)){
            const message = this.props.userInfo.Fullname + ' đã đánh giá một công việc';
            const content = {
                title: 'GỬI ĐÁNH GIÁ CÔNG VIỆC',
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
            text: resultJson.Status ? 'Tự đánh giá công việc thành công' : 'Tự đánh giá công việc không thành công',
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

    onValueChange(value, type){
        switch(type){
            case 'TDG_TUCHUCAO':
                this.setState({
                    TDG_TUCHUCAO: value
                })
            break;

            case 'TDG_TRACHNHIEMLON':
                this.setState({
                    TDG_TRACHNHIEMLON: value
                })
            break;

            case 'TDG_TUONGTACTOT':
                this.setState({
                    TDG_TUONGTACTOT: value
                })
            break;

            case 'TDG_TOCDONHANH':
                this.setState({
                    TDG_TOCDONHANH: value
                })
            break;

            case 'TDG_TIENBONHIEU':
                this.setState({
                    TDG_TIENBONHIEU: value
                })
            break;

            default:
                 this.setState({
                    TDG_THANHTICHVUOT: value
                })
            break;
        }
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
                                ĐÁNH GIÁ CÔNG VIỆC
                            </Title>
                        </Body>
                        <Right/>
                </Header>

                <Content>
                    <Form>
                        <Item inlineLabel style={styles.itemContainer}>
                            <Label style={styles.itemHeader}>Hạng mục đánh giá</Label>
                            <Label style={[{flex: 2}, styles.itemHeader]}>Điểm tự đánh giá</Label>
                            <Label style={styles.itemHeader}>Trọng số</Label>
                        </Item>

                        <Item inlineLabel style={styles.itemContainer}>
                            <Label style={styles.itemLabel}>Tự chủ cao</Label>
                            <Picker style={{flex: 2}} onValueChange={(value) => this.onValueChange(value, 'TDG_TUCHUCAO')}
                                iosHeader='Điểm tự chủ cao' mode='dropdown' selectedValue={this.state.TDG_TUCHUCAO}>
                                <Picker.Item label="0" value="0" />
                                <Picker.Item label="1" value="1" />
                                <Picker.Item label="2" value="2" />
                                <Picker.Item label="3" value="3" />
                                <Picker.Item label="4" value="4" />
                                <Picker.Item label="5" value="5" />
                            </Picker>
                            <Label style={styles.itemLabel}>2</Label>
                        </Item>

                        <Item inlineLabel style={styles.itemContainer}>
                            <Label style={styles.itemLabel}>Trách nhiệm lớn</Label>
                            <Picker style={{flex: 2}} onValueChange={(value) => this.onValueChange(value, 'TDG_TRACHNHIEMLON')}
                                iosHeader='Điểm trách nhiệm lớn' mode='dropdown' selectedValue={this.state.TDG_TRACHNHIEMLON}>
                                <Picker.Item label="0" value="0" />
                                <Picker.Item label="1" value="1" />
                                <Picker.Item label="2" value="2" />
                                <Picker.Item label="3" value="3" />
                                <Picker.Item label="4" value="4" />
                                <Picker.Item label="5" value="5" />
                            </Picker>
                            <Label style={styles.itemLabel}>2</Label>
                        </Item>

                        <Item inlineLabel style={styles.itemContainer}>
                            <Label style={styles.itemLabel}>Tương tác tốt</Label>
                            <Picker style={{flex: 2}} onValueChange={(value) => this.onValueChange(value, 'TDG_TUONGTACTOT')}
                                iosHeader='Điểm tương tác tốt' mode='dropdown' selectedValue={this.state.TDG_TUONGTACTOT}>
                                <Picker.Item label="0" value="0" />
                                <Picker.Item label="1" value="1" />
                                <Picker.Item label="2" value="2" />
                                <Picker.Item label="3" value="3" />
                                <Picker.Item label="4" value="4" />
                                <Picker.Item label="5" value="5" />
                            </Picker>
                            <Label style={styles.itemLabel}>1</Label>
                        </Item>
                        <Item inlineLabel style={styles.itemContainer}>
                            <Label style={styles.itemLabel}>Tốc độ nhanh</Label>
                            <Picker style={{flex: 2}} onValueChange={(value) => this.onValueChange(value, 'TDG_TOCDONHANH')}
                                iosHeader='Điểm tốc độ nhanh' mode='dropdown' selectedValue={this.state.TDG_TOCDONHANH}>
                                <Picker.Item label="0" value="0" />
                                <Picker.Item label="1" value="1" />
                                <Picker.Item label="2" value="2" />
                                <Picker.Item label="3" value="3" />
                                <Picker.Item label="4" value="4" />
                                <Picker.Item label="5" value="5" />
                            </Picker>
                            <Label style={styles.itemLabel}>1</Label>
                        </Item>
                        
                        <Item inlineLabel style={styles.itemContainer}>
                            <Label style={styles.itemLabel}>Tiến bộ nhiều</Label>
                             <Picker style={{flex: 2}} onValueChange={(value) => this.onValueChange(value, 'TDG_TIENBONHIEU')}
                                iosHeader='Điểm tiến bộ nhiều' mode='dropdown' selectedValue={this.state.TDG_TIENBONHIEU}>
                                <Picker.Item label="0" value="0" />
                                <Picker.Item label="1" value="1" />
                                <Picker.Item label="2" value="2" />
                                <Picker.Item label="3" value="3" />
                                <Picker.Item label="4" value="4" />
                                <Picker.Item label="5" value="5" />
                            </Picker>
                            <Label style={styles.itemLabel}>1</Label>
                        </Item>

                        <Item inlineLabel style={styles.itemContainer}>
                            <Label style={styles.itemLabel}>Thành tích vượt</Label>
                            <Picker style={{flex: 2}} onValueChange={(value) => this.onValueChange(value, 'TDG_THANHTICHVUOT')}
                                iosHeader='Điểm thành tích vượt' mode='dropdown' selectedValue={this.state.TDG_THANHTICHVUOT}>
                                <Picker.Item label="0" value="0" />
                                <Picker.Item label="1" value="1" />
                                <Picker.Item label="2" value="2" />
                                <Picker.Item label="3" value="3" />
                                <Picker.Item label="4" value="4" />
                                <Picker.Item label="5" value="5" />
                            </Picker>
                            <Label style={styles.itemLabel}>1</Label>
                        </Item>                        
                    </Form>

                    <Button iconLeft full rounded style={{backgroundColor: '#337321', marginTop: 20}} onPress={()=> this.evaluateTask()}>
                        <NBIcon name='ios-checkmark-circle-outline' />
                        <NBText>ĐÁNH GIÁ</NBText>
                    </Button>
                </Content>

                {
                    executeLoading(this.state.executing)
                }
			</Container>
		);
	}
}

const styles = {
    itemHeader: {
        flex:1,
        paddingVertical: 5,
        fontSize: 13,
        fontWeight: 'bold',
        textAlign: 'center',
        backgroundColor: '#F4F4F4'
    },
    itemContainer: {
        justifyContent: 'space-between'
    },
    itemLabel: {
        flex:1, 
        textAlign: 'center'
    },
    itemInput: {
        flex:2,
        borderRadius:3,
        borderWidth:1,
        borderColor: '#d9d5dc',
        marginVertical: 5
    }
}

const mapStateToProps = (state) => {
	return {
		userInfo: state.userState.userInfo
	}
}

export default connect(mapStateToProps)(EvaluationTask);