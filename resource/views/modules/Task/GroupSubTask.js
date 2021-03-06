/**
 * @description: màn hình danh sách công việc con
 * @author: duynn
 * @since: 01/06/2018
 */

import React, { Component } from 'react';
import {
    Alert, ActivityIndicator, StyleSheet, RefreshControl,
    View as RnView, Text as RnText, FlatList, Platform
} from 'react-native';

//redux
import { connect } from 'react-redux';

//lib
import {
    Container, Header, Item, Input, Icon, Title, Form,
    Content, Button, Text, SwipeRow, Left, Body, Toast, Label, Right
} from 'native-base';
import { Icon as RneIcon } from 'react-native-elements';
import renderIf from 'render-if';
import * as util from 'lodash';
import PopupDialog, { DialogTitle, DialogButton } from 'react-native-popup-dialog';

//utilities
import {
    emptyDataPage, formatLongText,
    convertDateToString, asyncDelay,
} from '../../../common/Utilities'
import { executeLoading } from '../../../common/Effect'
import {
    API_URL, DEFAULT_PAGE_INDEX,
    EMPTY_STRING, LOADMORE_COLOR,
    LOADER_COLOR, HEADER_COLOR, DEFAULT_PAGE_SIZE, Colors
} from '../../../common/SystemConstant';

//styles
import { scale, verticalScale, indicatorResponsive, moderateScale } from '../../../assets/styles/ScaleIndicator';
import { NativeBaseStyle } from '../../../assets/styles/NativeBaseStyle';

class GroupSubTask extends Component {
    constructor(props) {
        super(props);

        this.state = {
            userId: props.userInfo.ID,
            taskId: props.navigation.state.params.taskId,
            taskType: props.navigation.state.params.taskType,
            data: [],
            dataItem: {},
            filterValue: EMPTY_STRING,
            pageIndex: DEFAULT_PAGE_INDEX,
            loadingMore: false,
            refreshing: false,
            searching: false,
            executing: false,

            canFinishTask: props.navigation.state.params.canFinishTask,
            canAssignTask: props.navigation.state.params.canAssignTask
        }
    }

    componentWillMount() {
        this.searchData();
    }

    searchData = () => {
        this.setState({
            searching: true,
            pageIndex: DEFAULT_PAGE_INDEX
        }, () => this.fetchData())
    }

    loadMoreData = () => {
        this.setState({
            loadingMore: true,
            pageIndex: this.state.pageIndex + 1
        }, () => this.fetchData())
    }

    fetchData = async () => {
        const url = `${API_URL}/api/HscvCongViec/GetSubTasks/${this.state.taskId}/${this.state.pageIndex}?query=${this.state.filterValue}`;
        const result = await fetch(url);
        const resultJson = await result.json();


        await asyncDelay(1000);

        this.setState({
            data: this.state.loadingMore ? [...this.state.data, ...resultJson] : resultJson,
            loadingMore: false,
            searching: false,
            refreshing: false
        })
    }

    onShowSubTaskInfo = (item) => {
        this.setState({
            dataItem: item
        }, () => {
            this.popupDialog.show();
        });
    }

    onEditSubTask = (item) => {
        let canAssign = this.state.canAssignTask && item.DAGIAOVIEC != true;
        let canFinish = this.state.canFinishTask && item.DAGIAOVIEC != true;

        if (canAssign && canFinish) {
            Alert.alert(
                'XỬ LÝ CÔNG VIỆC CON',
                `Xử lý công việc #${item.ID}`,
                [
                    { 'text': 'HOÀN THÀNH', onPress: () => this.onConfirmCompleteTask(item.ID) },
                    { 'text': 'GIAO VIỆC', onPress: () => this.onNavigateToAssignTask(item.ID) }
                ]
            )
        }
        else if (canAssign && !canFinish) {
            Alert.alert(
                'XỬ LÝ CÔNG VIỆC CON',
                `Xử lý công việc #${item.ID}`,
                [
                    { 'text': 'GIAO VIỆC', onPress: () => this.onNavigateToAssignTask(item.ID) },
                    { 'text': 'THOÁT', onPress: () => { } },
                ]
            )
        } else {
            Alert.alert(
                'XỬ LÝ CÔNG VIỆC CON',
                `Xử lý công việc #${item.ID}`,
                [
                    { 'text': 'HOÀN THÀNH', onPress: () => this.onConfirmCompleteTask(item.ID) },
                    { 'text': 'THOÁT', onPress: () => { } },
                ]
            )
        }
    }

    handleRefresh = () => {
        this.setState({
            refreshing: true,
            pageIndex: DEFAULT_PAGE_INDEX,
        }, () => {
            this.fetchData()
        })
    }

    onNavigateToAssignTask(id) {
        this.props.navigation.navigate('AssignTaskScreen', {
            taskId: this.state.taskId,
            taskType: this.state.taskType,
            subTaskId: id
        });
    }

