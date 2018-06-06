/**
 * @description: chi tiết công việc
 * @author: duynn
 * @since: 10/05/2018
 */
'use strict'
import React, { Component } from 'react';
import { ActivityIndicator, Alert, View as RnView, Text as RnText, FlatList } from 'react-native';
//redux
import { connect } from 'react-redux';

//lib
import { MenuProvider, Menu, MenuTrigger, MenuOptions, MenuOption } from 'react-native-popup-menu';
import {
    Container, Header, Left, Button, Body,
    Title, Right, Toast, Tabs, Tab, TabHeading, ScrollableTab,
    Icon as NbIcon, Text, SwipeRow, Item, Input,
    Content
} from 'native-base';
import { Icon } from 'react-native-elements';
import renderIf from 'render-if';
import * as util from 'lodash'

//utilities
import {
    API_URL, LOADER_COLOR, HEADER_COLOR, Colors,
    CONGVIEC_CONSTANT, PLANJOB_CONSTANT, EMPTY_DATA_ICON_URI, EMPTY_STRING, DEFAULT_PAGE_INDEX
} from '../../../common/SystemConstant';
import { asyncDelay, convertDateToString, formatLongText } from '../../../common/Utilities';
import { verticalScale, indicatorResponsive, scale, moderateScale } from '../../../assets/styles/ScaleIndicator';
import { executeLoading, dataLoading } from '../../../common/Effect';

//styles
import { MenuStyle, MenuOptionStyle } from '../../../assets/styles/MenuPopUpStyle';
import { TabStyle } from '../../../assets/styles/TabStyle';

//comps
import TaskDescription from './TaskDescription';
import TaskAttachment from './TaskAttachment';
import GroupSubTask from './GroupSubTask';

class DetailTask extends Component {
    constructor(props) {
        super(props);
        this.state = {
            userId: this.props.userInfo.ID,
            taskId: this.props.navigation.state.params.taskId,
            taskType: this.props.navigation.state.params.taskType,
            taskInfo: {},
            loading: false,
            executing: false
        }
    }

    componentWillMount() {
        this.fetchData();
    }

    fetchData = async () => {
        this.setState({
            loading: true
        });

        const url = `${API_URL}/api/HscvCongViec/JobDetail/${this.state.taskId}/${this.state.userId}`;

        const result = await fetch(url);
        const resultJson = await result.json();

        this.setState({
            loading: false,
            taskInfo: resultJson,
            subTaskData: resultJson.LstTask || []
        });
    }

    //xác nhận bắt đầu công việc
    onConfirmToStartTask = () => {
        Alert.alert(
            'XÁC NHẬN BẮT ĐẦU XỬ LÝ CÔNG VIỆC',
            'Bạn có chắc chắn muốn bắt đầu thực hiện công việc này?',
            [
                {
                    text: 'Đồng ý', onPress: () => { this.onStartTask() }
                },

                {
                    text: 'Hủy bỏ', onPress: () => { }
                }
            ]
        )
    }

    //bắt đầu công việc

    onStartTask = async () => {
        this.setState({
            executing: true
        });

        const url = `${API_URL}/api/HscvCongViec/BeginProcess`;

        const headers = new Headers({
            'Accept': 'application/json',
            'Content-Type': 'application/json; charset=utf-8'
        });

        const body = JSON.stringify({
            userId: this.state.userId,
            taskId: this.state.taskId
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
        });

        Toast.show({
            text: resultJson.Status ? 'Bắt đầu công việc thành công' : 'Bắt đầu công việc không thành công',
            type: resultJson.Status ? 'success' : 'danger',
            buttonText: "OK",
            buttonStyle: { backgroundColor: Colors.WHITE },
            buttonTextStyle: { color: resultJson.Status ? Colors.GREEN_PANTONE_364C : Colors.RED_PANTONE_186C },
            duration: 3000,
            onClose: () => {
                if (resultJson.Status) {
                    this.fetchData();
                }
            }
        });

    }


