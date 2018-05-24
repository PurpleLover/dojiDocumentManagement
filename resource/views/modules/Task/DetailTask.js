/**
 * @description: chi tiết công việc
 * @author: duynn
 * @since: 10/05/2018
 */
'use strict'
import React, { Component } from 'react';
import {
    ActivityIndicator, View, Text, Modal, Alert,
    FlatList, TouchableOpacity, Image,
    StyleSheet, Animated, ScrollView
} from 'react-native';

//constant
import {
    API_URL, HEADER_COLOR, PLANJOB_CONSTANT
} from '../../../common/SystemConstant';

//native-base
import {
    Button, Icon as NBIcon, Text as NBText, Item, Input, Title, Toast,
    Container, Header, Content, Left, Right, Body,
    Tab, Tabs, TabHeading, ScrollableTab
} from 'native-base';

//react-native-elements
import { ListItem, Icon } from 'react-native-elements';
//styles
import { DetailSignDocStyle } from '../../../assets/styles/SignDocStyle';
import { MenuStyle, MenuOptionStyle } from '../../../assets/styles/MenuPopUpStyle';
import { TabStyle } from '../../../assets/styles/TabStyle';

import { dataLoading,executeLoading } from '../../../common/Effect';
import { asyncDelay, unAuthorizePage, openSideBar, convertDateToString } from '../../../common/Utilities';
//lib
import { connect } from 'react-redux';
import renderIf from 'render-if';
import * as util from 'lodash';
import { MenuProvider, Menu, MenuTrigger, MenuOptions, MenuOption } from 'react-native-popup-menu';

//components
import TaskDescription from './TaskDescription';
import TaskAttachment from './TaskAttachment';

class DetailTask extends Component {
    constructor(props){
        super(props);
        this.state = {
            loading: true,
            taskId: this.props.navigation.state.params.taskId,
            userId: this.props.userInfo.ID,
            taskType: this.props.navigation.state.params.taskType,
            taskInfo: {},
            executing: false
        }
    }

    async componentWillMount (){
        this.fetchData();
    }
    
    async fetchData (){
        this.setState({
            loading: true
        });

        const url = `${API_URL}/api/HscvCongViec/JobDetail/${this.state.taskId}/${this.state.userId}`;

        const taskInfo = await fetch(url)
            .then(response => response.json())
            .then(responseJson => {
                return responseJson;
            }).catch(err => {
                console.log('Xảy ra lỗi', err);
            });

        this.setState({
            loading: false,
            taskInfo
        });
    }

    //xác nhận bắt đầu xử lý công việc
    onConfirmBeginTask(){
        Alert.alert(
          'XÁC NHẬN BẮT ĐẦU XỬ LÝ',
          'Bạn có chắc chắn muốn bắt đầu thực hiện công việc này?',
          [
            {text: 'Đồng ý', onPress: () => this.beginTask()},
            {text: 'Hủy bỏ', onPress: () => console.log('OK Pressed')},
          ]);
    }
    
