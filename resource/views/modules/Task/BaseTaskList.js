'use strict'
import React, { Component } from 'react';
import {
    RefreshControl, AsyncStorage, ActivityIndicator, View, Text, Modal,
    FlatList, TouchableOpacity, Image
} from 'react-native';

//constant
import {
    API_URL, DEFAULT_PAGE_INDEX,
    DEFAULT_PAGE_SIZE, EMPTY_DATA_ICON_URI,
    EMPTY_STRING, EMTPY_DATA_MESSAGE,
    HEADER_COLOR, LOADER_COLOR
} from '../../../common/SystemConstant';

//native-base
import {
    Button, Icon, Item, Input, Title, Toast,
    Container, Header, Content, Left, Right, Body
} from 'native-base';

//react-native-elements
import { ListItem } from 'react-native-elements';

//redux
import { connect } from 'react-redux';

//lib
import renderIf from 'render-if';

//styles
import { ListTaskStyle } from '../../../assets/styles/TaskStyle';
import { indicatorResponsive } from '../../../assets/styles/ScaleIndicator';

//utilities
import { formatLongText, closeSideBar, openSideBar, getUserInfo, convertDateToString, getColorCodeByProgressValue } from '../../../common/Utilities';
import * as util from 'lodash';

class BaseTaskList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            userId: 0,
            loading: false,
            refreshing: false,
            data: [],
            pageIndex: DEFAULT_PAGE_INDEX,
            pageSize: DEFAULT_PAGE_SIZE,
            filterValue: EMPTY_STRING,
            showFilter: false,
            loadMore: false,
            type: props.type,
        }
    }

    componentWillMount = () => {
        this.setState({
            userId: this.props.userInfo.ID
        })
    }

    componentDidMount = () => {
        this.fetchData();
    }

    fetchData = async () => {
        const isLoading = this.state.loadMore;
        if (!isLoading) {
            this.setState({ loading: true });
        }

        let apiUrlParam = 'PersonalWork';

        if (this.state.type == 2) {
            apiUrlParam = 'AssignedWork'
        } else if (this.state.type == 3) {
            apiUrlParam = 'CombinationWork'
        } else if (this.state.type == 4) {
            apiUrlParam = 'ProcessedJob'
        }

        const url = `${API_URL}/api/HscvCongViec/PersonalWork/${this.state.userId}/${this.state.pageSize}/${this.state.pageIndex}?query=`;

        let result = await fetch(url).then(response => {
            return response.json();
        }).then(responseJson => {
            return responseJson.ListItem;
        }).catch(err => {
            console.log(`Error in URL: ${url}`, err);
            return []
        });

        this.setState({
            loading: false,
            refreshing: false,
            loadMore: false,
            data: isLoading ? result : [...this.state.data, ...result]
        });
    }

    toggleFilter = () => {
        this.setState({
            showFilter: !this.state.showFilter,
            filterValue: !this.state.showFilter ? EMPTY_STRING : this.state.filterValue
        })
    }

    clearFilterValue = () => {
        this.setState({
            filterValue: EMPTY_STRING
        });
    }

    onFilter = () => {
        //tìm kiếm
        if (util.isNull(this.state.filterValue) || util.isEmpty(this.state.filterValue)) {
            Toast.show({
                text: 'Vui lòng nhập tên công việc',
                type: 'danger',
                buttonText: "OK",
                buttonStyle: { backgroundColor: '#fff' },
                buttonTextStyle: { color: '#FF0033' },
                duration: 2000
            });
        } else {
            this.props.navigator.navigate('ListFilterTaskScreen', {
                filterValue: this.state.filterValue,
                filterType: this.state.type
            })
        }
    }

    renderItem = ({ item, index }) => {
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
                            <Text style={item.IS_READ === true ? ListTaskStyle.textRead : ListTaskStyle.textNormal}>
                                {item.TENCONGVIEC}
                            </Text>
                        }

                        subtitle={
                            <Text style={[item.IS_READ === true ? ListTaskStyle.textRead : ListTaskStyle.textNormal, ListTaskStyle.abridgment]}>
                                {'Hạn xử lý: ' + convertDateToString(item.NGAYHOANTHANH_THEOMONGMUON)}
                            </Text>
                        }
                    />
                </TouchableOpacity>
                {
                    renderIf(index === this.state.data.length - 1)(
                        <TouchableOpacity style={ListTaskStyle.loadMoreButton} onPress={() => this.handleEnd()}>
                            <Text style={ListTaskStyle.loadMoreButtonText}>TẢI THÊM CÔNG VIỆC</Text>
                        </TouchableOpacity>
                    )
                }
            </View>
        );
    }

    handleEnd = () => {
        this.setState(state => ({
            pageIndex: state.pageIndex + 1,
            loadMore: true,
        }), () => this.fetchData());
    }

    handleRefresh = () => {
        this.setState({
            refreshing: true,
            pageIndex: DEFAULT_PAGE_INDEX,
            pageSize: DEFAULT_PAGE_SIZE,
        }, () => {
            this.fetchData();
        });
    }

    render() {
        return (
            <Container>
                <Header style={{ backgroundColor: HEADER_COLOR }}>
                    <Left style={{ flex: 1 }}>
                        <Button transparent onPress={() => openSideBar(this.props.navigator)}>
                            <Icon name='menu' />
                        </Button>
                    </Left>
                    <Body style={{ flex: 3 }} >
                        <Item>
                            <Icon name="ios-arrow-round-back" onPress={() => this.toggleFilter()} />
                            <Input placeholder="Mã hiệu hoặc trích yếu"
                                value={this.state.filterValue}
                                onChangeText={(filterValue) => this.setState({ filterValue })}
                                onSubmitEditing={() => this.onFilter()} />
                            <Icon name="ios-close" onPress={() => this.clearFilterValue()} />
                        </Item>
                    </Body>
                    <Right style={{ flex: 1 }} >
                        <Button transparent onPress={() => this.onFilter()}>
                            <Text>Search</Text>
                        </Button>
                    </Right>
                </Header>
                <Content contentContainerStyle={{ justifyContent: 'center', flex: 1 }}>
                    {
                        renderIf(!this.state.loading)(
                            <FlatList
                                onEndReachedThreshold={0.1}
                                data={this.state.data}
                                keyExtractor={(item, index) => index.toString()}
                                renderItem={this.renderItem}
                                ListFooterComponent={() => this.state.loadMore ? <ActivityIndicator size={indicatorResponsive} animating color={LOADER_COLOR} /> : null}
                                ListEmptyComponent={() =>
                                    this.state.loading ? null : (
                                        <View style={ListTaskStyle.emtpyContainer}>
                                            <Image source={EMPTY_DATA_ICON_URI} style={ListTaskStyle.emptyIcon} />
                                            <Text style={ListTaskStyle.emptyMessage}>
                                                {EMTPY_DATA_MESSAGE}
                                            </Text>
                                        </View>
                                    )
                                }

                                refreshControl={
                                    <RefreshControl
                                        onRefresh={this.handleRefresh}
                                        refreshing={this.state.refreshing}
                                        colors={[LOADER_COLOR]}
                                        title={'Kéo để làm mới'}
                                    />
                                }
                            />
                        )
                    }
                    {
                        renderIf(this.state.loading)(
                            <ActivityIndicator size={indicatorResponsive} animating color={LOADER_COLOR} />
                        )
                    }
                </Content>


                {/* modal tìm kiếm văn bản */}
                <Modal animationType="fade"
                    transparent={true}
                    visible={this.state.showFilter}
                    onRequestClose={() => { console.log('close filter modal') }}>
                    <Container>
                        <Header searchBar rounded style={{ backgroundColor: HEADER_COLOR }}>
                            <Item>
                                <Icon name="ios-arrow-round-back" onPress={() => this.toggleFilter()} />
                                <Input placeholder="Tên công việc"
                                    value={this.state.filterValue}
                                    onChangeText={(filterValue) => this.setState({ filterValue })}
                                    onSubmitEditing={() => this.onFilter()} />
                                <Icon name="ios-close" onPress={() => this.clearFilterValue()} />
                            </Item>
                        </Header>
                    </Container>
                </Modal>
            </Container>
        );
    }
}

const mapStatetoProps = (state) => {
    return {
        userInfo: state.userState.userInfo
    }
}

export default connect(mapStatetoProps)(BaseTaskList);