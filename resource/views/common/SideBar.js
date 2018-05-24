/**
 * @description: giao diện bên tay trái người dùng
 * @author: duynn
 * @since: 02/05/2018
 */
import React, { Component } from 'react';
import {
    AsyncStorage, View, Text, ScrollView, Image,
    ImageBackground, Modal,
    TouchableOpacity
} from 'react-native';

//native-base
import {
    Container, Header, Content,
    Left, Right, Body, Title, Footer
} from 'native-base';

import { ListItem } from 'react-native-elements';

import { SideBarStyle } from '../../assets/styles/SideBarStyle';
import Panel from './Panel';
import Confirm from './Confirm';

const headerBackground = require('../../assets/images/background.png');
const userAvatar = require('../../assets/images/avatar.png');

export default class SideBar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showModal: false,
            userInfo: {

            }
        }
    }


    async componentWillMount() {
        const userInfo = await AsyncStorage.getItem('userInfo').then((result) => {
            return JSON.parse(result);
        }); 
        this.setState({
            userInfo
        });
    }

    navigate(screenName) {
        this.props.navigation.navigate(screenName);
    }

    onLogOut() {
        this.refs.confirm.showModal();
    }

    render() {
        return (
            <View style={SideBarStyle.container}>
                <View style={SideBarStyle.header}>
                    <ImageBackground source={headerBackground} style={SideBarStyle.headerBackground}>
                        <View style={SideBarStyle.headerAvatarContainer}>
                            <Image source={userAvatar} style={SideBarStyle.headerAvatar} />
                        </View>

                        <View style={SideBarStyle.headerUserInfoContainer}>
                            <Text style={[SideBarStyle.headerUserName, {flexWrap: 'wrap'}]}>
                                {this.state.userInfo.Fullname}
                            </Text>

                            <Text style={[SideBarStyle.headerUserJob,{flexWrap: 'wrap'}]}>
                                {this.state.userInfo.Position}
                            </Text>
                        </View>
                    </ImageBackground>
                </View>
                <View style={SideBarStyle.body}>
                    <ScrollView>
                        <Panel title='VĂN BẢN TRÌNH KÝ'>
                            <TouchableOpacity onPress={() => this.navigate('ListIsNotProcessedScreen')}>
                                <ListItem
                                    titleStyle={SideBarStyle.listItemSubTitleContainer}
                                    title={'Chưa xử lý'} style={SideBarStyle.subItemContainer} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => this.navigate('ListIsProcessedScreen')}>
                                <ListItem
                                    titleStyle={SideBarStyle.listItemSubTitleContainer}
                                    title={'Đã xử lý'} style={SideBarStyle.subItemContainer} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => this.navigate('ListIsNotReviewedScreen')}>
                                <ListItem
                                    titleStyle={SideBarStyle.listItemSubTitleContainer}
                                    title={'Cần review'} style={SideBarStyle.subItemContainer} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => this.navigate('ListIsReviewedScreen')}>
                                <ListItem
                                    titleStyle={SideBarStyle.listItemSubTitleContainer}
                                    title={'Đã review'} style={SideBarStyle.subItemContainer} />
                            </TouchableOpacity>
                        </Panel>

                        <Panel title='VĂN BẢN ĐÃ PHÁT HÀNH'>
                            <TouchableOpacity onPress={() => this.navigate('ListIsPublishedScreen')}>
                                <ListItem
                                    titleStyle={SideBarStyle.listItemSubTitleContainer}
                                    title={'Danh sách'} style={SideBarStyle.subItemContainer} />
                            </TouchableOpacity>
                        </Panel>

                        <Panel title='CÔNG VIỆC'>
                            <TouchableOpacity onPress={() => this.navigate('ListPersonalTaskScreen')}>
                                <ListItem
                                    titleStyle={SideBarStyle.listItemSubTitleContainer}
                                    title={'Cá nhân'} style={SideBarStyle.subItemContainer} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => this.navigate('ListAssignedTaskScreen')}>
                                <ListItem
                                    titleStyle={SideBarStyle.listItemSubTitleContainer}
                                    title={'Được giao'} style={SideBarStyle.subItemContainer} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => this.navigate('ListCombinationTaskScreen')}>
                                <ListItem
                                    titleStyle={SideBarStyle.listItemSubTitleContainer}
                                    title={'Phối hợp xử lý'} style={SideBarStyle.subItemContainer} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => this.navigate('ListProcessedTaskScreen')}>
                                <ListItem
                                    titleStyle={SideBarStyle.listItemSubTitleContainer}
                                    title={'Đã giao xử lý'} style={SideBarStyle.subItemContainer} />
                            </TouchableOpacity>
        </Panel>

                        <TouchableOpacity onPress={() => this.onLogOut()}>
                            <ListItem
                                hideChevron={true}
                                containerStyle={SideBarStyle.listItemContainer}
                                title={'ĐĂNG XUẤT'}
                                titleStyle={SideBarStyle.listItemTitle}
                            />
                        </TouchableOpacity>
                    </ScrollView>
                </View>

                <Confirm ref='confirm' title={'XÁC NHẬN THOÁT'} navigation={this.props.navigation} userInfo={this.state.userInfo}/>
            </View>
        );
    }
}