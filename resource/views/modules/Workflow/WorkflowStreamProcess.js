/**
 * @description: màn hình trình xử lý văn bản
 * @author: duynn
 * @since: 16/05/2018
 */
'use strict'
import React, { Component } from 'react';
import { ActivityIndicator, View, Text as RnText, FlatList } from 'react-native';

//utilites
import {
    API_URL, HEADER_COLOR, LOADER_COLOR, LOADMORE_COLOR, EMPTY_STRING,
    DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE, WORKFLOW_PROCESS_TYPE, Colors
} from '../../../common/SystemConstant';
import { asyncDelay, emptyDataPage } from '../../../common/Utilities';
import { verticalScale, indicatorResponsive, moderateScale } from '../../../assets/styles/ScaleIndicator';
import * as util from 'lodash';
import { pushFirebaseNotify } from '../../../firebase/FireBaseClient';

//effect
import { dataLoading, executeLoading } from '../../../common/Effect';

//redux
import { connect } from 'react-redux';
import * as workflowAction from '../../../redux/modules/workflow/WorkflowAction';

//lib
import {
    Container, Header, Left, Button, Content, Title,
    Tabs, Tab, TabHeading, ScrollableTab, Text, Icon,
    Form, Textarea, Body, Item, Input, Right, Toast,
    Label
} from 'native-base';
import renderIf from 'render-if';
import { Icon as RneIcon } from 'react-native-elements';

//styles
import { TabStyle } from '../../../assets/styles/TabStyle';
import { NativeBaseStyle } from '../../../assets/styles/NativeBaseStyle';

//views
import WorkflowStreamMainProcessUsers from './WorkflowStreamMainProcessUsers';
import WorkflowStreamJoinProcessUsers from './WorkflowStreamJoinProcessUsers';

class WorkflowStreamProcess extends Component {

    constructor(props) {
        super(props);
        this.state = {
            userId: props.userInfo.ID,

            docId: this.props.navigation.state.params.docId,
            docType: this.props.navigation.state.params.docType,
            processId: this.props.navigation.state.params.processId,
            stepId: this.props.navigation.state.params.stepId,
            stepName: util.toUpper(this.props.navigation.state.params.stepName),
            isStepBack: this.props.navigation.state.params.isStepBack,
            logId: this.props.navigation.state.params.logId,

            executing: false,
            loadingData: false,
            flowData: {},
            mainProcessUsers: [],
            joinProcessUsers: [],
            message: EMPTY_STRING,

            currentTabIndex: 0,
            mainProcessFilterValue: EMPTY_STRING,
            joinProcessFilterValue: EMPTY_STRING,

            joinProcessPageIndex: DEFAULT_PAGE_INDEX,
            mainProcessPageIndex: DEFAULT_PAGE_INDEX,

            //hiệu ứng
            searchingInMain: false,
            searchingInJoin: false,
            loadingMoreInMain: false,
            loadingMoreInJoin: false,
        }
    }

    componentDidMount() {
        this.fetchData();
    }

    async fetchData() {
        this.setState({
            loadingData: true
        });

        const url = `${API_URL}/api/VanBanDi/GetFlow/${this.state.userId}/${this.state.processId}/${this.state.stepId}/${this.state.isStepBack == true ? 1 : 0}/${this.state.logId}`;
        const result = await fetch(url);
        const resultJson = await result.json();

        ;
        this.setState({
            loadingData: false,
            flowData: resultJson,
            mainProcessUsers: resultJson.dsNgNhanChinh || [],
            joinProcessUsers: resultJson.dsNgThamGia || []
        })
    }

    navigateBackToDetail() {
        this.props.navigation.navigate('DetailSignDocScreen', {
            docId: this.state.docId,
            docType: this.state.docType
        });
    }