    //xử lý công việc
    async beginTask(){
        //hiển thị modal
        this.setState({
            executing: true
        })
        
        //xử lý api
        const result = await fetch(API_URL + `/api/HscvCongViec/BeginProcess`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json; charset=utf-8',
            }, body: JSON.stringify({
                userId: this.state.userId,
                taskId: this.state.taskId
            })
        });
        const resultJson = await result.json();
        
        await asyncDelay(2000);

        //ẩn modal
        this.setState({
            executing: false
        });

        Toast.show({
            text: resultJson.Status ? 'Bắt đầu công việc thành công' : 'Bắt đầu công việc không thành công',
            type: resultJson.Status ? 'success' : 'danger',
            buttonText: "OK",
            buttonStyle: { backgroundColor: '#fff' },
            buttonTextStyle: { color: resultJson.Status ? '#337321' :'#FF0033'},
            duration: 5000,
            onClose: ()=> {
                if(resultJson.Status){
                    this.fetchData();
                }
            }
        });
    }

    navigateBack(){
        let screenName = 'ListPersonalTaskScreen';

        if(this.state.taskType == 2){
            screenName = 'ListAssignedTaskScreen'
        }else if(this.state.taskType == 3){
            screenName = 'ListCombinationTaskScreen'
        }else if(this.state.taskType == 4){
            screenName = 'ListProcessedTaskScreen'
        }

        this.props.navigation.navigate(screenName);
    }

    render(){
        const content = this.state.loading ? dataLoading(true) : <TaskContent userInfo={this.props.userInfo} info={this.state.taskInfo} navigator={this.props.navigation}/>;
        
        const menuActions = [];

        if(!this.state.loading){
            const task = this.state.taskInfo;

            //kiểm tra điều kiện để hiển thị các menu
            if(task.CongViec.IS_BATDAU == true){
                if (((task.CongViec.DAGIAOVIEC != true && task.IsNguoiGiaoViec == true && task.CongViec.IS_SUBTASK != true) || task.IsNguoiThucHienChinh) && (task.CongViec.PHANTRAMHOANTHANH < 100)){
                    menuActions.push(
                            <MenuOption key={-1} onSelect={()=> {
                                this.props.navigation.navigate('UpdateProgressTaskScreen', {
                                    taskId: this.state.taskId,
                                    taskType: this.state.taskType,
                                    progressValue: this.state.taskInfo.CongViec.PHANTRAMHOANTHANH || 0
                                })    
                            }}
                                style={[MenuOptionStyle.wrapper,MenuOptionStyle.wrapperBorder]}>
                                <Text style={MenuOptionStyle.text}>
                                   CẬP NHẬT TIẾN ĐỘ
                                </Text>
                            </MenuOption>
                    )

                    if(task.CongViec.NGUOIXULYCHINH_ID != task.CongViec.NGUOIGIAOVIEC_ID){
                        menuActions.push(
                            <MenuOption key={-111} onSelect={()=> {
                                this.props.navigation.navigate('RescheduleTaskScreen', {
                                    taskId: this.state.taskId,
                                    taskType: this.state.taskType
                                })    
                            }}
                                style={[MenuOptionStyle.wrapper,MenuOptionStyle.wrapperBorder]}>
                                <Text style={MenuOptionStyle.text}>
                                   XIN LÙI HẠN CÔNG VIỆC
                                </Text>
                            </MenuOption>
                        )
                    }
                }

                if (task.IsNguoiGiaoViec && task.CongViec.PHANTRAMHOANTHANH == 100 && task.CongViec.NGUOIGIAOVIECDAPHANHOI == null){
                    menuActions.push(
                            <MenuOption key={-1} onSelect={()=> {
                                this.props.navigation.navigate('ApproveProgressTaskScreen', {
                                    taskId: this.state.taskId,
                                    taskType: this.state.taskType
                                })    
                            }}
                                style={[MenuOptionStyle.wrapper,MenuOptionStyle.wrapperBorder]}>
                                <Text style={MenuOptionStyle.text}>
                                   PHẢN HỒI CÔNG VIỆC
                                </Text>
                            </MenuOption>
                    )
                }

                if(((task.CongViec.DAGIAOVIEC != true && task.IsNguoiGiaoViec && task.CongViec.IS_SUBTASK != true) || task.IsNguoiThucHienChinh) 
                    && (task.CongViec.PHANTRAMHOANTHANH == null || task.CongViec.PHANTRAMHOANTHANH < 100)){
                    menuActions.push(
                        <MenuOption key={0} onSelect={()=> this.props.navigation.navigate('CreateSubTaskScreen',{
                            taskId: this.state.taskId,
                            taskType: this.state.taskType,
                        })}
                                style={[MenuOptionStyle.wrapper,MenuOptionStyle.wrapperBorder]}>
                            <Text style={MenuOptionStyle.text}>
                                TẠO CÔNG VIỆC CON
                            </Text>
                        </MenuOption>
                    )
                }

                if (task.HasRoleAssignTask && (task.CongViec.PHANTRAMHOANTHANH == 0 || task.CongViec.PHANTRAMHOANTHANH == null) && task.CongViec.DAGIAOVIEC != true){
                    menuActions.push(
                        <MenuOption onSelect={()=> this.props.navigation.navigate('AssignTaskScreen', {
                                taskId: this.state.taskId,
                                taskType: this.state.taskType,
                                subTaskId: this.state.taskInfo.CongViec.SUBTASK_ID || 0
                            })} 
                            key={1}
                            style={[MenuOptionStyle.wrapper,MenuOptionStyle.wrapperBorder]}>
                            <Text style={MenuOptionStyle.text}>
                               GIAO VIỆC
                            </Text>
                        </MenuOption>
                    )
                }

                if (task.HasRoleAssignTask){
                    if (task.CongViec.NGUOIXULYCHINH_ID != task.CongViec.NGUOIGIAOVIEC_ID){
                        menuActions.push(
                            <MenuOption key={2}
                                style={[MenuOptionStyle.wrapper,MenuOptionStyle.wrapperBorder]}>
                                <Text style={MenuOptionStyle.text}>
                                   THEO DÕI
                                </Text>
                            </MenuOption>
                        )
                    }
                }

                if(task.CongViec.NGUOIGIAOVIECDAPHANHOI == true){
                    if (task.IsNguoiGiaoViec == true && task.CongViec.PHANTRAMHOANTHANH == 100 && task.CongViec.DATUDANHGIA == true && task.CongViec.NGUOIGIAOVIECDANHGIA != true){
                        menuActions.push(
                            <MenuOption onSelect={()=> this.props.navigation.navigate('ApproveEvaluationTaskScreen', {
                                taskId: this.state.taskId,
                                taskType: this.state.taskType,
                                PhieuDanhGia: this.state.taskInfo.PhieuDanhGia || {}
                            })}
                                key={3}
                                style={[MenuOptionStyle.wrapper,MenuOptionStyle.wrapperBorder]}>
                                <Text style={MenuOptionStyle.text}>
                                   DUYỆT ĐÁNH GIÁ CÔNG VIỆC
                                </Text>
                            </MenuOption>
                        )
                    }

                    if(task.IsNguoiThucHienChinh && task.CongViec.PHANTRAMHOANTHANH == 100 && task.CongViec.DATUDANHGIA != true){
                        menuActions.push(
                            <MenuOption onSelect={()=> this.props.navigation.navigate('EvaluationTaskScreen', {
                                    taskId: this.state.taskId,
                                    taskType: this.state.taskType,
                                })}
                                key={4}
                                style={[MenuOptionStyle.wrapper,MenuOptionStyle.wrapperBorder]}>
                                <Text style={MenuOptionStyle.text}>
                                    ĐÁNH GIÁ CÔNG VIỆC
                                </Text>
                            </MenuOption>
                        )
                    }
                }
            } else {
                // Nếu công việc chưa bắt đầu
                if (task.CongViec.NGUOIXULYCHINH_ID == null)
                {
                    // Truong hop chua co nguoi xu ly la cong viec chua duoc giao
                    // Chưa được giao thì ko cần lập kế hoạch, tránh vừa đánh trống vừa thôi kèn
                    // Chỉ yêu cầu lập kế hoạch khi mà người xử lý chính và người giao việc khác nhau
                    if (task.HasRoleAssignTask && (task.CongViec.PHANTRAMHOANTHANH == 0 || task.CongViec.PHANTRAMHOANTHANH == null) && task.CongViec.DAGIAOVIEC != true){
                        menuActions.push(
                            <MenuOption onSelect={()=> this.props.navigation.navigate('AssignTaskScreen', {
                                taskId: this.state.taskId,
                                taskType: this.state.taskType,
                                subTaskId: this.state.taskInfo.CongViec.SUBTASK_ID || 0
                            })} 
                                key={5}
                                style={[MenuOptionStyle.wrapper,MenuOptionStyle.wrapperBorder]}>
                                <Text style={MenuOptionStyle.text}>
                                    GIAO VIỆC
                                </Text>
                            </MenuOption>
                        )

                        menuActions.push(
                            <MenuOption key={6} onSelect={()=> this.onConfirmBeginTask()}
                                style={[MenuOptionStyle.wrapper,MenuOptionStyle.wrapperBorder]}>
                                <Text style={MenuOptionStyle.text}>
                                    BẮT ĐẦU XỬ LÝ
                                </Text>
                            </MenuOption>
                        )
                    }
                }
                else if (task.IsNguoiGiaoViec){
                    menuActions.push(
                        <MenuOption key={7} style={[MenuOptionStyle.wrapper,MenuOptionStyle.wrapperBorder]}>
                            <Text style={MenuOptionStyle.text}>
                                THEO DÕI
                            </Text>
                        </MenuOption>
                    )
                    if (task.CongViec.IS_HASPLAN == true && task.TrangThaiKeHoach == PLANJOB_CONSTANT.DATRINHKEHOACH){
                        {/*menuActions.push(
                            <MenuOption key={8} style={[MenuOptionStyle.wrapper,MenuOptionStyle.wrapperBorder]}>
                                <Text style={MenuOptionStyle.text}>
                                    DUYỆT KẾ HOẠCH
                                </Text>
                            </MenuOption>
                        )*/}
                    }
                }else {
                        if (task.CongViec.IS_HASPLAN == true){
                            // Nếu công việc yêu cầu lập kế hoạch trước khi bắt đầu thực hiện
                            if (task.TrangThaiKeHoach == PLANJOB_CONSTANT.CHUATRINHKEHOACH){
                                // nếu chưa trình kế hoạch và là người xử lý chính thì
                                if (task.IsNguoiThucHienChinh){
                                    {/*menuActions.push(
                                        <MenuOption key={9} style={[MenuOptionStyle.wrapper,MenuOptionStyle.wrapperBorder]}>
                                            <Text style={MenuOptionStyle.text}>
                                                TRÌNH KẾ HOẠCH
                                            </Text>
                                        </MenuOption>
                                    )*/}
                                }
                            }
                            else if (task.TrangThaiKeHoach == PLANJOB_CONSTANT.CHUALAPKEHOACH || task.TrangThaiKeHoach == PLANJOB_CONSTANT.LAPLAIKEHOACH){
                                {/*menuActions.push(
                                    <MenuOption key={10} style={[MenuOptionStyle.wrapper,MenuOptionStyle.wrapperBorder]}>
                                        <Text style={MenuOptionStyle.text}>
                                            LẬP KẾ HOẠCH
                                        </Text>
                                    </MenuOption>
                                )*/}
                            }
                            else if (task.TrangThaiKeHoach == PLANJOB_CONSTANT.DAPHEDUYETKEHOACH){
                                if (task.IsNguoiThucHienChinh){
                                    menuActions.push(
                                        <MenuOption key={11} 
                                            onSelect={()=> this.onConfirmBeginTask()}
                                            style={[MenuOptionStyle.wrapper,MenuOptionStyle.wrapperBorder]}>
                                            <Text style={MenuOptionStyle.text}>
                                                BẮT ĐẦU XỬ LÝ
                                            </Text>
                                        </MenuOption>
                                    )
                                }
                            }
                        } else{
                            //Bắt đầu xử lý
                            menuActions.push(
                                <MenuOption key={12}
                                    onSelect={()=> this.onConfirmBeginTask()}
                                    style={[MenuOptionStyle.wrapper,MenuOptionStyle.wrapperBorder]}>
                                    <Text style={MenuOptionStyle.text}>
                                        BẮT ĐẦU XỬ LÝ
                                    </Text>
                                </MenuOption>
                            )
                        }
                    }
            }
        }

        //các menu để xem thông tin công việc
        const menuInfos = (
            <Menu style={{marginHorizontal: 5}}>
                <MenuTrigger>
                    <Icon name='ios-list-box-outline' size={30} color={'#fff'} type="ionicon" />
                </MenuTrigger>

                <MenuOptions>
                    <MenuOption 
                        onSelect={()=> this.props.navigation.navigate('HistoryProgressTaskScreen', {
                            taskId: this.state.taskId,
                            taskType: this.state.taskType,
                        })}
                        style={[MenuOptionStyle.wrapper,MenuOptionStyle.wrapperBorder]}>
                            <Text style={MenuOptionStyle.text}>
                                THEO DÕI TIẾN ĐỘ
                            </Text>
                    </MenuOption>

                    <MenuOption 
                        onSelect={()=> this.props.navigation.navigate('HistoryRescheduleTaskScreen', {
                            taskId: this.state.taskId,
                            taskType: this.state.taskType,
                        })}
                        style={[MenuOptionStyle.wrapper,MenuOptionStyle.wrapperBorder]}>
                            <Text style={MenuOptionStyle.text}>
                                LỊCH SỬ LÙI HẠN
                            </Text>
                        </MenuOption>

                        <MenuOption 
                            onSelect={()=> this.props.navigation.navigate('HistoryEvaluateTaskScreen', {
                                taskId: this.state.taskId,
                                taskType: this.state.taskType,
                            })}
                            style={[MenuOptionStyle.wrapper]}>
                            <Text style={MenuOptionStyle.text}>
                                THÔNG TIN PHẢN HỒI
                            </Text>
                        </MenuOption>
                </MenuOptions>
            </Menu>
        )

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
                                CÔNG VIỆC
                            {/*<Text style={{fontWeight:'bold', color: '#337321', fontSize: 11}}>(100%)</Text>*/}
                            </Title>
                        </Body>
                        <Right>
                            {
                                renderIf(menuActions.length > 0)(
                                    <Menu style={{marginHorizontal: 5}}>
                                        <MenuTrigger>
                                            <Icon name='ios-construct' size={30} color={'#fff'} type="ionicon" />
                                        </MenuTrigger>

                                        <MenuOptions>
                                            {
                                                menuActions
                                            }
                                        </MenuOptions>
                                    </Menu>
                                )
                            }

                            {
                                menuInfos
                            }
                        </Right>

                        {
                            /* menu công việc*/
                        }
                    </Header>
                {
                    content
                }

                {
                    executeLoading(this.state.executing)
                }
                </Container>
            </MenuProvider>
        );
    }
}