    onConfirmCompleteTask(id) {
        Alert.alert(
            'XÁC NHẬN HOÀN THÀNH',
            'Bạn có chắc chắn đã hoàn thành công việc này?',
            [
                { 'text': 'Đồng ý', onPress: () => this.onCompleteSubTask(id) },
                { 'text': 'Hủy bỏ', onPress: () => { } }
            ]
        )
    }

    onCompleteSubTask = async (id) => {
        this.setState({
            executing: true
        });

        const url = `${API_URL}/api/HscvCongViec/CompleteSubTask?id=${id}`;
        const headers = new Headers({
            'Accept': 'application/json',
            'Content-Type': 'application/json;charset=utf-8'
        });

        const result = await fetch(url, {
            method: 'post',
            headers
        });

        const resultJson = await result.json();

        await asyncDelay(2000);

        this.setState({
            executing: false
        });

        Toast.show({
            text: 'Hoàn thành công việc ' + (resultJson.Status ? ' thành công' : ' không thành công'),
            type: resultJson.Status ? 'success' : 'danger',
            buttonText: "OK",
            buttonStyle: { backgroundColor: Colors.WHITE },
            buttonTextStyle: { color: resultJson.Status ? Colors.GREEN_PANTONE_364C : Colors.RED_PANTONE_186C },
            duration: 3000,
            onClose: () => {
                if (resultJson.Status) {
                    this.searchData();
                }
            }
        });

    }

    renderItem = ({ item }) => {
        let canAssign = this.state.canAssignTask && item.DAGIAOVIEC != true;
        let canFinish = this.state.canFinishTask && item.DAGIAOVIEC != true;

        return (
            <SwipeRow
                leftOpenValue={75}
                rightOpenValue={-75}
                disableLeftSwipe={(!canAssign && !canFinish) || item.TRANGTHAI_ID > 0}
                left={
                    <Button style={{ backgroundColor: '#d1d2d3' }} onPress={() => this.onShowSubTaskInfo(item)}>
                        <RneIcon name='info' type='foundation' size={verticalScale(30)} color={Colors.WHITE} />
                    </Button>
                }

                body={
                    <RnView>
                        <RnText style={styles.rowItem}>
                            <RnText style={styles.rowItemLabel}>
                                {'Tên công việc: '}
                            </RnText>

                            <RnText>
                                {item.TENCONGVIEC}
                            </RnText>

                            <RnText style={item.TRANGTHAI_ID > 0 ? styles.complete : styles.inComplete}>
                                {item.TRANGTHAI_ID > 0 ? ' (Đã hoàn thành)' : ' (Chưa hoàn thành)'}
                            </RnText>
                        </RnText>

                        <RnText style={styles.rowItem}>
                            <RnText style={styles.rowItemLabel}>
                                {'Thời hạn: '}
                            </RnText>
                            <RnText>
                                {convertDateToString(item.HANHOANTHANH)}
                            </RnText>
                        </RnText>
                    </RnView>
                }

                right={
                    <Button style={{ backgroundColor: Colors.BLUE_PANTONE_640C }} onPress={() => this.onEditSubTask(item)}>
                        <RneIcon name='pencil' type='foundation' size={verticalScale(30)} color={'#fff'} />
                    </Button>
                }
            />
        );
    }

    navigateBackToDetail() {
        this.props.navigation.navigate('DetailTaskScreen', {
            taskId: this.state.taskId,
            taskType: this.state.taskType
        });
    }

