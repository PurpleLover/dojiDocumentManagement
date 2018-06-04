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
import * as SBIcons from '../../assets/styles/SideBarIcons';

import Panel from './Panel';
import Confirm from './Confirm';
import { width } from '../../common/SystemConstant';

const headerBackground = require('../../assets/images/background.png');
const userAvatar = require('../../assets/images/avatar.png');
const subItemIconLink = require('../../assets/images/arrow-white-right.png');

export default class SideBar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showModal: false,
            userInfo: {

            },
            onFocusNow: '6',
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
        const subItemIcon = <Image source={subItemIconLink}></Image>;
        return (
            <View style={SideBarStyle.container}>
                <View style={SideBarStyle.header}>
                    <ImageBackground source={headerBackground} style={SideBarStyle.headerBackground}>
                        <View style={SideBarStyle.headerAvatarContainer}>
                            <Image source={userAvatar} style={SideBarStyle.headerAvatar} />
                        </View>
                        {/*
                            * Purpose: WRAP text when too long
                            * Mark: NOT the best solution but works
                        */}
                        <View style={[SideBarStyle.headerUserInfoContainer, { flex: 1 }]}>
                            <View style={{ flexDirection: 'row' }}>
                                <Text style={[SideBarStyle.headerUserName, { flex: 1, flexWrap: 'wrap' }]}>
                                    {this.state.userInfo.Fullname}
                                    {/* Cao Thị Thu Lan Lóng Lánh Kim Cuong Bao Ngoc Trai */}
                                </Text>
                            </View>

                            <View style={{ flexDirection: 'row' }}>
                                <Text style={[SideBarStyle.headerUserJob, { flex: 1, flexWrap: 'wrap' }]}>
                                    {this.state.userInfo.Position}
                                    {/* Đang đêm đông đốt đèn đồng đi đâu đấy đi đái đây đụng đầu vào đá đành đứng đấy đái */}
                                </Text>
                            </View>
                        </View>
                    </ImageBackground>
                </View>
                <View style={SideBarStyle.body}>
                    <ScrollView ref={ref => this.scrollView = ref}
                        onContentSizeChange={(contentWidth, contentHeight) => {
                            this.scrollView.scrollToEnd({ animated: true });
                        }}>
                        <Panel title='VĂN BẢN TRÌNH KÝ'>
                            <TouchableOpacity onPress={() => this.setCurrentFocus('ListIsNotProcessedScreen', '1')} style={this.state.onFocusNow === '1' && SideBarStyle.listItemFocus}>
                                <ListItem
                                    leftIcon={this.state.onFocusNow !== '1' ? <Image source={SBIcons.doc_NotCompleted_Neutral} style={SideBarStyle.listItemLeftIcon}></Image> : <Image source={SBIcons.doc_NotCompleted_Active} style={SideBarStyle.listItemLeftIcon}></Image>}
                                    titleStyle={[SideBarStyle.listItemSubTitleContainer, this.state.onFocusNow === '1' && SideBarStyle.listItemSubTitleContainerFocus]}
                                    title={'Chưa xử lý'} contentContainerStyle={SideBarStyle.subItemContainer} rightIcon={this.state.onFocusNow === '1' && subItemIcon} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => this.setCurrentFocus('ListIsProcessedScreen', '2')} style={this.state.onFocusNow === '2' && SideBarStyle.listItemFocus}>
                                <ListItem
                                    leftIcon={this.state.onFocusNow !== '2' ? <Image source={SBIcons.doc_IsCompleted_Neutral} style={SideBarStyle.listItemLeftIcon}></Image> : <Image source={SBIcons.doc_IsCompleted_Active} style={SideBarStyle.listItemLeftIcon}></Image>}
                                    titleStyle={[SideBarStyle.listItemSubTitleContainer, this.state.onFocusNow === '2' && SideBarStyle.listItemSubTitleContainerFocus]}
                                    title={'Đã xử lý'} contentContainerStyle={SideBarStyle.subItemContainer} rightIcon={this.state.onFocusNow === '2' && subItemIcon} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => this.setCurrentFocus('ListIsNotReviewedScreen', '3')} style={this.state.onFocusNow === '3' && SideBarStyle.listItemFocus}>
                                <ListItem
                                    leftIcon={this.state.onFocusNow !== '3' ? <Image source={SBIcons.doc_NotReviewed_Neutral} style={SideBarStyle.listItemLeftIcon}></Image> : <Image source={SBIcons.doc_NotReviewed_Active} style={SideBarStyle.listItemLeftIcon}></Image>}
                                    titleStyle={[SideBarStyle.listItemSubTitleContainer, this.state.onFocusNow === '3' && SideBarStyle.listItemSubTitleContainerFocus]}
                                    title={'Cần review'} contentContainerStyle={SideBarStyle.subItemContainer} rightIcon={this.state.onFocusNow === '3' && subItemIcon} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => this.setCurrentFocus('ListIsReviewedScreen', '4')} style={this.state.onFocusNow === '4' && SideBarStyle.listItemFocus}>
                                <ListItem
                                    leftIcon={this.state.onFocusNow !== '4' ? <Image source={SBIcons.doc_IsReviewed_Neutral} style={SideBarStyle.listItemLeftIcon}></Image> : <Image source={SBIcons.doc_IsReviewed_Active} style={SideBarStyle.listItemLeftIcon}></Image>}
                                    titleStyle={[SideBarStyle.listItemSubTitleContainer, this.state.onFocusNow === '4' && SideBarStyle.listItemSubTitleContainerFocus]}
                                    title={'Đã review'} contentContainerStyle={SideBarStyle.subItemContainer} rightIcon={this.state.onFocusNow === '4' && subItemIcon} />
                            </TouchableOpacity>
                        </Panel>

                        <Panel title='VĂN BẢN ĐÃ PHÁT HÀNH'>
                            <TouchableOpacity onPress={() => this.setCurrentFocus('ListIsPublishedScreen', '5')} style={this.state.onFocusNow === '5' && SideBarStyle.listItemFocus}>
                                <ListItem
                                    leftIcon={this.state.onFocusNow !== '5' ? <Image source={SBIcons.doc_Published_Neutral} style={SideBarStyle.listItemLeftIcon}></Image> : <Image source={SBIcons.doc_Published_Active} style={SideBarStyle.listItemLeftIcon}></Image>}
                                    titleStyle={[SideBarStyle.listItemSubTitleContainer, this.state.onFocusNow === '5' && SideBarStyle.listItemSubTitleContainerFocus]}
                                    title={'Danh sách'} contentContainerStyle={SideBarStyle.subItemContainer} rightIcon={this.state.onFocusNow === '5' && subItemIcon} />
                            </TouchableOpacity>
                        </Panel>

                        <Panel title='CÔNG VIỆC'>
                            <TouchableOpacity onPress={() => this.setCurrentFocus('ListPersonalTaskScreen', '6')} style={this.state.onFocusNow === '6' && SideBarStyle.listItemFocus}>
                                <ListItem
                                    leftIcon={this.state.onFocusNow !== '6' ? <Image source={SBIcons.works_Personal_Neutral} style={SideBarStyle.listItemLeftIcon}></Image> : <Image source={SBIcons.works_Personal_Active} style={SideBarStyle.listItemLeftIcon}></Image>}
                                    titleStyle={[SideBarStyle.listItemSubTitleContainer, this.state.onFocusNow === '6' && SideBarStyle.listItemSubTitleContainerFocus]}
                                    title={'Cá nhân'} style={SideBarStyle.subItemContainer} rightIcon={this.state.onFocusNow === '6' && subItemIcon} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => this.setCurrentFocus('ListAssignedTaskScreen', '7')} style={this.state.onFocusNow === '7' && SideBarStyle.listItemFocus}>
                                <ListItem
                                    leftIcon={this.state.onFocusNow !== '7' ? <Image source={SBIcons.works_Quested_Neutral} style={SideBarStyle.listItemLeftIcon}></Image> : <Image source={SBIcons.works_Quested_Active} style={SideBarStyle.listItemLeftIcon}></Image>}
                                    titleStyle={[SideBarStyle.listItemSubTitleContainer, this.state.onFocusNow === '7' && SideBarStyle.listItemSubTitleContainerFocus]}
                                    title={'Được giao'} style={SideBarStyle.subItemContainer} rightIcon={this.state.onFocusNow === '7' && subItemIcon} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => this.setCurrentFocus('ListCombinationTaskScreen', '8')} style={this.state.onFocusNow === '8' && SideBarStyle.listItemFocus}>
                                <ListItem
                                    leftIcon={this.state.onFocusNow !== '8' ? <Image source={SBIcons.works_Groups_Neutral} style={SideBarStyle.listItemLeftIcon}></Image> : <Image source={SBIcons.works_Groups_Active} style={SideBarStyle.listItemLeftIcon}></Image>}
                                    titleStyle={[SideBarStyle.listItemSubTitleContainer, this.state.onFocusNow === '8' && SideBarStyle.listItemSubTitleContainerFocus]}
                                    title={'Phối hợp xử lý'} style={SideBarStyle.subItemContainer} rightIcon={this.state.onFocusNow === '8' && subItemIcon} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => this.setCurrentFocus('ListProcessedTaskScreen', '9')} style={this.state.onFocusNow === '9' && SideBarStyle.listItemFocus}>
                                <ListItem
                                    leftIcon={this.state.onFocusNow !== '9' ? <Image source={SBIcons.works_Completed_Neutral} style={SideBarStyle.listItemLeftIcon}></Image> : <Image source={SBIcons.works_Completed_Active} style={SideBarStyle.listItemLeftIcon}></Image>}
                                    titleStyle={[SideBarStyle.listItemSubTitleContainer, this.state.onFocusNow === '9' && SideBarStyle.listItemSubTitleContainerFocus]}
                                    title={'Đã giao xử lý'} style={SideBarStyle.subItemContainer} rightIcon={this.state.onFocusNow === '9' && subItemIcon} />
                            </TouchableOpacity>
                        </Panel>

                        <TouchableOpacity onPress={() => this.onLogOut()}>
                            <ListItem
                                leftIcon={<Image source={SBIcons.signout_Turnoff} style={[SideBarStyle.listItemLeftIcon, { marginLeft: 0 }]}></Image>}
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