class TaskContent extends Component {
    constructor(props){
        super(props);
        this.state = {
            userInfo: props.userInfo,
            selectedTabIndex: 0,
            info: props.info,
            LstTask: props.info.LstTask || [],
            LstCompletedTask: props.info.LstCompletedTask || []
        }
    }


    render(){
        // renderTabBar={()=> <ScrollableTab />}
        return(
            <View style={{flex: 1}}>
                <Tabs 
                    initialPage={this.state.selectedTabIndex}
                    onChangeTab={({selectedTabIndex}) => this.setState({
                        selectedTabIndex
                    })}
                    tabBarUnderlineStyle={{
                        borderBottomWidth:4,
                        borderBottomColor: '#FF6600'
                    }}>
                    <Tab heading={
                        <TabHeading style={(this.state.selectedTabIndex == 0 ? TabStyle.activeTab : TabStyle.inActiveTab)}>
                            <NBIcon name='information-circle' style={(this.state.selectedTabIndex == 0 ? TabStyle.activeText : TabStyle.inActiveText)} />
                            <NBText style={[TabStyle.tabText,
                            (this.state.selectedTabIndex == 0 ? TabStyle.activeText : TabStyle.inActiveText)]}>
                                MÔ TẢ
                            </NBText>
                        </TabHeading>
                    }>
                        <TaskDescription info={this.props.info}/>
                    </Tab>


                    <Tab heading={
                        <TabHeading style={(this.state.selectedTabIndex == 1 ? TabStyle.activeTab : TabStyle.inActiveTab)}>
                            <NBIcon name='ios-git-network' style={(this.state.selectedTabIndex == 1 ? TabStyle.activeText : TabStyle.inActiveText)} />
                            <NBText style={[TabStyle.tabText,
                            (this.state.selectedTabIndex == 1 ? TabStyle.activeText : TabStyle.inActiveText)]}>
                                CÔNG VIỆC CON
                            </NBText>
                        </TabHeading>
                    }>
                        <ChildTaskGroup userInfo={this.state.userInfo} navigator={this.props.navigator} inCompleteTask={this.state.LstTask} completeTask={this.state.LstCompletedTask} info={this.state.info}/>
                    </Tab>

                    {/*<Tab heading={
                        <TabHeading style={(this.state.selectedTabIndex == 2 ? TabStyle.activeTab : TabStyle.inActiveTab)}>
                            <NBIcon name='link' style={(this.state.selectedTabIndex == 2 ? TabStyle.activeText : TabStyle.inActiveText)} />
                            <NBText style={[TabStyle.tabText,
                            (this.state.selectedTabIndex == 2 ? TabStyle.activeText : TabStyle.inActiveText)]}>
                               KẾ HOẠCH THỰC HIỆN
                            </NBText>
                        </TabHeading>
                    }>
                        <TaskPlan />
                    </Tab>*/}

                    <Tab heading={
                        <TabHeading style={(this.state.selectedTabIndex == 3 ? TabStyle.activeTab : TabStyle.inActiveTab)}>
                            <NBIcon name='attach' style={(this.state.selectedTabIndex == 3 ? TabStyle.activeText : TabStyle.inActiveText)} />
                            <NBText style={[TabStyle.tabText,
                            (this.state.selectedTabIndex == 3 ? TabStyle.activeText : TabStyle.inActiveText)]}>
                               TÀI LIỆU ĐÍNH KÈM
                            </NBText>
                        </TabHeading>
                    }>
                        <TaskAttachment info={this.props.info.ListTaiLieu} />
                    </Tab>
                </Tabs>
            </View>
        );
    }
}