    saveFlow = async () => {
        //validate
        if (this.state.mainProcessUsers.length > 0 && this.props.mainProcessUser == 0) {
            Toast.show({
                text: 'Vui lòng chọn người xử lý chính',
                type: 'danger',
                buttonText: "OK",
                buttonStyle: { backgroundColor: Colors.WHITE },
                buttonTextStyle: { color: Colors.RED_PANTONE_186C },
            });
        } else {
            this.setState({
                executing: true
            });

            const url = `${API_URL}/api/VanBanDi/SaveFlow`;
            const headers = new Headers({
                'Accept': 'application/json',
                'Content-Type': 'application/json; charset=utf-8'
            });
            const body = JSON.stringify({
                userId: this.state.userId,
                processID: this.state.processId,
                stepID: this.state.stepId,
                mainUser: this.props.mainProcessUser,
                joinUser: this.props.joinProcessUsers.toString(),
                message: this.state.message,
                IsBack: this.state.isStepBack ? 1 : 0,
                LogID: this.state.logId
            });

            const result = await fetch(url, {
                method: 'POST',
                headers,
                body
            });

            const resultJson = await result.json();

            await asyncDelay(2000);

            this.setState({
                executing: false
            })

            if (!util.isNull(resultJson.GroupTokens) && !util.isEmpty(resultJson.GroupTokens)) {
                const message = this.props.userInfo.Fullname + " đã gửi bạn xử lý văn bản mới";
                const content = {
                    title: 'GỬI XỬ LÝ VĂN BẢN TRÌNH KÝ',
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
                text: this.state.stepName + (resultJson.Status ? ' thành công' : ' không thành công'),
                type: resultJson.Status ? 'success' : 'danger',
                buttonText: "OK",
                buttonStyle: { backgroundColor: Colors.WHITE },
                buttonTextStyle: { color: resultJson.Status ? Colors.GREEN_PANTONE_364C : Colors.RED_PANTONE_186C },
                duration: 3000,
                onClose: () => {
                    this.props.resetProcessUsers(WORKFLOW_PROCESS_TYPE.ALL_PROCESS);
                    if (resultJson.Status) {
                        this.navigateBackToDetail();
                    }
                }
            });
        }
    }

    filterData = async (isMainProcess) => {
        let pageIndex = DEFAULT_PAGE_INDEX;
        let query = EMPTY_STRING;
        if (isMainProcess) {
            query = this.state.mainProcessFilterValue;
            pageIndex = this.state.mainProcessPageIndex;
        } else {
            query = this.state.joinProcessFilterValue;
            pageIndex = this.state.joinProcessPageIndex;
        }
        const url = `${API_URL}/api/VanBanDi/SearchUserInFlow/${this.state.userId}/${this.state.stepId}/${pageIndex}?query=${query}`;

        const result = await fetch(url);
        const resultJson = await result.json();

        if (isMainProcess) {
            this.setState({
                searchingInMain: false,
                loadingMoreInMain: false,
                mainProcessUsers: this.state.searchingInMain ? (resultJson.dsNgNhanChinh || []) : [...this.state.mainProcessUsers, ...(resultJson.dsNgNhanChinh || [])]
            })
        } else {
            this.setState({
                searchingInJoin: false,
                loadingMoreInJoin: false,
                joinProcessUsers: this.state.searchingInJoin ? (resultJson.dsNgThamGia || []) : [...this.state.joinProcessUsers, ...(resultJson.dsNgThamGia || [])]
            })
        }
    }

    onFilter = (isMainProcess) => {
        if (isMainProcess) {
            this.props.resetProcessUsers(WORKFLOW_PROCESS_TYPE.MAIN_PROCESS);
            this.setState({
                searchingInMain: true,
                mainProcessPageIndex: DEFAULT_PAGE_INDEX
            }, () => this.filterData(isMainProcess));
        } else {
            this.props.resetProcessUsers(WORKFLOW_PROCESS_TYPE.JOIN_PROCESS);
            this.setState({
                searchingInJoin: true,
                joinProcessPageIndex: DEFAULT_PAGE_INDEX
            }, () => this.filterData(isMainProcess))
        }
    }

    loadingMore = (isMainProcess) => {
        if (isMainProcess) {
            this.setState({
                loadingMoreInMain: true,
                mainProcessPageIndex: this.state.mainProcessPageIndex + 1
            }, () => this.filterData(isMainProcess));
        } else {
            this.setState({
                loadingMoreInJoin: true,
                joinProcessPageIndex: this.state.joinProcessPageIndex + 1
            }, () => this.filterData(isMainProcess))
        }
    }

