/**
 * @description: chi tiết văn bản trình ký
 * @author: duynn
 * @since: 03/05/2018
 */
'use strict'
import React, { Component } from 'react';
import { View, Text as RnText } from 'react-native';
//redux
import { connect } from 'react-redux';

//utilities
import { API_URL, VANBAN_CONSTANT, HEADER_COLOR, Colors } from '../../../common/SystemConstant';
import { asyncDelay, unAuthorizePage } from '../../../common/Utilities';
import { dataLoading } from '../../../common/Effect';
import * as util from 'lodash';
import { verticalScale, indicatorResponsive, moderateScale } from '../../../assets/styles/ScaleIndicator';

//styles
import { TabStyle } from '../../../assets/styles/TabStyle';
import { MenuStyle, MenuOptionStyle } from '../../../assets/styles/MenuPopUpStyle';

//lib
import {
    Container, Header, Left, Button,
    Body, Icon, Title, Content,
    Tabs, Tab, TabHeading, ScrollableTab,
    Text, Right
} from 'native-base';
import { MenuProvider, Menu, MenuTrigger, MenuOptions, MenuOption } from 'react-native-popup-menu'
import {
    Icon as RneIcon
} from 'react-native-elements';

//views
import MainInfoSignDoc from './MainInfoSignDoc';
import TimelineSignDoc from './TimelineSignDoc';
import AttachSignDoc from './AttachSignDoc';
import UnitSignDoc from './UnitSignDoc';

class DetailSignDoc extends Component {
    constructor(props) {
        super(props);
        this.state = {
            userId: this.props.userInfo.ID,
            loading: false,
            isUnAuthorize: false,
            docInfo: {},
            docId: this.props.navigation.state.params.docId,
            docType: this.props.navigation.state.params.docType
        }
    }

    componentWillMount() {
        this.fetchData()
    }

    async fetchData() {
        this.setState({
            loading: true
        });

        const url = `${API_URL}/api/VanBanDi/GetDetail/${this.state.docId}/${this.state.userId}`;

        const result = await fetch(url);
        const resultJson = await result.json();

        await asyncDelay(2000);

        this.setState({
            loading: false,
            docInfo: resultJson,
            isUnAuthorize: util.isNull(resultJson)
        });
    }

    navigateBackToList() {
        let screenName = 'ListIsNotProcessedScreen';
        if (this.state.docType == VANBAN_CONSTANT.DA_XULY) {
            screenName = 'ListIsProcessedScreen'
        } else if (this.state.docType == VANBAN_CONSTANT.CAN_REVIEW) {
            screenName = 'ListIsNotReviewedScreen'
        } else if (this.state.docType == VANBAN_CONSTANT.DA_REVIEW) {
            screenName = 'ListIsReviewedScreen'
        }
        this.props.navigation.navigate(screenName);
    }

    onReplyReview() {
        this.props.navigation.navigate('WorkflowReplyReviewScreen', {
            docId: this.state.docInfo.VanBanDi.ID,
            docType: this.state.docType,
            itemType: this.state.docInfo.Process.ITEM_TYPE
        });
    }