class ChildTaskGroup extends Component {
    constructor(props){
        super(props);
        this.state = {
            userInfo: props.userInfo,
            info: props.info,
            inCompleteTask: props.inCompleteTask,
            completeTask: props.completeTask, 
            executing: false
        }
    }

    async fetchData(){
        const url = `${API_URL}/api/HscvCongViec/GetSubTask/${this.state.info.CongViec.ID}`;
        const result = await fetch(url);

        const resultJson = await result.json();

        this.setState({
            inCompleteTask: resultJson.LstTask,
            completeTask: resultJson.LstCompletedTask, 
        })
    }
    
    //xác nhận bắt đầu xử lý công việc
    onConfirmBeginTask(taskId){
        Alert.alert(
          'XÁC NHẬN HOÀN THÀNH',
          'Bạn có chắc chắn đã hoàn thành công việc này?',
          [
            {text: 'Đồng ý', onPress: () => this.beginTask(taskId)},
            {text: 'Hủy bỏ', onPress: () => console.log('OK Pressed')},
          ]);
    }
    
    //xử lý công việc
    async beginTask(taskId){
        //hiển thị modal
        this.setState({
            executing: true
        })
        
        //xử lý api
        const result = await fetch(API_URL + `/api/HscvCongViec/FinishSubTask?ID=${taskId}`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json; charset=utf-8',
            }
        });
        const resultJson = await result.json();

        //ẩn modal

        await asyncDelay(2000);

        this.setState({
            executing: false
        }, ()=> {
            this.fetchData();
        });

        Toast.show({
            text: resultJson.Status ? 'Đã hoàn thành công việc' : 'Không thể hoàn thành công việc',
            type: resultJson.Status ? 'success' : 'danger',
            buttonText: "OK",
            buttonStyle: { backgroundColor: '#fff' },
            buttonTextStyle: { color: resultJson.Status ? '#337321' :'#FF0033'},
            duration: 5000
        });
    }

    render(){
        const imCompleteTitle = 'CHƯA HOÀN THÀNH (' + (this.state.inCompleteTask.length || 0)+')';
        const completeTitle = 'ĐÃ HOÀN THÀNH ('+(this.state.completeTask.length || 0 )+')';
        return(
            <View style={childTaskStyle.container}>
                <ScrollView>
                    <ChildTaskPanel title={imCompleteTitle} task={this.state.inCompleteTask}>
                    {
                        this.state.inCompleteTask.map((item, index) => (
                            <ListItem
                                key={item.ID.toString()}
                                containerStyle={{height: 60, backgroundColor: '#fff', justifyContent: 'center'}}
                                title={item.NOIDUNG}
                                titleStyle={{fontWeight: 'bold', color: '#000'}}
                                subtitle={
                                    <View style={{flexDirection: 'row'}}>
                                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                            <Icon name='ios-time-outline' type='ionicon' size={20}/>
                                            <Text style={{marginHorizontal: 5, fontWeight: 'bold' }}>
                                                {convertDateToString(item.HANHOANTHANH)}
                                            </Text>
                                        </View>

                                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                            <Text>Độ khẩn:</Text>
                                            <Text style={{marginHorizontal: 5, fontWeight: 'bold' }}>
                                                {item.DOKHAN_TEXT}
                                            </Text>
                                        </View>

                                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                            <Text>Ưu tiên:</Text>
                                            <Text style={{marginHorizontal: 5, fontWeight: 'bold' }}>
                                                {item.DOUUTIEN_TEXT}
                                            </Text>
                                        </View>
                                    </View>
                                }
                                rightIcon={
                                    <View style={{flexDirection: 'row'}}>
                                        {
                                            renderIf(item.DAGIAOVIEC == true)(
                                                <Text style={{fontWeight: 'bold', color: '#337321'}}>
                                                    ĐÃ GIAO
                                                </Text>
                                            )
                                        }

                                        {
                                            renderIf(item.DAGIAOVIEC != true 
                                                && ((this.state.info.CongViec.DAGIAOVIEC != true && this.state.info.IsNguoiGiaoViec == true 
                                                && this.state.info.CongViec.IS_SUBTASK != true) || (this.state.info.IsNguoiThucHienChinh == true)))(
                                                <TouchableOpacity style={{backgroundColor: '#fff', marginHorizontal: 5}}
                                                    onPress={() => this.onConfirmBeginTask(item.ID)}
                                                >
                                                    <Icon name='check' size={35} color={'#2455A6'} type='entypo'/>
                                                </TouchableOpacity>
                                            )
                                        }

                                        {
                                            renderIf((this.state.info.HasRoleAssignTask && item.DAGIAOVIEC != true) &&
                                                ((this.state.info.CongViec.DAGIAOVIEC != true && this.state.info.IsNguoiGiaoViec == true 
                                                && this.state.info.CongViec.IS_SUBTASK != true) || this.state.info.IsNguoiThucHienChinh == true))(
                                                <TouchableOpacity style={{backgroundColor: '#fff', marginHorizontal: 5}} 
                                                    onPress={()=> this.props.navigator.navigate('AssignTaskScreen', {
                                                        taskId: this.state.info.CongViec.ID,
                                                        subTaskId: item.ID
                                                    })}>
                                                    <Icon name='arrow-bold-right' size={35} color={'#2455A6'} type='entypo'/>
                                                </TouchableOpacity>
                                            )
                                        }
                                    </View>
                                }
                            />
                        ))
                    }
                    </ChildTaskPanel>

                    <ChildTaskPanel title={completeTitle} task={this.state.completeTask}>
                        {
                            this.state.completeTask.map((item, index) => (
                                <ListItem
                                    hideChevron={true}
                                    key={item.ID.toString()}
                                    containerStyle={{height: 60, backgroundColor: '#fff', justifyContent: 'center', paddingLeft: 0}}
                                    title={item.NOIDUNG}
                                    titleStyle={{fontWeight: 'bold', color: '#000', margin: 0}}
                                    leftIcon={
                                        null
                                    }
                                    subtitle={
                                        <View style={{flexDirection: 'row'}}>
                                            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                                <Icon name='ios-time-outline' type='ionicon' size={20}/>
                                                <Text style={{marginHorizontal: 5, fontWeight: 'bold' }}>
                                                    {convertDateToString(item.HANHOANTHANH)}
                                                </Text>
                                            </View>

                                            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                                <Icon name='ios-time-outline' type='ionicon' size={20}/>
                                                <Text style={{marginHorizontal: 5, fontWeight: 'bold' }}>
                                                    {convertDateToString(item.NGAYHOANTHANH)}
                                                </Text>
                                            </View>
                                        </View>
                                    }
                                />
                            ))
                        }
                    </ChildTaskPanel>
                </ScrollView>

                {
                    executeLoading(this.state.executing)
                }
            </View>
        );
    }
}

