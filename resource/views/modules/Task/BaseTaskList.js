/**
 * @description: màn hình công việc
 * @author: duynn
 * @since: 29/05/2018
 */
'use strict'
import React, { Component } from 'react';
import {
    ActivityIndicator, View, Text as RnText,
    FlatList, RefreshControl, TouchableOpacity
} from 'react-native';

//redux
import { connect } from 'react-redux';

//lib
import {
    Container, Header, Left, Input,
    Item, Icon, Button, Text, Content
} from 'native-base';
import { List, ListItem } from 'react-native-elements';
import renderIf from 'render-if';

//constant
import {
    API_URL, HEADER_COLOR, EMPTY_STRING,
    LOADER_COLOR, CONGVIEC_CONSTANT,
    DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE
} from '../../../common/SystemConstant';

//utilities
import { indicatorResponsive } from '../../../assets/styles/ScaleIndicator';
import { getColorCodeByProgressValue, convertDateToString } from '../../../common/Utilities';

//styles
import { ListTaskStyle } from '../../../assets/styles/TaskStyle';


class BaseTaskList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            userId: props.userInfo.ID,

            filterValue: EMPTY_STRING,
            data: [],

            pageIndex: DEFAULT_PAGE_INDEX,
            pageSize: DEFAULT_PAGE_SIZE,

            loadingData: false,
            refreshingData: false,
            searchingData: false,
            loaingMoreData: false,
            taskType: props.taskType
        }
    }

    componentWillMount() {
        this.setState({
            loadingData: true
        }, () => {
            this.fetchData();
        })
    }

    async fetchData() {
        const loadingMoreData = this.state.loadingMoreData;
        const refreshingData = this.state.refreshingData;
        const loadingData = this.state.loadingData;

        const { taskType } = this.state;

        let apiUrlParam = 'PersonalWork';

        if (taskType == CONGVIEC_CONSTANT.DUOC_GIAO) {
            apiUrlParam = 'AssignedWork';
        } else if (taskType == CONGVIEC_CONSTANT.PHOIHOP_XULY) {
            apiUrlParam = 'CombinationWork';
        } else if (taskType == CONGVIEC_CONSTANT.DAGIAO_XULY) {
            apiUrlParam = 'ProcessedJob';
        }

        const url = `${API_URL}/api/HscvCongViec/${apiUrlParam}/${this.state.userId}/${this.state.pageSize}/${this.state.pageIndex}?query=${this.state.filterValue}`;

        console.log('123', url);

        let result = await fetch(url).then(response => {
            return response.json();
        }).then(responseJson => {
            return responseJson.ListItem;
        }).catch(err => {
            console.log(`Error in URL: ${url}`, err);
            return []
        });

        this.setState({
            loadingData: false,
            refreshingData: false,
            searchingData: false,
            loadingMoreData: false,
            data: (loadingData || refreshingData) ? result : [...this.state.data, ...result]
        });
    }

    onFilter() {
        this.setState({
            loadingData: true,
            pageIndex: DEFAULT_PAGE_INDEX
        }, () => {
            this.fetchData();
        })
    }

    onLoadingMore() {
        this.setState({
            loadingMoreData: true,
            pageIndex: this.state.pageIndex + 1
        }, () => {
            this.fetchData();
        })
    }

    handleRefresh = () => {
        this.setState({
            refreshingData: true,
            pageIndex: DEFAULT_PAGE_INDEX
        }, () => {
            this.fetchData();
        })
    }

    renderItem = ({ item }) => {
        return (
            <View>
                <TouchableOpacity onPress={() => this.props.navigator.navigate('DetailTaskScreen', {
                    taskId: item.ID,
                    taskType: this.state.type
                })}>
                    <ListItem
                        hideChevron={true}
                        badge={{
                            value: (item.PHANTRAMHOANTHANH || 0) + '%',
                            textStyle: {
                                color: '#fff',
                                fontWeight: 'bold'
                            },
                            containerStyle: {
                                backgroundColor: getColorCodeByProgressValue(item.PHANTRAMHOANTHANH)
                            }
                        }}

                        leftIcon={
                            <View style={ListTaskStyle.leftSide}>
                                {
                                    renderIf(item.HAS_FILE)(
                                        <Icon name='ios-attach' />
                                    )
                                }
                            </View>
                        }

                        title={
                            <RnText style={item.IS_READ === true ? ListTaskStyle.textRead : ListTaskStyle.textNormal}>
                                <RnText style={{fontWeight: 'bold'}}>
                                    Tên công việc:
                                </RnText>
                                <RnText>
                                    {' ' + item.TENCONGVIEC}
                                </RnText>
                            </RnText>
                        }

                        subtitle={
                            <RnText style={[item.IS_READ === true ? ListTaskStyle.textRead : ListTaskStyle.textNormal, ListTaskStyle.abridgment]}>
                                <RnText style={{fontWeight: 'bold'}}>
                                    Hạn xử lý:
                                </RnText>
                                <RnText>
                                    {' ' + convertDateToString(item.NGAYHOANTHANH_THEOMONGMUON)}
                                </RnText>
                            </RnText>
                        }
                    />
                </TouchableOpacity>
            </View>
        );
    }

    render() {
        return (
            <Container>
                <Header searchBar rounded style={{ backgroundColor: HEADER_COLOR }}>
                    <Item>
                        <Icon name='ios-search' />
                        <Input placeholder='Tên công việc'
                            value={this.state.filterValue}
                            onChangeText={(filterValue) => this.setState({filterValue})}
                            onSubmitEditing={() => this.onFilter()} />
                    </Item>
                </Header>

                <Content contentContainerStyle={{flex: 1}}>
                    {
                        renderIf(!this.state.loadingData)(
                            <List>
                                <FlatList
                                    data={this.state.data}
                                    keyExtractor={(item, index) => index.toString()}
                                    renderItem={this.renderItem}
                                    refreshControl={
                                        <RefreshControl
                                            refreshing={this.state.refreshingData}
                                            onRefresh={this.handleRefresh}
                                            title='Kéo để làm mới'
                                            colors={[LOADER_COLOR]}
                                            tintColor={[LOADER_COLOR]}
                                            titleColor='red'
                                        />
                                    }
                                    ListFooterComponent={
                                        this.state.loadingMoreData ?
                                            <ActivityIndicator size={indicatorResponsive} animating color={LOADER_COLOR} /> :
                                            (
                                                this.state.data.length >= DEFAULT_PAGE_SIZE ?
                                                    <Button full style={{ backgroundColor: '#0082ba' }} onPress={() => this.onLoadingMore()}>
                                                        <Text>
                                                            TẢI THÊM
                                                        </Text>
                                                    </Button>
                                                    : null
                                            )
                                    }
                                />
                            </List>
                        )
                    }

                    {
                        renderIf(this.state.loadingData)(
                            <View style={{ flex: 1, justifyContent: 'center' }}>
                                <ActivityIndicator size={indicatorResponsive} animating color={LOADER_COLOR} />
                            </View>
                        )
                    }
                </Content>
            </Container>
        )
    }
}

const mapStatetoProps = (state) => {
    return {
        userInfo: state.userState.userInfo
    }
}

export default connect(mapStatetoProps)(BaseTaskList);