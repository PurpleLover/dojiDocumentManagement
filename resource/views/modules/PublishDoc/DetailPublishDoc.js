/**
 * @description: chi tiết văn bản đã xuất bản
 * @author: duynn
 * @since: 03/05/2018
 */
'use strict'
import React, { Component } from 'react';
import {
    ActivityIndicator, View, Text, Modal,
    FlatList, Image
} from 'react-native';

//constant
import { API_URL, HEADER_COLOR, LOADER_COLOR, DOKHAN_CONSTANT } from '../../../common/SystemConstant';
//styles
import { DetailPublishDocStyle } from '../../../assets/styles/PublishDocStyle';
import { dataLoading } from '../../../common/Effect';
import { asyncDelay, unAuthorizePage, openSideBar } from '../../../common/Utilities';
import { TabStyle } from '../../../assets/styles/TabStyle';

//lib
import { connect } from 'react-redux';
import renderIf from 'render-if';
import * as util from 'lodash';
import { ListItem, Icon } from 'react-native-elements';
import {
    Button, Icon as NBIcon, Item, Input, Title,
    Container, Header, Content, Left, Right, Body,
    ScrollableTab, Tab, TabHeading, Tabs, Text as NBText
} from 'native-base';
import { MenuProvider, Menu, MenuTrigger, MenuOptions, MenuOption } from 'react-native-popup-menu';

//views
import AttachPublishDoc from './AttachPublishDoc';
import MainInfoPublishDoc from './MainInfoPublishDoc';
import TimelinePublishDoc from './TimelinePublishDoc';

class DetailPublishDoc extends Component {

    constructor(props) {
        super(props)

        this.state = {
            userId: this.props.userInfo.ID,
            isUnAuthorize: false,
            loading: false,
            docInfo: {}
        }
    }

    componentWillMount() {
        this.getInfo();
    }

    async getInfo() {
        this.setState({
            loading: true
        });

        const docId = this.props.navigation.state.params.docId;
        const url = `${API_URL}/api/VanBanDen/GetDetail/${docId}/${this.state.userId}`;
        const docInfo = await fetch(url)
            .then((response) => response.json())
            .then(responseJson => {
                return responseJson;
            });

        await asyncDelay(2000);

        this.setState({
            docInfo,
            isUnAuthorize: util.isNull(docInfo),
            loading: false
        });
    }

    navigateBack(){
        this.props.navigation.navigate('ListIsPublishedScreen');
    }

    render() {
        let content = null;
        let menuSteps = null;
        if (this.state.isUnAuthorize) {
            content = unAuthorizePage(this.props.navigation);
        } else if (this.state.loading) {
            content = dataLoading(true);
        } else {
            content = <PublisDocContent info={this.state.docInfo} />
            // menuSteps = this.state.docInfo.vanBanDen.LstStep.length > 0 ? (
            //     <Menu>
            //         <MenuTrigger>
            //             <Icon name='dots-three-horizontal' size={30} color={'#fff'} type="entypo" />
            //         </MenuTrigger>
            //         <MenuOptions>
            //             {
            //                 this.state.docInfo.vanBanDen.LstStep.map((item, index) => (
            //                     <MenuOption key={index}
            //                         style={[MenuOptionStyle.wrapper,
            //                             (index !== this.state.docInfo.vanBanDen.LstStep.length - 1 ? MenuOptionStyle.wrapperBorder : null)
            //                         ]}>
            //                         <Text style={MenuOptionStyle.text}>
            //                             {util.toUpper(item.NAME)}
            //                         </Text>
            //                     </MenuOption>
            //                 ))
            //             }
            //         </MenuOptions>
            //     </Menu>
            // ) : null;
        }

        return (
            <Container hasTabs>
                <Header style={{ backgroundColor: HEADER_COLOR, justifyContent:'space-between' }}>
                    <Left style={{flex:1}}>
                        <Button transparent onPress={() => this.navigateBack()}>
                                <Icon name='ios-arrow-dropleft-circle' size={30} color={'#fff'} type="ionicon" />
                        </Button>
                    </Left>

                    <Body style={{flex:3, color:'#fff'}}>
                            THÔNG TIN VĂN BẢN
                    </Body>
                    <Right style={{flex:1}}>
                    
                    </Right>
                </Header>
                {
                    content
                }
            </Container>
        );
    }
}

class PublisDocContent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentTab: 0
        }
    }

    render() {
        return (
            <View style={{ flex: 1 }}>
                <Tabs renderTabBar={() => <ScrollableTab />}
                    initialPage={this.state.currentTab}
                    onChangeTab={({ index }) => this.setState({
                        currentTab: index
                    })}
                    tabBarUnderlineStyle={
                        {
                            borderBottomWidth: 4,
                            borderBottomColor: '#FF6600'
                        }}>
                    <Tab heading={
                        <TabHeading style={(this.state.currentTab == 0 ? TabStyle.activeTab : TabStyle.inActiveTab)}>
                            <NBIcon name='information-circle' style={(this.state.currentTab == 0 ? TabStyle.activeText : TabStyle.inActiveText)} />
                            <NBText style={[TabStyle.tabText,
                            (this.state.currentTab == 0 ? TabStyle.activeText : TabStyle.inActiveText)]}>
                                THÔNG TIN CHÍNH
                            </NBText>
                        </TabHeading>
                    }>
                        <MainInfoPublishDoc info={this.props.info.vanBanDen} />
                    </Tab>


                    <Tab heading={
                        <TabHeading style={(this.state.currentTab == 1 ? TabStyle.activeTab : TabStyle.inActiveTab)}>
                            <NBIcon name='time' style={(this.state.currentTab == 1 ? TabStyle.activeText : TabStyle.inActiveText)} />
                            <NBText style={[TabStyle.tabText,
                            (this.state.currentTab == 1 ? TabStyle.activeText : TabStyle.inActiveText)]}>
                                LỊCH SỬ XỬ LÝ
                                </NBText>
                        </TabHeading>
                    }>
                        <TimelinePublishDoc info={this.props.info.lstLog} />
                    </Tab>

                    <Tab heading={
                        <TabHeading style={(this.state.currentTab == 2 ? TabStyle.activeTab : TabStyle.inActiveTab)}>
                            <NBIcon name='attach' style={(this.state.currentTab == 2 ? TabStyle.activeText : TabStyle.inActiveText)} />
                            <NBText style={[TabStyle.tabText,
                            (this.state.currentTab == 2 ? TabStyle.activeText : TabStyle.inActiveText)]}>
                                TÀI LIỆU ĐÍNH KÈM
                            </NBText>
                        </TabHeading>
                    }>
                        <AttachPublishDoc info={this.props.info.ListTaiLieu} />
                    </Tab>
                </Tabs>
            </View>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        userInfo: state.userState.userInfo
    }
}
export default connect(mapStateToProps)(DetailPublishDoc);