class ChildTaskPanel extends Component {
    constructor(props){
        super(props);
        this.state = {
            rotateAnimation: new Animated.Value(0),
            heightAnimation: new Animated.Value(60)
        }
    }

    toggle(){
        const initialHeightValue = this.state.expanded ? (this.state.minHeight + this.state.maxHeight) : this.state.minHeight;
        const finalHeightValue = this.state.expanded ? this.state.minHeight : (this.state.minHeight + this.state.maxHeight);
        this.state.heightAnimation.setValue(initialHeightValue);

        const initRotateValue = this.state.expanded ? 1 : 0;
        const finalRotateValue = this.state.expanded ? 0 : 1;
        this.state.rotateAnimation.setValue(initRotateValue)

        this.setState({
            expanded: !this.state.expanded
        });

        Animated.spring(this.state.rotateAnimation, {
            toValue: finalRotateValue,
            duration: 1000
        }).start();

        Animated.spring(this.state.heightAnimation, {
            toValue: finalHeightValue,
            duration: 2000
        }).start();
    }

    setMinHeight (event){
        this.setState({
            minHeight: event.nativeEvent.layout.height
        });
    }

    setMaxHeight (event){
        this.setState({
            maxHeight: event.nativeEvent.layout.height 
        })
    }

    render(){
        const interpolateRotation = this.state.rotateAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '180deg']
        });

        const iconRotationStyle = {
            transform:[
                {
                    rotate: interpolateRotation
                }
            ]
        }

        return(
            <Animated.View style={[childTaskStyle.panelContainer, { height: this.state.heightAnimation}]}>
                <View style={childTaskStyle.panelTitleContainer} onLayout={this.setMinHeight.bind(this)}>
                    <TouchableOpacity onPress={()=> this.toggle()}>
                        <ListItem 
                            containerStyle={childTaskStyle.panelListItemContainer} 
                            title={this.props.title}
                            titleStyle={childTaskStyle.panelItemTitle}
                            rightIcon={
                                <Animated.Image source={require('../../../assets/images/arrow-white.png')} style={iconRotationStyle}/>
                            }/>
                    </TouchableOpacity>
                </View>

                 <View onLayout={this.setMaxHeight.bind(this)}>
                    {this.props.children}
                </View>
            </Animated.View>
        );
    }
}

const childTaskStyle = StyleSheet.create({
    container: {
        flex: 1,
    },
    panelContainer: {
        backgroundColor: '#fff'
    }, 
    panelTitleContainer: {

    }, 
    panelListItemContainer: {
        height: 60,
        backgroundColor: '#FF993B',
        justifyContent: 'center'
    },
    panelItemTitle: {
        fontWeight: 'bold',
        color: '#fff'
    }
})


// class TaskPlan extends Component {
//     constructor(props){
//         super(props)
//     }

//     render(){
//         return(
//             <View>
//                 <Text>
//                     Kế hoạch công việc
//                 </Text>
//             </View>
//         );
//     }
// }

const mapStateToProps = (state) => {
    return {
        userInfo: state.userState.userInfo
    }
}

export default connect(mapStateToProps)(DetailTask);