    renderMainProcessUsers = ({ item }) => {
        return (
            <WorkflowStreamMainProcessUsers title={item.PhongBan.NAME} users={item.LstNguoiDung} />
        );
    }

    renderJoinProcessUsers = ({ item }) => {
        return (
            <WorkflowStreamJoinProcessUsers title={item.PhongBan.NAME} users={item.LstNguoiDung} />
        );
    }

    render() {
        let bodyContent = null;

        if (!this.state.loadingData) {
            if (this.state.flowData.IsBack == true) {
                bodyContent = (
                    <Tabs
                        initialPage={this.state.currentTabIndex}
                        onChangeTab={({ currentTabIndex }) => this.setState({ currentTabIndex })}
                        tabBarUnderlineStyle={TabStyle.underLineStyle}>
                        <Tab heading={
                            <TabHeading style={(this.state.currentTabIndex == 0) ? TabStyle.activeTab : TabStyle.inActiveTab}>
                                <Icon name='ios-chatbubbles-outline' style={TabStyle.activeText} />
                                <Text style={(this.state.currentTabIndex == 0) ? TabStyle.activeText : TabStyle.inActiveText}>
                                    TIN NHẮN
                                </Text>
                            </TabHeading>
                        }>
                            <Content>
                                <Form>
                                    <Item stackedLabel>
                                        <Label>
                                            <Text>
                                                {'Trả về cho: '}
                                            </Text>
                                            <Text style={{ color: '#000', fontWeight: 'bold', textDecorationLine: 'underline' }}>
                                                {this.state.flowData.Log.TenNguoiXuLy}
                                            </Text>
                                        </Label>
                                    </Item>
                                    <Textarea rowSpan={5} bordered placeholder='Nội dung tin nhắn' onChangeText={(message) => this.setState({ message })} />
                                </Form>
                            </Content>
                        </Tab>
                    </Tabs>
                )
            } else {
                if (this.state.flowData.hasMainProcess && this.state.flowData.hasJoinProcess) {
                    bodyContent = (
                        <Tabs renderTabBar={() => <ScrollableTab />}
                            initialPage={this.state.currentTabIndex}
                            onChangeTab={({ currentTabIndex }) => this.setState({ currentTabIndex })}
                            tabBarUnderlineStyle={TabStyle.underLineStyle}>
                            <Tab heading={
                                <TabHeading style={(this.state.currentTabIndex == 0) ? TabStyle.activeTab : TabStyle.inActiveTab}>
                                    <Icon name='ios-person-outline' style={TabStyle.activeText} />
                                    <Text style={(this.state.currentTabIndex == 0) ? TabStyle.activeText : TabStyle.inActiveText}>
                                        CHÍNH
                                    </Text>
                                </TabHeading>
                            }>
                                <Item>
                                    <Icon name='ios-search' />
                                    <Input placeholder='Họ tên'
                                        value={this.state.mainProcessFilterValue}
                                        onSubmitEditing={() => this.onFilter(true)}
                                        onChangeText={(mainProcessFilterValue) => this.setState({ mainProcessFilterValue })} />
                                </Item>

                                <Content contentContainerStyle={{ flex: 1 }}>
                                    {
                                        renderIf(this.state.searchingInMain)(
                                            <View style={{ flex: 1, justifyContent: 'center' }}>
                                                <ActivityIndicator size={indicatorResponsive} animating color={Colors.BLUE_PANTONE_640C} />
                                            </View>
                                        )
                                    }

                                    {
                                        renderIf(!this.state.searchingInMain)(
                                            <FlatList
                                                keyExtractor={(item, index) => index.toString()}
                                                data={this.state.mainProcessUsers}
                                                renderItem={this.renderMainProcessUsers}
                                                ListEmptyComponent={
                                                    this.state.loadingData ? null : emptyDataPage()
                                                }
                                                ListFooterComponent={
                                                    this.state.loadingMoreInMain ?
                                                        <ActivityIndicator size={indicatorResponsive} animating color={Colors.BLUE_PANTONE_640C} /> :
                                                        (
                                                            this.state.mainProcessUsers.length >= 5 ?
                                                                <Button full style={{ backgroundColor: Colors.BLUE_PANTONE_640C }} onPress={() => this.loadingMore(true)}>
                                                                    <Text>
                                                                        TẢI THÊM
                                                                </Text>
                                                                </Button>
                                                                : null
                                                        )
                                                }
                                            />
                                        )
                                    }
                                </Content>
                            </Tab>

                            <Tab heading={
                                <TabHeading style={(this.state.currentTabIndex == 1) ? TabStyle.activeTab : TabStyle.inActiveTab}>
                                    <Icon name='ios-people-outline' style={TabStyle.activeText} />
                                    <Text style={(this.state.currentTabIndex == 1) ? TabStyle.activeText : TabStyle.inActiveText}>
                                        PHỐI HỢP
                        </Text>
                                </TabHeading>
                            }>
                                <Item>
                                    <Icon name='ios-search' />
                                    <Input placeholder='Họ tên'
                                        value={this.state.joinProcessFilterValue}
                                        onSubmitEditing={() => this.onFilter(false)}
                                        onChangeText={(joinProcessFilterValue) => this.setState({ joinProcessFilterValue })} />
                                </Item>

                                <Content contentContainerStyle={{ flex: 1 }}>
                                    {
                                        renderIf(this.state.searchingInJoin)(
                                            <View style={{ flex: 1, justifyContent: 'center' }}>
                                                <ActivityIndicator size={indicatorResponsive} animating color={Colors.BLUE_PANTONE_640C} />
                                            </View>
                                        )
                                    }
                                    {
                                        renderIf(!this.state.searchingInJoin)(
                                            <FlatList
                                                keyExtractor={(item, index) => index.toString()}
                                                data={this.state.joinProcessUsers}
                                                renderItem={this.renderJoinProcessUsers}
                                                ListEmptyComponent={
                                                    this.state.loadingData ? null : emptyDataPage()
                                                }
                                                ListFooterComponent={
                                                    this.state.loadingMoreInJoin ?
                                                        <ActivityIndicator size={indicatorResponsive} animating color={Colors.BLUE_PANTONE_640C} /> :
                                                        (
                                                            this.state.joinProcessUsers.length >= 5 ?
                                                                <Button full style={{ backgroundColor: Colors.BLUE_PANTONE_640C }} onPress={() => this.loadingMore(false)}>
                                                                    <Text>
                                                                        TẢI THÊM
                                                                </Text>
                                                                </Button>
                                                                : null
                                                        )
                                                }
                                            />
                                        )
                                    }
                                </Content>
                            </Tab>

                            <Tab heading={
                                <TabHeading style={(this.state.currentTabIndex == 2) ? TabStyle.activeTab : TabStyle.inActiveTab}>
                                    <Icon name='ios-chatbubbles-outline' style={TabStyle.activeText} />
                                    <Text style={(this.state.currentTabIndex == 2) ? TabStyle.activeText : TabStyle.inActiveText}>
                                        TIN NHẮN
                        </Text>
                                </TabHeading>
                            }>
                                <Content>
                                    <Form>
                                        <Textarea rowSpan={5} bordered placeholder='Nội dung tin nhắn' onChangeText={(message) => this.setState({ message })} />
                                    </Form>
                                </Content>
                            </Tab>
                        </Tabs>
                    )
                } else if (this.state.flowData.hasMainProcess && this.state.flowData.hasJoinProcess == false) {
                    bodyContent = (
                        <Tabs
                            initialPage={this.state.currentTabIndex}
                            onChangeTab={({ currentTabIndex }) => this.setState({ currentTabIndex })}
                            tabBarUnderlineStyle={TabStyle.underLineStyle}>
                            <Tab heading={
                                <TabHeading style={(this.state.currentTabIndex == 0) ? TabStyle.activeTab : TabStyle.inActiveTab}>
                                    <Icon name='ios-person-outline' style={TabStyle.activeText} />
                                    <Text style={(this.state.currentTabIndex == 0) ? TabStyle.activeText : TabStyle.inActiveText}>
                                        CHÍNH
                                </Text>
                                </TabHeading>
                            }>
                                <Item>
                                    <Icon name='ios-search' />
                                    <Input placeholder='Họ tên'
                                        value={this.state.mainProcessFilterValue}
                                        onSubmitEditing={() => this.onFilter(true)}
                                        onChangeText={(mainProcessFilterValue) => this.setState({ mainProcessFilterValue })} />
                                </Item>

                                <Content contentContainerStyle={{ flex: 1 }}>
                                    {
                                        renderIf(this.state.searchingInMain)(
                                            <View style={{ flex: 1, justifyContent: 'center' }}>
                                                <ActivityIndicator size={indicatorResponsive} animating color={Colors.BLUE_PANTONE_640C} />
                                            </View>
                                        )
                                    }

                                    {
                                        renderIf(!this.state.searchingInMain)(
                                            <FlatList
                                                keyExtractor={(item, index) => index.toString()}
                                                data={this.state.mainProcessUsers}
                                                renderItem={this.renderMainProcessUsers}
                                                ListEmptyComponent={
                                                    this.state.loadingData ? null : emptyDataPage()
                                                }
                                                ListFooterComponent={
                                                    this.state.loadingMoreInMain ?
                                                        <ActivityIndicator size={indicatorResponsive} animating color={Colors.BLUE_PANTONE_640C} /> :
                                                        (
                                                            this.state.mainProcessUsers.length >= 5 ?
                                                                <Button full style={{ backgroundColor: Colors.BLUE_PANTONE_640C }} onPress={() => this.loadingMore(true)}>
                                                                    <Text>
                                                                        TẢI THÊM
                                                        </Text>
                                                                </Button>
                                                                : null
                                                        )
                                                }
                                            />
                                        )
                                    }
                                </Content>
                            </Tab>

                            <Tab heading={
                                <TabHeading style={(this.state.currentTabIndex == 1) ? TabStyle.activeTab : TabStyle.inActiveTab}>
                                    <Icon name='ios-chatbubbles-outline' style={TabStyle.activeText} />
                                    <Text style={(this.state.currentTabIndex == 1) ? TabStyle.activeText : TabStyle.inActiveText}>
                                        TIN NHẮN
                                </Text>
                                </TabHeading>
                            }>
                                <Content>
                                    <Form>
                                        <Textarea rowSpan={5} bordered placeholder='Nội dung tin nhắn' onChangeText={(message) => this.setState({ message })} />
                                    </Form>
                                </Content>
                            </Tab>
                        </Tabs>
                    )
                } else if (this.state.flowData.hasMainProcess == false && this.state.flowData.hasJoinProcess) {
                    bodyContent = (
                        <Tabs
                            initialPage={this.state.currentTabIndex}
                            onChangeTab={({ currentTabIndex }) => this.setState({ currentTabIndex })}
                            tabBarUnderlineStyle={TabStyle.underLineStyle}>

                            <Tab heading={
                                <TabHeading style={(this.state.currentTabIndex == 0) ? TabStyle.activeTab : TabStyle.inActiveTab}>
                                    <Icon name='ios-people-outline' style={TabStyle.activeText} />
                                    <Text style={(this.state.currentTabIndex == 0) ? TabStyle.activeText : TabStyle.inActiveText}>
                                        PHỐI HỢP
                                </Text>
                                </TabHeading>
                            }>
                                <Item>
                                    <Icon name='ios-search' />
                                    <Input placeholder='Họ tên'
                                        value={this.state.joinProcessFilterValue}
                                        onSubmitEditing={() => this.onFilter(false)}
                                        onChangeText={(joinProcessFilterValue) => this.setState({ joinProcessFilterValue })} />
                                </Item>

                                <Content contentContainerStyle={{ flex: 1 }}>
                                    {
                                        renderIf(this.state.searchingInJoin)(
                                            <View style={{ flex: 1, justifyContent: 'center' }}>
                                                <ActivityIndicator size={indicatorResponsive} animating color={Colors.BLUE_PANTONE_640C} />
                                            </View>
                                        )
                                    }
                                    {
                                        renderIf(!this.state.searchingInJoin)(
                                            <FlatList
                                                keyExtractor={(item, index) => index.toString()}
                                                data={this.state.joinProcessUsers}
                                                renderItem={this.renderJoinProcessUsers}
                                                ListEmptyComponent={
                                                    this.state.loadingData ? null : emptyDataPage()
                                                }
                                                ListFooterComponent={
                                                    this.state.loadingMoreInJoin ?
                                                        <ActivityIndicator size={indicatorResponsive} animating color={Colors.BLUE_PANTONE_640C} /> :
                                                        (
                                                            this.state.joinProcessUsers.length >= 5 ?
                                                                <Button full style={{ backgroundColor: Colors.BLUE_PANTONE_640C }} onPress={() => this.loadingMore(false)}>
                                                                    <Text>
                                                                        TẢI THÊM
                                                        </Text>
                                                                </Button>
                                                                : null
                                                        )
                                                }
                                            />
                                        )
                                    }
                                </Content>
                            </Tab>

                            <Tab heading={
                                <TabHeading style={(this.state.currentTabIndex == 2) ? TabStyle.activeTab : TabStyle.inActiveTab}>
                                    <Icon name='ios-chatbubbles-outline' style={TabStyle.activeText} />
                                    <Text style={(this.state.currentTabIndex == 2) ? TabStyle.activeText : TabStyle.inActiveText}>
                                        TIN NHẮN
                                </Text>
                                </TabHeading>
                            }>
                                <Content>
                                    <Form>
                                        <Textarea rowSpan={5} bordered placeholder='Nội dung tin nhắn' onChangeText={(message) => this.setState({ message })} />
                                    </Form>
                                </Content>
                            </Tab>
                        </Tabs>
                    )
                } else {
                    bodyContent = (
                        <Tabs
                            initialPage={this.state.currentTabIndex}
                            onChangeTab={({ currentTabIndex }) => this.setState({ currentTabIndex })}
                            tabBarUnderlineStyle={TabStyle.underLineStyle}>
                            <Tab heading={
                                <TabHeading style={(this.state.currentTabIndex == 0) ? TabStyle.activeTab : TabStyle.inActiveTab}>
                                    <Icon name='ios-chatbubbles-outline' style={TabStyle.activeText} />
                                    <Text style={(this.state.currentTabIndex == 0) ? TabStyle.activeText : TabStyle.inActiveText}>
                                        TIN NHẮN
                                </Text>
                                </TabHeading>
                            }>
                                <Content>
                                    <Form>
                                        <Textarea rowSpan={5} bordered placeholder='Nội dung tin nhắn' onChangeText={(message) => this.setState({ message })} />
                                    </Form>
                                </Content>
                            </Tab>
                        </Tabs>
                    )
                }
            }
        }

        return (
            <Container>
                <Header hasTabs style={{ backgroundColor: Colors.RED_PANTONE_186C }}>
                    <Left style={NativeBaseStyle.left}>
                        <Button transparent onPress={() => this.navigateBackToDetail()}>
                            <RneIcon name='ios-arrow-round-back' size={moderateScale(40)} color={Colors.WHITE} type='ionicon' />
                        </Button>
                    </Left>

                    <Body style={NativeBaseStyle.body}>
                        <Title style={NativeBaseStyle.bodyTitle}>
                            {this.state.stepName}
                        </Title>
                    </Body>

                    <Right style={NativeBaseStyle.right}>
                        <Button transparent onPress={() => this.saveFlow()}>
                            <RneIcon name='md-send' size={verticalScale(30)} color={Colors.WHITE} type='ionicon' />
                        </Button>
                    </Right>
                </Header>
                {
                    renderIf(this.state.loadingData)(
                        dataLoading(true)
                    )
                }

                {
                    renderIf(!this.state.loadingData)(
                        bodyContent
                    )
                }

                {
                    executeLoading(this.state.executing)
                }
            </Container>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        userInfo: state.userState.userInfo,
        mainProcessUser: state.workflowState.mainProcessUser,
        joinProcessUsers: state.workflowState.joinProcessUsers
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        resetProcessUsers: (workflowProcessType) => dispatch(workflowAction.resetProcessUsers(workflowProcessType))
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(WorkflowStreamProcess);
