/**
 * @description: danh sách văn bản đã xử lý
 * @author: duynn
 * @since: 02/05/2018
 */
'use strict'
import React, { Component } from 'react';
import {
    RefreshControl, ActivityIndicator, View, Text, Modal,
    FlatList, TouchableOpacity, Image
} from 'react-native';

//constant
import {
    API_URL, DEFAULT_PAGE_INDEX,
    DEFAULT_PAGE_SIZE, EMPTY_DATA_ICON_URI,
    EMPTY_STRING, EMTPY_DATA_MESSAGE,
    HEADER_COLOR, LOADER_COLOR, DOKHAN_CONSTANT
} from '../../../common/SystemConstant';

//native-base
import {
    Button, Icon, Item, Input, Title, Toast,
    Container, Header, Content, Left, Right, Body
} from 'native-base';

//react-native-elements
import { ListItem } from 'react-native-elements';

//lib
import renderIf from 'render-if';

//styles
import { ListPublishDocStyle } from '../../../assets/styles/PublishDocStyle';
import { indicatorResponsive } from '../../../assets/styles/ScaleIndicator';
//utilities
import { formatLongText, closeSideBar, openSideBar } from '../../../common/Utilities';

//redũx
import { connect } from 'react-redux';

import * as util from 'lodash';

class ListIsPublished extends Component {
    constructor(props) {
        super(props);
        this.state = {
            userId: this.props.userInfo.ID,
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
        });
    }

    componentDidMount = () => {
        this.fetchData();
    }

    fetchData = async () => {
        const isRefreshing = this.state.refreshing
        if (!isRefreshing) {
            this.setState({ loading: true });
        }

        const url = `${API_URL}/api/VanBanDen/${this.state.userId}/${this.state.pageSize}/${this.state.pageIndex}?query=`;

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
        if (util.isNull(this.state.filterValue) || util.isEmpty(this.state.filterValue)) {
            Toast.show({
                text: 'Vui lòng nhập mã hiệu hoặc trích yếu',
                type: 'danger',
                buttonText: "OK",
                buttonStyle: { backgroundColor: '#fff' },
                buttonTextStyle: { color: '#FF0033' },
                duration: 2000
            });
        } else {
            this.props.navigation.navigate('ListFilterPublishDocScreen', {
                filterValue: this.state.filterValue,
                filterType: 1
            })
        }
    }

    renderItem = ({ item }) => {
        return (
            <TouchableOpacity onPress={() => this.props.navigation.navigate('DetailPublishDocScreen', {
                docId: item.ID
            })}>
                <ListItem
                    hideChevron={true}
                    badge={{
                        value: (item.DOKHAN_ID == DOKHAN_CONSTANT.THUONG_KHAN) ? 'T.KHẨN' : ((item.DOKHAN_ID == DOKHAN_CONSTANT.KHAN) ? 'KHẨN' : 'THƯỜNG'),
                        textStyle: {
                            color: '#fff',
                            fontWeight: 'bold'
                        },
                        containerStyle: {
                            backgroundColor: (item.DOKHAN_ID == DOKHAN_CONSTANT.THUONG_KHAN) ? '#FF0033' : ((item.DOKHAN_ID == DOKHAN_CONSTANT.KHAN) ? '#FF6600' : '#337321')
                        }
                    }}
                    leftIcon={
                        <View style={ListPublishDocStyle.leftSide}>
                            {
                                renderIf(item.HAS_FILE)(
                                    <Icon name='ios-attach' />
                                )
                            }
                        </View>
                    }

                    title={
                        <Text style={item.IS_READ === true ? ListPublishDocStyle.textRead : ListPublishDocStyle.textNormal}>
                            {'SỐ HIỆU: ' + item.SOHIEU}
                        </Text>
                    }

                    subtitle={
                        <Text style={[item.IS_READ === true ? ListPublishDocStyle.textRead : ListPublishDocStyle.textNormal, ListPublishDocStyle.abridgment]}>
                            {formatLongText(item.TRICHYEU, 50)}
                        </Text>
                    }
                />
            </TouchableOpacity>
        );
    }

    handleEnd = () => {
        if (this.state.data.length >= DEFAULT_PAGE_SIZE) {
            this.setState(state => ({
                pageIndex: state.pageIndex + 1
            }), () => this.fetchData());
        }
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
                    <Left>
                        <Button transparent onPress={() => openSideBar(this.props.navigation)}>
                            <Icon name='menu' />
                        </Button>
                    </Left>

                    <Body>
                        <Title>
                            VĂN BẢN ĐÃ PHÁT HÀNH
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
                                <View style={ListPublishDocStyle.emtpyContainer}>
                                    <Image source={EMPTY_DATA_ICON_URI} style={ListPublishDocStyle.emptyIcon} />
                                    <Text style={ListPublishDocStyle.emptyMessage}>
                                        {EMTPY_DATA_MESSAGE}
                                    </Text>
                                </View>
                            )
                        }

                        refreshControl={
                            <RefreshControl
                                refreshing={this.state.refreshing}
                                onRefresh={this.handleRefresh}
                                title='Kéo để làm mới'
                                colors={[LOADER_COLOR]}
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
                                <Input placeholder="Mã hiệu hoặc trích yếu"
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

const mapStateToProps = (state) => {
    return {
        userInfo: state.userState.userInfo
    }
}
export default connect(mapStateToProps)(ListIsPublished)