    render() {
        return (
            <Container>
                <Header searchBar style={{ backgroundColor: Colors.RED_PANTONE_186C }}>
                    <Left style={NativeBaseStyle.left}>
                        <Button transparent onPress={() => this.navigateBackToDetail()}>
                            <RneIcon name='ios-arrow-round-back' size={moderateScale(40)} color={Colors.WHITE} type='ionicon' />
                        </Button>
                    </Left>

                    <Body style={NativeBaseStyle.body}>
                        <Title style={NativeBaseStyle.bodyTitle}>
                            CÔNG VIỆC CON
                        </Title>
                    </Body>
                    <Right style={NativeBaseStyle.right}></Right>
                </Header>

                <Content contentContainerStyle={{ flex: 1 }}>

                    <Item>
                        <Icon name='ios-search' />
                        <Input
                            placeholder={'Tên công việc'}
                            onSubmitEditing={() => this.searchData()}
                            value={this.state.filterValue}
                            onChangeText={(filterValue) => this.setState({ filterValue })} />
                    </Item>

                    {
                        renderIf(this.state.searching)(
                            <RnView style={{ flex: 1, justifyContent: 'center' }}>
                                <ActivityIndicator size={indicatorResponsive} animating color={Colors.BLUE_PANTONE_640C} />
                            </RnView>
                        )
                    }

                    {
                        renderIf(!this.state.searching)(
                            <FlatList
                                keyExtractor={(item, index) => index.toString()}
                                data={this.state.data}
                                renderItem={this.renderItem}
                                refreshControl={
                                    <RefreshControl
                                        refreshing={this.state.refreshing}
                                        onRefresh={this.handleRefresh}
                                        title='Kéo để làm mới'
                                        colors={[Colors.BLUE_PANTONE_640C]}
                                        tintColor={[Colors.BLUE_PANTONE_640C]}
                                        titleColor='red'
                                    />
                                }
                                ListEmptyComponent={() => emptyDataPage()}
                                ListFooterComponent={
                                    this.state.loadingMore ?
                                        <ActivityIndicator size={indicatorResponsive} animating color={Colors.BLUE_PANTONE_640C} /> :
                                        (
                                            this.state.data.length >= DEFAULT_PAGE_SIZE ?
                                                <Button full style={{ backgroundColor: Colors.BLUE_PANTONE_640C }} onPress={() => this.loadMoreData()}>
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

                {
                    executeLoading(this.state.executing)
                }

                {/* hiển thị thông tin công việc con*/}
                <PopupDialog
                    dialogTitle={<DialogTitle title={`THÔNG TIN CÔNG VIỆC #${this.state.dataItem.CONGVIEC_ID}`}
                        titleStyle={{
                            ...Platform.select({
                                android: {
                                    height: verticalScale(50),
                                    justifyContent: 'center',
                                }
                            })
                        }} />}
                    ref={(popupDialog) => { this.popupDialog = popupDialog }}
                    width={0.8}
                    height={'auto'}
                    actions={[
                        <DialogButton
                            align={'center'}
                            buttonStyle={{
                                backgroundColor: Colors.GREEN_PANTON_369C,
                                alignSelf: 'stretch',
                                alignItems: 'center',
                                borderBottomLeftRadius: 8,
                                borderBottomRightRadius: 8,
                                ...Platform.select({
                                    ios: {
                                        justifyContent: 'flex-end',
                                    },
                                    android: {
                                        height: verticalScale(50),
                                        justifyContent: 'center',
                                    },
                                })
                            }}
                            text="ĐÓNG"
                            textStyle={{
                                fontSize: moderateScale(14, 1.5),
                                color: '#fff',
                                textAlign: 'center'
                            }}
                            onPress={() => {
                                this.popupDialog.dismiss();
                            }}
                            key="button-0"
                        />,
                    ]}>

                    <Form>
                        <Item stackedLabel>
                            <Label style={styles.dialogLabel}>
                                {'Người thực hiện: '}
                            </Label>

                            <Label style={styles.dialogText}>
                                {this.state.dataItem.NGUOITHUCHIEN}
                            </Label>
                        </Item>

                        <Item stackedLabel>
                            <Label style={styles.dialogLabel}>
                                {'Độ khẩn: '}
                            </Label>

                            <Label style={styles.dialogText}>
                                {this.state.dataItem.DOKHAN_TEXT}
                            </Label>
                        </Item>

                        <Item stackedLabel>
                            <Label style={styles.dialogLabel}>
                                {'Độ ưu tiên: '}
                            </Label>

                            <Label style={styles.dialogText}>
                                {this.state.dataItem.DOUUTIEN_TEXT}
                            </Label>
                        </Item>

                        <Item stackedLabel>
                            <Label style={styles.dialogLabel}>
                                {'Nội dung: '}
                            </Label>

                            <Label style={styles.dialogText}>
                                {'#' + this.state.dataItem.NOIDUNG}
                            </Label>
                        </Item>

                        <Item stackedLabel>
                            <Label style={styles.dialogLabel}>
                                {'Ngày tạo - Ngày hoàn thành: '}
                            </Label>

                            <Label style={styles.dialogText}>
                                {convertDateToString(this.state.dataItem.NGAYTAO) + ' - ' + convertDateToString(this.state.dataItem.NGAYHOANTHANH)}
                            </Label>
                        </Item>
                    </Form>
                </PopupDialog>
            </Container>
        );
    }
}

const styles = StyleSheet.create({
    rowItem: {
        paddingLeft: scale(10)
    },
    rowItemLabel: {
        marginHorizontal: scale(10),
        fontWeight: 'bold',
        color: '#000'
    }, complete: {
        fontWeight: 'bold',
        color: '#337321'
    }, inComplete: {
        fontWeight: 'bold',
        color: '#ff0033'
    }, dialogLabel: {
        fontWeight: 'bold',
        color: '#000',
        fontSize: moderateScale(14, 1.4)
    }
})


const mapStateToProps = (state) => {
    return {
        userInfo: state.userState.userInfo
    }
}

export default connect(mapStateToProps)(GroupSubTask);