    navigateBackToList = () => {
        let screenName = 'ListPersonalTaskScreen';

        if (this.state.taskType == CONGVIEC_CONSTANT.DUOC_GIAO) {
            screenName = 'ListAssignedTaskScreen'
        } else if (this.state.taskType == CONGVIEC_CONSTANT.PHOIHOP_XULY) {
            screenName = 'ListCombinationTaskScreen'
        } else if (this.state.taskType == CONGVIEC_CONSTANT.DAGIAO_XULY) {
            screenName = 'ListProcessedTaskScreen'
        }

        this.props.navigation.navigate(screenName);
    }

    render() {
        const bodyContent = this.state.loading ? dataLoading(true) : <TaskContent userInfo={this.props.userInfo} info={this.state.taskInfo} />;
        const menuActions = [];
        if (!this.state.loading) {
            const task = this.state.taskInfo;
            if (task.CongViec.IS_BATDAU == true) {
                if (((task.CongViec.DAGIAOVIEC != true && task.IsNguoiGiaoViec == true && task.CongViec.IS_SUBTASK != true) || task.IsNguoiThucHienChinh) && (task.CongViec.PHANTRAMHOANTHANH < 100)) {
                    menuActions.push(
                        <MenuOption key={-1} onSelect={() => {
                            this.props.navigation.navigate('UpdateProgressTaskScreen', {
                                taskId: this.state.taskId,
                                taskType: this.state.taskType,
                                progressValue: this.state.taskInfo.CongViec.PHANTRAMHOANTHANH || 0
                            })
                        }}
                            style={[MenuOptionStyle.wrapper, MenuOptionStyle.wrapperBorder]}>
                            <Text style={MenuOptionStyle.text}>
                                CẬP NHẬT TIẾN ĐỘ
                            </Text>
                        </MenuOption>
                    )

                    if (task.CongViec.NGUOIXULYCHINH_ID != task.CongViec.NGUOIGIAOVIEC_ID) {
                        menuActions.push(
                            <MenuOption key={-111} onSelect={() => {
                                this.props.navigation.navigate('RescheduleTaskScreen', {
                                    taskId: this.state.taskId,
                                    taskType: this.state.taskType
                                })
                            }}
                                style={[MenuOptionStyle.wrapper, MenuOptionStyle.wrapperBorder]}>
                                <Text style={MenuOptionStyle.text}>
                                    XIN LÙI HẠN CÔNG VIỆC
                                </Text>
                            </MenuOption>
                        )
                    }
                }

                if (task.IsNguoiGiaoViec && task.CongViec.PHANTRAMHOANTHANH == 100 && task.CongViec.NGUOIGIAOVIECDAPHANHOI == null) {
                    menuActions.push(
                        <MenuOption key={-1} onSelect={() => {
                            this.props.navigation.navigate('ApproveProgressTaskScreen', {
                                taskId: this.state.taskId,
                                taskType: this.state.taskType
                            })
                        }}
                            style={[MenuOptionStyle.wrapper, MenuOptionStyle.wrapperBorder]}>
                            <Text style={MenuOptionStyle.text}>
                                PHẢN HỒI CÔNG VIỆC
                                </Text>
                        </MenuOption>
                    )
                }

                if (((task.CongViec.DAGIAOVIEC != true && task.IsNguoiGiaoViec && task.CongViec.IS_SUBTASK != true) || task.IsNguoiThucHienChinh)
                    && (task.CongViec.PHANTRAMHOANTHANH == null || task.CongViec.PHANTRAMHOANTHANH < 100)) {
                    menuActions.push(
                        <MenuOption key={0} onSelect={() => this.props.navigation.navigate('CreateSubTaskScreen', {
                            taskId: this.state.taskId,
                            taskType: this.state.taskType,
                        })}
                            style={[MenuOptionStyle.wrapper, MenuOptionStyle.wrapperBorder]}>
                            <Text style={MenuOptionStyle.text}>
                                TẠO CÔNG VIỆC CON
                            </Text>
                        </MenuOption>
                    )
                }

                if (task.HasRoleAssignTask && (task.CongViec.PHANTRAMHOANTHANH == 0 || task.CongViec.PHANTRAMHOANTHANH == null) && task.CongViec.DAGIAOVIEC != true) {
                    menuActions.push(
                        <MenuOption onSelect={() => this.props.navigation.navigate('AssignTaskScreen', {
                            taskId: this.state.taskId,
                            taskType: this.state.taskType,
                            subTaskId: this.state.taskInfo.CongViec.SUBTASK_ID || 0
                        })}
                            key={1}
                            style={[MenuOptionStyle.wrapper, MenuOptionStyle.wrapperBorder]}>
                            <Text style={MenuOptionStyle.text}>
                                GIAO VIỆC
                            </Text>
                        </MenuOption>
                    )
                }

                if (task.HasRoleAssignTask) {
                    if (task.CongViec.NGUOIXULYCHINH_ID != task.CongViec.NGUOIGIAOVIEC_ID) {
                        // menuActions.push(
                        //     <MenuOption key={2}
                        //         style={[MenuOptionStyle.wrapper, MenuOptionStyle.wrapperBorder]}>
                        //         <Text style={MenuOptionStyle.text}>
                        //             THEO DÕI
                        //         </Text>
                        //     </MenuOption>
                        // )
                    }
                }

                if (task.CongViec.NGUOIGIAOVIECDAPHANHOI == true) {
                    if (task.IsNguoiGiaoViec == true && task.CongViec.PHANTRAMHOANTHANH == 100 && task.CongViec.DATUDANHGIA == true && task.CongViec.NGUOIGIAOVIECDANHGIA != true) {
                        menuActions.push(
                            <MenuOption onSelect={() => this.props.navigation.navigate('ApproveEvaluationTaskScreen', {
                                taskId: this.state.taskId,
                                taskType: this.state.taskType,
                                PhieuDanhGia: this.state.taskInfo.PhieuDanhGia || {}
                            })}
                                key={3}
                                style={[MenuOptionStyle.wrapper, MenuOptionStyle.wrapperBorder]}>
                                <Text style={MenuOptionStyle.text}>
                                    DUYỆT ĐÁNH GIÁ CÔNG VIỆC
                                </Text>
                            </MenuOption>
                        )
                    }

                    if (task.IsNguoiThucHienChinh && task.CongViec.PHANTRAMHOANTHANH == 100 && task.CongViec.DATUDANHGIA != true) {
                        menuActions.push(
                            <MenuOption onSelect={() => this.props.navigation.navigate('EvaluationTaskScreen', {
                                taskId: this.state.taskId,
                                taskType: this.state.taskType,
                            })}
                                key={4}
                                style={[MenuOptionStyle.wrapper, MenuOptionStyle.wrapperBorder]}>
                                <Text style={MenuOptionStyle.text}>
                                    ĐÁNH GIÁ CÔNG VIỆC
                                </Text>
                            </MenuOption>
                        )
                    }
                }
            } else {
                // Nếu công việc chưa bắt đầu
                if (task.CongViec.NGUOIXULYCHINH_ID == null) {
                    // Truong hop chua co nguoi xu ly la cong viec chua duoc giao
                    // Chưa được giao thì ko cần lập kế hoạch, tránh vừa đánh trống vừa thôi kèn
                    // Chỉ yêu cầu lập kế hoạch khi mà người xử lý chính và người giao việc khác nhau
                    if (task.HasRoleAssignTask && (task.CongViec.PHANTRAMHOANTHANH == 0 || task.CongViec.PHANTRAMHOANTHANH == null) && task.CongViec.DAGIAOVIEC != true) {
                        menuActions.push(
                            <MenuOption onSelect={() => this.props.navigation.navigate('AssignTaskScreen', {
                                taskId: this.state.taskId,
                                taskType: this.state.taskType,
                                subTaskId: this.state.taskInfo.CongViec.SUBTASK_ID || 0
                            })}
                                key={5}
                                style={[MenuOptionStyle.wrapper, MenuOptionStyle.wrapperBorder]}>
                                <Text style={MenuOptionStyle.text}>
                                    GIAO VIỆC
                                </Text>
                            </MenuOption>
                        )

                        menuActions.push(
                            <MenuOption key={6} onSelect={() => this.onConfirmToStartTask()}
                                style={[MenuOptionStyle.wrapper, MenuOptionStyle.wrapperBorder]}>
                                <Text style={MenuOptionStyle.text}>
                                    BẮT ĐẦU XỬ LÝ
                                </Text>
                            </MenuOption>
                        )
                    }
                }
                else if (task.IsNguoiGiaoViec) {
                    // menuActions.push(
                    //     <MenuOption key={7} style={[MenuOptionStyle.wrapper, MenuOptionStyle.wrapperBorder]}>
                    //         <Text style={MenuOptionStyle.text}>
                    //             THEO DÕI
                    //         </Text>
                    //     </MenuOption>
                    // )
                    if (task.CongViec.IS_HASPLAN == true && task.TrangThaiKeHoach == PLANJOB_CONSTANT.DATRINHKEHOACH) {
                        {/*menuActions.push(
                            <MenuOption key={8} style={[MenuOptionStyle.wrapper,MenuOptionStyle.wrapperBorder]}>
                                <Text style={MenuOptionStyle.text}>
                                    DUYỆT KẾ HOẠCH
                                </Text>
                            </MenuOption>
                        )*/}
                    }
                } else {
                    if (task.CongViec.IS_HASPLAN == true) {
                        // Nếu công việc yêu cầu lập kế hoạch trước khi bắt đầu thực hiện
                        if (task.TrangThaiKeHoach == PLANJOB_CONSTANT.CHUATRINHKEHOACH) {
                            // nếu chưa trình kế hoạch và là người xử lý chính thì
                            if (task.IsNguoiThucHienChinh) {
                                {/*menuActions.push(
                                        <MenuOption key={9} style={[MenuOptionStyle.wrapper,MenuOptionStyle.wrapperBorder]}>
                                            <Text style={MenuOptionStyle.text}>
                                                TRÌNH KẾ HOẠCH
                                            </Text>
                                        </MenuOption>
                                    )*/}
                            }
                        }
                        else if (task.TrangThaiKeHoach == PLANJOB_CONSTANT.CHUALAPKEHOACH || task.TrangThaiKeHoach == PLANJOB_CONSTANT.LAPLAIKEHOACH) {
                            {/*menuActions.push(
                                    <MenuOption key={10} style={[MenuOptionStyle.wrapper,MenuOptionStyle.wrapperBorder]}>
                                        <Text style={MenuOptionStyle.text}>
                                            LẬP KẾ HOẠCH
                                        </Text>
                                    </MenuOption>
                                )*/}
                        }
                        else if (task.TrangThaiKeHoach == PLANJOB_CONSTANT.DAPHEDUYETKEHOACH) {
                            if (task.IsNguoiThucHienChinh) {
                                menuActions.push(
                                    <MenuOption key={11}
                                        onSelect={() => this.onConfirmToStartTask()}
                                        style={[MenuOptionStyle.wrapper, MenuOptionStyle.wrapperBorder]}>
                                        <Text style={MenuOptionStyle.text}>
                                            BẮT ĐẦU XỬ LÝ
                                            </Text>
                                    </MenuOption>
                                )
                            }
                        }
                    } else {
                        //Bắt đầu xử lý
                        menuActions.push(
                            <MenuOption key={12}
                                onSelect={() => this.onConfirmToStartTask()}
                                style={[MenuOptionStyle.wrapper, MenuOptionStyle.wrapperBorder]}>
                                <Text style={MenuOptionStyle.text}>
                                    BẮT ĐẦU XỬ LÝ
                                </Text>
                            </MenuOption>
                        )
                    }
                }
            }
        }

        //menu thông tin về công việc

        menuActions.push(
            <MenuOption
                key='m1'
                onSelect={() => this.props.navigation.navigate('GroupSubTaskScreen', {
                    taskId: this.state.taskId,
                    taskType: this.state.taskType,
                })}
                style={[MenuOptionStyle.wrapper, MenuOptionStyle.wrapperBorder]}>
                <Text style={MenuOptionStyle.text}>
                    D/S CÔNG VIỆC CON
                </Text>
            </MenuOption>
        );

        menuActions.push(
            <MenuOption
                key='m2'
                onSelect={() => this.props.navigation.navigate('HistoryProgressTaskScreen', {
                    taskId: this.state.taskId,
                    taskType: this.state.taskType,
                })}
                style={[MenuOptionStyle.wrapper, MenuOptionStyle.wrapperBorder]}>
                <Text style={MenuOptionStyle.text}>
                    THEO DÕI TIẾN ĐỘ
                    </Text>
            </MenuOption>
        );

        menuActions.push(
            <MenuOption
                key='m3'
                onSelect={() => this.props.navigation.navigate('HistoryRescheduleTaskScreen', {
                    taskId: this.state.taskId,
                    taskType: this.state.taskType,
                    canApprove: this.state.taskInfo.IsNguoiGiaoViec
                })}
                style={[MenuOptionStyle.wrapper, MenuOptionStyle.wrapperBorder]}>
                <Text style={MenuOptionStyle.text}>
                    LỊCH SỬ LÙI HẠN
                </Text>
            </MenuOption>
        );

        menuActions.push(
            <MenuOption
                key='m4'
                onSelect={() => this.props.navigation.navigate('HistoryEvaluateTaskScreen', {
                    taskId: this.state.taskId,
                    taskType: this.state.taskType,
                })}
                style={[MenuOptionStyle.wrapper, MenuOptionStyle.wrapperBorder]}>
                <Text style={MenuOptionStyle.text}>
                    LỊCH SỬ PHẢN HỒI
                </Text>
            </MenuOption>
        );
        return (
            <MenuProvider>
                <Container>
                    <Header style={{ backgroundColor: Colors.RED_PANTONE_186C }}>
                        <Left style={{ flex: 1 }}>
                            <Button transparent onPress={() => this.navigateBackToList()}>
                                <Icon name='ios-arrow-round-back' size={moderateScale(40)} color={Colors.WHITE} type='ionicon' />
                            </Button>
                        </Left>

                        <Body style={{ flex: 3 }}>
                            <Title style={{ color: '#fff', fontWeight: 'bold' }}>
                                THÔNG TIN CÔNG VIỆC
                            </Title>
                        </Body>

                        <Right style={{ flex: 1 }}>
                            {
                                renderIf(menuActions.length > 0)(
                                    <Menu style={{ marginHorizontal: scale(5) }}>
                                        <MenuTrigger>
                                            <Icon name='dots-three-horizontal' color={Colors.WHITE} type='entypo' size={verticalScale(25)} />
                                        </MenuTrigger>

                                        <MenuOptions>
                                            {
                                                menuActions
                                            }
                                        </MenuOptions>
                                    </Menu>
                                )
                            }
                        </Right>
                    </Header>

                    {
                        bodyContent
                    }

                    {/* hiệu ứng xử lý */}

                    {
                        executeLoading(this.state.executing)
                    }
                </Container>
            </MenuProvider >
        );
    }
}


