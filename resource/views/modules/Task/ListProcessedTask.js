/**
 * @description: danh sách công việc cá nhân
 * @author: duynn
 * @since: 10/05/2018
 */
'use strict'
/**
 * @description: danh sách công việc được giao
 * @author: duynn
 * @since: 10/05/2018
 */
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

class ListProcessedTask extends Component {
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
            showFilter: false
        }
    }

    componentWillMount = () => {
        this.setState({
            userId: this.props.userInfo.ID
        })
    }

    componentDidMount = ()=> {
        this.fetchData();
    }

    fetchData = async () => {
        const isRefreshing = this.state.refreshing
        if (!isRefreshing) {
            this.setState({ loading: true });
        }

        const url = `${API_URL}/api/HscvCongViec/ProcessedJob/${this.state.userId}/${this.state.pageSize}/${this.state.pageIndex}?query=`;

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
            data: isRefreshing ? result : [...this.state.data, ...result]
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
        if(util.isNull(this.state.filterValue) || util.isEmpty(this.state.filterValue)){
            Toast.show({
                text: 'Vui lòng nhập tên công việc',
                type: 'danger',
                buttonText: "OK",
                buttonStyle: { backgroundColor: '#fff' },
                buttonTextStyle: { color: '#FF0033'},
                duration: 2000
            });
        } else {
             this.props.navigation.navigate('ListFilterTaskScreen', {
                filterValue: this.state.filterValue,
                filterType: 4
            })
        }
    }

    renderItem = ({ item }) => {
        return (
            <TouchableOpacity onPress={() => this.props.navigation.navigate('DetailTaskScreen', {
                taskId: item.ID,
                taskType: 4
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
                            {'Hạn xử lý: ' +  convertDateToString(item.NGAYHOANTHANH_THEOMONGMUON)}
                        </Text>
                    }
                />
            </TouchableOpacity>
        );
    }

    handleEnd = () => {
        if (this.state.data.length >= 10) {
            this.setState(state => ({
                pageIndex: state.pageIndex + 1
            }), () => this.fetchData());
        }
    }

    handleRefresh = ()=> {
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
                    <Left>
                        <Button transparent onPress={() => openSideBar(this.props.navigation)}>
                            <Icon name='menu' />
                        </Button>
                    </Left>

                    <Body>
                        <Title>
                            CÔNG VIỆC ĐÃ GIAO XỬ LÝ
                        </Title>
                    </Body>

                    <Right>
                        <Button transparent>
                            <Icon name='search' onPress={() => this.toggleFilter()} />
                        </Button>
                    </Right>
                </Header>
                <Content>
                    <FlatList
                        onEndReached={() => this.handleEnd()}
                        onEndReachedThreshold={0.1}
                        data={this.state.data}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={this.renderItem}
                        ListFooterComponent={() => this.state.loading ? <ActivityIndicator size={indicatorResponsive} animating color={LOADER_COLOR} /> : null}
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

export default connect(mapStatetoProps)(ListProcessedTask);