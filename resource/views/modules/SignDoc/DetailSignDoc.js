/**
 * @description: chi tiết văn bản trình ký
 * @author: duynn
 * @since: 03/05/2018
 */
'use strict'
import React, { Component } from 'react';
import {
    ActivityIndicator, View, Text, Modal,
    FlatList, TouchableOpacity, Image
} from 'react-native';

//constant
import {
    API_URL, HEADER_COLOR
} from '../../../common/SystemConstant';

//native-base
import {
    Button, Icon as NBIcon, Text as NBText, Item, Input, Title,
    Container, Header, Content, Left, Right, Body,
    Tab, Tabs, TabHeading, ScrollableTab
} from 'native-base';

//react-native-elements
import { ListItem, Icon } from 'react-native-elements';
//styles
import { DetailSignDocStyle } from '../../../assets/styles/SignDocStyle';
import { MenuStyle, MenuOptionStyle } from '../../../assets/styles/MenuPopUpStyle';
import { TabStyle } from '../../../assets/styles/TabStyle';

import { dataLoading } from '../../../common/Effect';
import { asyncDelay, unAuthorizePage, openSideBar } from '../../../common/Utilities';
//lib
import { connect } from 'react-redux';
import renderIf from 'render-if';
import * as util from 'lodash';
import { MenuProvider, Menu, MenuTrigger, MenuOptions, MenuOption } from 'react-native-popup-menu';


//views
import MainInfoSignDoc from './MainInfoSignDoc';
import TimelineSignDoc from './TimelineSignDoc';
import AttachSignDoc from './AttachSignDoc';

class DetailSignDoc extends Component {

    constructor(props) {
        super(props);
        this.state = {
            userId: this.props.userInfo.ID,
            isUnAuthorize: false,
            loading: false,
            docInfo: {},
            docType: this.props.navigation.state.params.docType
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
        const url = `${API_URL}/api/VanBanDi/GetDetail/${docId}/${this.state.userId}`;
        
        // console.log('123', url);

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
    
    onSelectWorkFlowStep(item){
        if(!item.REQUIRED_REVIEW || this.state.docInfo.Process.IS_PENDING == false){
             this.props.navigation.navigate('WorkflowStreamProcessScreen', {
                docId: this.state.docInfo.VanBanDi.ID,
                docType: this.state.docType,
                processId: this.state.docInfo.Process.ID,
                stepId: item.ID,
                isStepBack: item.IS_RETURN,
                stepName: item.NAME
            });
        } else {
            this.props.navigation.navigate('WorkflowRequestReviewScreen', {
                docId: this.state.docInfo.VanBanDi.ID,
                docType: this.state.docType,
                processId: this.state.docInfo.Process.ID,
                stepId: item.ID,
                isStepBack: item.IS_RETURN,
                stepName: item.NAME
            })
        }
    }

    onReplyReview(){
        this.props.navigation.navigate('WorkflowReplyReviewScreen', {
            docId: this.state.docInfo.VanBanDi.ID,
            docType: this.state.docType,
            itemType: this.state.docInfo.Process.ITEM_TYPE
        });
    }

    navigateBack(){
        let screenName = 'ListIsNotProcessedScreen';

        if(this.state.docType == 2){
            screenName = 'ListIsProcessedScreen'
        }else if(this.state.docType == 3){
            screenName = 'ListIsNotReviewedScreen'
        }else if(this.state.docType == 4){
            screenName = 'ListIsReviewedScreen'
        }

        this.props.navigation.navigate(screenName);
    }

    render() {
        let content = null;
        let menuSteps = null;
        if (this.state.isUnAuthorize) {
            content = unAuthorizePage(this.props.navigation);
        } else if (this.state.loading) {
            content = dataLoading(true);
        } else {
            content = <SignDocContent info={this.state.docInfo} />
            
            if(this.state.docInfo.VanBanDi.REQUIRED_REVIEW){
                menuSteps = (
                        <Menu>
                            <MenuTrigger>
                                <Icon name='dots-three-horizontal' size={30} color={'#fff'} type="entypo" />
                            </MenuTrigger>
                            <MenuOptions>
                                <MenuOption style={MenuOptionStyle.wrapper} onSelect={()=> this.onReplyReview()}>
                                    <Text style={MenuOptionStyle.text}>
                                        PHẢN HỒI
                                    </Text>
                                </MenuOption>
                            </MenuOptions>
                        </Menu>
                    )
            } else {
                menuSteps = (!util.isNull(this.state.docInfo.VanBanDi.LstStep) && !util.isEmpty(this.state.docInfo.VanBanDi.LstStep)) > 0 ? (
                    <Menu>
                        <MenuTrigger>
                            <Icon name='dots-three-horizontal' size={30} color={'#fff'} type="entypo" />
                        </MenuTrigger>
                        <MenuOptions>
                            {
                                this.state.docInfo.VanBanDi.LstStep.map((item, index) => (
                                        <MenuOption key={index} onSelect={()=> this.onSelectWorkFlowStep(item)}
                                            style={[MenuOptionStyle.wrapper,
                                            (index !== this.state.docInfo.VanBanDi.LstStep.length - 1 ? MenuOptionStyle.wrapperBorder : null)]}>
                                            <Text style={MenuOptionStyle.text}>
                                                {util.toUpper(item.NAME)}
                                            </Text>
                                        </MenuOption>
                                ))
                            }
                        </MenuOptions>
                    </Menu>
                ) : null;
            }
        }
        return (
            <MenuProvider>
                <Container>
                    <Header style={{ backgroundColor: HEADER_COLOR }} hasTabs>
                        <Left>
                            <Button transparent onPress={() => this.navigateBack()}>
                                <Icon name='ios-arrow-dropleft-circle' size={30} color={'#fff'} type="ionicon" />
                            </Button>
                        </Left>

                        <Body>
                            <Title>
                                THÔNG TIN VĂN BẢN
                            </Title>
                        </Body>
                        <Right>
                            {
                                menuSteps
                            }
                        </Right>
                    </Header>
                    {
                        content
                    }
                </Container>
            </MenuProvider>
        );
    }
}


class SignDocContent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            docInfo: props.info,
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
                        <MainInfoSignDoc info={this.state.docInfo.VanBanDi} />
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
                        <TimelineSignDoc info={this.state.docInfo.lstLog} />
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
                        <AttachSignDoc info={this.state.docInfo.ListTaiLieu} />
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
export default connect(mapStateToProps)(DetailSignDoc);