class TaskContent extends Component {
    constructor(props) {
        super(props);

        this.state = {
            userInfo: props.userInfo,
            info: props.info,
            selectedTabIndex: 0
        }
    }

    render() {
        return (
            <RnView style={{ flex: 1 }}>
                <Tabs
                    initialPage={0}
                    tabBarUnderlineStyle={TabStyle.underLineStyle}
                    onChangeTab={(selectedTabIndex) => this.setState({ selectedTabIndex })}>
                    <Tab heading={
                        <TabHeading style={(this.state.selectedTabIndex == 0) ? TabStyle.activeTab : TabStyle.inActiveTab}>
                            <NbIcon name='ios-information-circle' style={TabStyle.activeText} />
                            <Text style={(this.state.selectedTabIndex == 0) ? TabStyle.activeText : TabStyle.inActiveText}>
                                MÔ TẢ
                            </Text>
                        </TabHeading>
                    }>
                        <TaskDescription info={this.props.info} />
                    </Tab>

                    <Tab heading={
                        <TabHeading style={(this.state.selectedTabIndex == 2) ? TabStyle.activeTab : TabStyle.inActiveTab}>
                            <NbIcon name='ios-attach' style={TabStyle.activeText} />
                            <Text style={(this.state.selectedTabIndex == 2) ? TabStyle.activeText : TabStyle.inActiveText}>
                                ĐÍNH KÈM
                            </Text>
                        </TabHeading>
                    }>
                        <TaskAttachment info={this.props.info} />
                    </Tab>
                </Tabs>
            </RnView>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        userInfo: state.userState.userInfo
    }
}

export default connect(mapStateToProps)(DetailTask);