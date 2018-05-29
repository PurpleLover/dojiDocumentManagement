/**
 * @description: danh sách văn bản trình ký chưa xử lý
 * @author: duynn
 * @since: 02/05/2018
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
  HEADER_COLOR, LOADER_COLOR, DOKHAN_CONSTANT
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
import * as util from 'lodash';

//styles
import { ListSignDocStyle } from '../../../assets/styles/SignDocStyle';
import { indicatorResponsive } from '../../../assets/styles/ScaleIndicator';

//utilities
import { formatLongText, closeSideBar, openSideBar, getUserInfo } from '../../../common/Utilities';
import { authenticateLoading } from '../../../common/Effect';

class BaseSignDocList extends Component {
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
      extendSearch: false,
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

    let apiUrlParam = 'GetListProcessing';
    const { type } = this.state;
    if (type == 2) {
      apiUrlParam = 'GetListProcessed'
    } else if (type == 3) {
      apiUrlParam = 'GetListReview'
    } else if (type == 4) {
      apiUrlParam = 'GetListReviewed'
    }

    const url = `${API_URL}/api/VanBanDi/${apiUrlParam}/${this.state.userId}/${this.state.pageSize}/${this.state.pageIndex}?query=`;

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
      this.props.navigator.navigate('ListFilterSignDocScreen', {
        filterValue: this.state.filterValue,
        filterType: this.state.type,
      })
    }

  }

  renderItem = ({ item, index }) => {
    return (
      <View>
        <TouchableOpacity onPress={() => this.props.navigator.navigate('DetailSignDocScreen', {
          docId: item.ID,
          docType: this.state.type,
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
              <View style={ListSignDocStyle.leftSide}>
                {
                  renderIf(item.HAS_FILE)(
                    <Icon name='ios-attach' />
                  )
                }
              </View>
            }

            title={
              <Text style={item.IS_READ === true ? ListSignDocStyle.textRead : ListSignDocStyle.textNormal}>
                {'SỐ HIỆU: ' + item.SOHIEU}
              </Text>
            }

            subtitle={
              <Text style={[item.IS_READ === true ? ListSignDocStyle.textRead : ListSignDocStyle.textNormal, ListSignDocStyle.abridgment]}>
                {formatLongText(item.TRICHYEU, 50)}
              </Text>
            }
          />
        </TouchableOpacity>
        {
          renderIf(index === this.state.data.length - 1)(
            <TouchableOpacity style={ListSignDocStyle.loadMoreButton} onPress={() => this.handleEnd()}>
              <Text style={ListSignDocStyle.loadMoreButtonText}>TẢI THÊM VĂN BẢN</Text>
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
        <Header searchBar rounded style={{ backgroundColor: HEADER_COLOR }}>
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
                    <View style={ListSignDocStyle.emtpyContainer}>
                      <Image source={EMPTY_DATA_ICON_URI} style={ListSignDocStyle.emptyIcon} />
                      <Text style={ListSignDocStyle.emptyMessage}>
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
                    tintColor={[LOADER_COLOR]}
                    titleColor='red'
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
      </Container>
    );
  }
}

const mapStatetoProps = (state) => {
  return {
    userInfo: state.userState.userInfo
  }
}

export default connect(mapStatetoProps)(BaseSignDocList);