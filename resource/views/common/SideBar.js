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

            },
            onFocusNow: '',
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

    setCurrentFocus(screenName, ref) {
        this.setState({
            onFocusNow: ref,
        });
        this.navigate(screenName);
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
                            <Text style={[SideBarStyle.headerUserName, { flexWrap: 'wrap' }]}>
                                {this.state.userInfo.Fullname}
                            </Text>

                            <Text style={[SideBarStyle.headerUserJob, { flexWrap: 'wrap' }]}>
                                {this.state.userInfo.Position}
                            </Text>
                        </View>
                    </ImageBackground>
                </View>
                <View style={SideBarStyle.body}>
                    <ScrollView>
                        <Panel title='VĂN BẢN TRÌNH KÝ'>
                            <TouchableOpacity onPress={() => this.setCurrentFocus('ListIsNotProcessedScreen', '1')} style={this.state.onFocusNow === '1' && SideBarStyle.listItemFocus}>
                                <ListItem
                                    titleStyle={[SideBarStyle.listItemSubTitleContainer, this.state.onFocusNow === '1' && SideBarStyle.listItemSubTitleContainerFocus]}
                                    title={'Chưa xử lý'} contentContainerStyle={SideBarStyle.subItemContainer} hideChevron={true} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => this.setCurrentFocus('ListIsProcessedScreen', '2')} style={this.state.onFocusNow === '2' && SideBarStyle.listItemFocus}>
                                <ListItem
                                    titleStyle={[SideBarStyle.listItemSubTitleContainer, this.state.onFocusNow === '2' && SideBarStyle.listItemSubTitleContainerFocus]}
                                    title={'Đã xử lý'} contentContainerStyle={SideBarStyle.subItemContainer} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => this.setCurrentFocus('ListIsNotReviewedScreen', '3')} style={this.state.onFocusNow === '3' && SideBarStyle.listItemFocus}>
                                <ListItem
                                    titleStyle={[SideBarStyle.listItemSubTitleContainer, this.state.onFocusNow === '3' && SideBarStyle.listItemSubTitleContainerFocus]}
                                    title={'Cần review'} contentContainerStyle={SideBarStyle.subItemContainer} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => this.setCurrentFocus('ListIsReviewedScreen', '4')} style={this.state.onFocusNow === '4' && SideBarStyle.listItemFocus}>
                                <ListItem
                                    titleStyle={[SideBarStyle.listItemSubTitleContainer, this.state.onFocusNow === '4' 
                                    && SideBarStyle.listItemSubTitleContainerFocus]}
                                    title={'Đã review'} contentContainerStyle={SideBarStyle.subItemContainer} />
                            </TouchableOpacity>
                        </Panel>

                        <Panel title='VĂN BẢN ĐÃ PHÁT HÀNH'>
                            <TouchableOpacity onPress={() => this.setCurrentFocus('ListIsPublishedScreen', '5')} style={this.state.onFocusNow === '5' && SideBarStyle.listItemFocus}>
                                <ListItem
                                    titleStyle={[SideBarStyle.listItemSubTitleContainer, this.state.onFocusNow === '5' 
                                    && SideBarStyle.listItemSubTitleContainerFocus]}
                                    title={'Danh sách'} contentContainerStyle={SideBarStyle.subItemContainer} />
                            </TouchableOpacity>
                        </Panel>

                        <Panel title='CÔNG VIỆC'>
                            <TouchableOpacity onPress={() => this.setCurrentFocus('ListPersonalTaskScreen', '6')} style={this.state.onFocusNow === '6' && SideBarStyle.listItemFocus}>
                                <ListItem
                                    titleStyle={[SideBarStyle.listItemSubTitleContainer, this.state.onFocusNow === '6' && SideBarStyle.listItemSubTitleContainerFocus]}
                                    title={'Cá nhân'} style={SideBarStyle.subItemContainer} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => this.setCurrentFocus('ListAssignedTaskScreen', '7')} style={this.state.onFocusNow === '7' && SideBarStyle.listItemFocus}>
                                <ListItem
                                    titleStyle={[SideBarStyle.listItemSubTitleContainer, this.state.onFocusNow === '7' && SideBarStyle.listItemSubTitleContainerFocus]}
                                    title={'Được giao'} style={SideBarStyle.subItemContainer} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => this.setCurrentFocus('ListCombinationTaskScreen', '8')} style={this.state.onFocusNow === '8' && SideBarStyle.listItemFocus}>
                                <ListItem
                                    titleStyle={[SideBarStyle.listItemSubTitleContainer, this.state.onFocusNow === '8' && SideBarStyle.listItemSubTitleContainerFocus]}
                                    title={'Phối hợp xử lý'} style={SideBarStyle.subItemContainer} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => this.setCurrentFocus('ListProcessedTaskScreen', '9')} style={this.state.onFocusNow === '9' && SideBarStyle.listItemFocus}>
                                <ListItem
                                    titleStyle={[SideBarStyle.listItemSubTitleContainer, this.state.onFocusNow === '9' && SideBarStyle.listItemSubTitleContainerFocus]}
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

                <Confirm ref='confirm' title={'XÁC NHẬN THOÁT'} navigation={this.props.navigation} userInfo={this.state.userInfo} />
            </View>
        );
    }
}