    onSelectWorkFlowStep(item) {
        if (!item.REQUIRED_REVIEW || this.state.docInfo.Process.IS_PENDING == false) {
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

    render() {
        let bodyContent = null;
        let workflowMenu = null;

        if (this.state.loading) {
            bodyContent = dataLoading(true);
        }
        else if (this.state.isUnAuthorize) {
            bodyContent = unAuthorizePage(this.props.navigation);
        } else {
            bodyContent = <SignDocContent docInfo={this.state.docInfo} />

            if (this.state.docInfo.VanBanDi.REQUIRED_REVIEW) {
                workflowMenu = (
                    <Menu>
                        <MenuTrigger>
                            <RneIcon name='dots-three-horizontal' color={'#fff'} type='entypo' size={verticalScale(25)} />
                        </MenuTrigger>

                        <MenuOptions>
                            <MenuOption onSelect={() => this.onReplyReview()}>
                                <RnText style={MenuOptionStyle.text}>
                                    PHẢN HỒI
                                </RnText>
                            </MenuOption>
                        </MenuOptions>
                    </Menu>
                )
            } else {
                if (!util.isNull(this.state.docInfo.VanBanDi.LstStep) && !util.isEmpty(this.state.docInfo.VanBanDi.LstStep)) {
                    workflowMenu = (
                        <Menu>
                            <MenuTrigger>
                                <RneIcon name='dots-three-horizontal' color={Colors.WHITE} type='entypo' size={verticalScale(25)} />
                            </MenuTrigger>

                            <MenuOptions>
                                {
                                    this.state.docInfo.VanBanDi.LstStep.map((item, index) => (
                                        <MenuOption key={index} onSelect={() => this.onSelectWorkFlowStep(item)}>
                                            <RnText style={MenuOptionStyle.text}>
                                                {util.toUpper(item.NAME)}
                                            </RnText>
                                        </MenuOption>
                                    ))
                                }
                            </MenuOptions>
                        </Menu>
                    )
                } else {
                    workflowMenu = null;
                }
            }
        }

        return (
            <MenuProvider>
                <Container>
                    <Header hasTabs style={{ backgroundColor: Colors.RED_PANTONE_186C }}>
                        <Left style={{flex: 1}}>
                            <Button transparent onPress={() => this.navigateBackToList()}>
                                <RneIcon name='ios-arrow-round-back' size={moderateScale(40)} color={Colors.WHITE} type='ionicon' />
                            </Button>
                        </Left>

                        <Body style={{flex:3}}>
                            <Title style={{color:'#fff', fontWeight:'bold'}} >
                                THÔNG TIN VĂN BẢN
                            </Title>
                        </Body>

                        <Right style={{flex:1}}>
                            {
                                workflowMenu
                            }
                        </Right>
                    </Header>
                    {
                        bodyContent
                    }
                </Container>
            </MenuProvider>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        userInfo: state.userState.userInfo
    }
}
export default connect(mapStateToProps)(DetailSignDoc);

//THÔNG TIN VĂN BẢN
class SignDocContent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentTabIndex: 0,
            docInfo: props.docInfo
        }
    }

    render() {
        return (
            <View style={{ flex: 1 }}>
                <Tabs
                    renderTabBar={() => <ScrollableTab />}
                    initialPage={this.state.currentTabIndex}
                    tabBarUnderlineStyle={TabStyle.underLineStyle}
                    onChangeTab={({ index }) => this.setState({ currentTabIndex: index })}>
                    <Tab heading={
                        <TabHeading style={(this.state.currentTabIndex == 0 ? TabStyle.activeTab : TabStyle.inActiveTab)}>
                            <Icon name='ios-information-circle-outline' style={TabStyle.activeText} />
                            <Text style={(this.state.currentTabIndex == 0 ? TabStyle.activeText : TabStyle.inActiveText)}>
                                THÔNG TIN
                                </Text>
                        </TabHeading>
                    }>
                        <MainInfoSignDoc info={this.state.docInfo.VanBanDi} />
                    </Tab>

                    <Tab heading={
                        <TabHeading style={(this.state.currentTabIndex == 1 ? TabStyle.activeTab : TabStyle.inActiveTab)}>
                            <Icon name='ios-attach-outline' style={TabStyle.activeText} />
                            <Text style={(this.state.currentTabIndex == 1 ? TabStyle.activeText : TabStyle.inActiveText)}>
                                ĐÍNH KÈM
                            </Text>
                        </TabHeading>
                    }>
                        <AttachSignDoc info={this.state.docInfo} />
                    </Tab>

                    <Tab heading={
                        <TabHeading style={(this.state.currentTabIndex == 2 ? TabStyle.activeTab : TabStyle.inActiveTab)}>
                            <Icon name='ios-git-network' style={TabStyle.activeText} />
                            <Text style={(this.state.currentTabIndex == 2 ? TabStyle.activeText : TabStyle.inActiveText)}>
                                ĐƠN VỊ NHẬN
                                </Text>
                        </TabHeading>
                    }>
                        <UnitSignDoc info={this.state.docInfo} />
                    </Tab>

                    <Tab heading={
                        <TabHeading style={(this.state.currentTabIndex == 3 ? TabStyle.activeTab : TabStyle.inActiveTab)}>
                            <Icon name='ios-time-outline' style={TabStyle.activeText} />
                            <Text style={(this.state.currentTabIndex == 3 ? TabStyle.activeText : TabStyle.inActiveText)}>
                                LỊCH SỬ XỬ LÝ
                                </Text>
                        </TabHeading>
                    }>
                        <TimelineSignDoc info={this.state.docInfo} />
                    </Tab>
                </Tabs>
            </View>
        );
    }
}