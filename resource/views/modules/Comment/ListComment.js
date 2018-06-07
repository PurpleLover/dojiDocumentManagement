'use strict'
import React, { Component } from 'react';
import {
  Keyboard, Animated, View, RefreshControl, ActivityIndicator,
  FlatList, Text as RnText, TouchableOpacity, Image
} from 'react-native';
//redux
import { connect } from 'react-redux';

//lib
import {
  Container, Header, Left, Button, Body,
  Title, Right,
  Icon as NbIcon, Text, Item, Input,
  Content, Footer, ListItem, Textarea
} from 'native-base';
import { Icon } from 'react-native-elements';
import renderIf from 'render-if';
import * as util from 'lodash'
import ViewMoreText from 'react-native-view-more-text';

//utilities
import {
  API_URL, LOADER_COLOR, HEADER_COLOR, Colors,
  CONGVIEC_CONSTANT, PLANJOB_CONSTANT, EMPTY_DATA_ICON_URI,
  EMPTY_STRING, DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE
} from '../../../common/SystemConstant';
import { asyncDelay, convertDateToString, convertDateTimeToString, emptyDataPage, formatLongText } from '../../../common/Utilities';
import { verticalScale, indicatorResponsive, scale, moderateScale } from '../../../assets/styles/ScaleIndicator';
import { executeLoading, dataLoading } from '../../../common/Effect';

//styles
import { MenuStyle, MenuOptionStyle } from '../../../assets/styles/MenuPopUpStyle';
import { TabStyle } from '../../../assets/styles/TabStyle';
import { ListCommentStyle } from '../../../assets/styles/CommentStyle';

export default class ListComment extends Component {
  constructor(props) {
    super(props);
    this.state = {
      commentValue: EMPTY_STRING,
      footerView: 0, //comment input

      data: [
        { id: '1', name: 'acccccc', content: 'Tối qua tôi thử đặt một cốc nước chứa xà phòng gần bức tường mà tụi nó hay chui ra. Thiệt tình tôi cũng chẳng hy vọng gì nhiều... nhưng mà sáng nay thì có vẻ tụi kiến đó đã tự nguyện chết chìm hộ cả lũ.', time: '03-07-2018', numberReplies: 3, hasFile: false },
        { id: '2', name: 'a', content: 'Tối qua tôi thử đặt một cốc nước chứa xà phòng gần bức tường mà tụi nó hay chui ra. Thiệt tình tôi cũng chẳng hy vọng gì nhiều... nhưng mà sáng nay thì có vẻ tụi kiến đó đã tự nguyện ', time: '03-07-2018', numberReplies: 3, hasFile: false },
        { id: '3', name: 'a', content: 'And yes', time: '03-07-2018', numberReplies: 3, hasFile: false },
        { id: '4', name: 'a', content: 'And yes', time: '03-07-2018', numberReplies: 3, hasFile: false },
        // { id: '5', name: 'a', content: 'And yes', time: new Date(), numberReplies: 3, hasFile: false },
        // { id: '6', name: 'a', content: 'And yes', time: new Date(), numberReplies: 3, hasFile: false },
        // { id: '7', name: 'a', content: 'And yes', time: new Date(), numberReplies: 3, hasFile: false },
        // { id: '8', name: 'a', content: 'And yes', time: new Date(), numberReplies: 3, hasFile: false },
        // { id: '9', name: 'a', content: 'And yes', time: new Date(), numberReplies: 3, hasFile: false },
        // { id: '10', name: 'a', content: 'And yes', time: new Date(), numberReplies: 3, hasFile: false },
      ],
      loadingData: false,
      refreshingData: false,
      searchingData: false,
      loaingMoreData: false,
      userInfo: {
        name: 'b', content: '', time: new Date(), numberReplies: 0, hasFile: false
      },
      commented: false,
      commentContent: EMPTY_STRING
      // userId: this.props.userInfo.ID,
      // taskId: this.props.navigation.state.params.taskId,
      // taskType: this.props.navigation.state.params.taskType,
    }
  }

  componentWillMount() {
    this.keyboardWillShowSub = Keyboard.addListener('keyboardWillShow', this.keyboardWillShow);
    this.keyboardWillHideSub = Keyboard.addListener('keyboardWillHide', this.keyboardWillHide);
  }

  componentWillUnmount() {
    this.keyboardWillShowSub.remove();
    this.keyboardWillHideSub.remove();
  }

  keyboardWillShow = (event) => {
    this.setState({
      footerView: 1
    })
  };

  keyboardWillHide = (event) => {
    this.setState({
      footerView: 0
    })
  };

  navigateBackToDetail = () => {
    this.props.navigation.navigate('DetailTaskScreen', {
      // taskId: this.state.taskId,
      // taskType: this.state.taskType
    });
  }

  renderViewMore(onPress) {
    return (
      <Text onPress={onPress} style={ListCommentStyle.boldText}>Xem thêm</Text>
    )
  }

  renderViewLess(onPress) {
    return (
      <Text onPress={onPress} style={ListCommentStyle.boldText}>Ẩn bớt</Text>
    )
  }

  renderItem = ({ item }) => {
    const numberOfReplies = item.numberReplies > 0
      ? <Text style={{ color: Colors.BLUE_PANTONE_640C, fontWeight: 'bold' }}>Trả lời({item.numberReplies})</Text>
      : <Text style={{ color: Colors.BLUE_PANTONE_640C }}>Trả lời</Text>;
    return (
      <View>
        <View style={ListCommentStyle.commentContainer}>
          <View style={{ flexDirection: 'row' }}>
            <View style={{ flex: 1 }}>
              <Image
                style={ListCommentStyle.userAvatar}
              />
            </View>
            <View style={[{ flex: 4 }, ListCommentStyle.userContent]}>
              <Text style={ListCommentStyle.userFullname}>{item.name}</Text>
              <ViewMoreText
                numberOfLines={3}
                renderViewMore={this.renderViewMore}
                renderViewLess={this.renderViewLess}
              >
                <Text style={ListCommentStyle.normalText}>{item.content}</Text>
              </ViewMoreText>
            </View>
          </View>
          <View style={{ flexDirection: 'column' }}>
            <Text style={ListCommentStyle.userTimeCheck}>{convertDateTimeToString(item.time)}</Text>
            <TouchableOpacity 
              onPress={() => this.props.navigation.navigate('ReplyCommentScreen', 
              { userName: item.name, userContent: item.content, userTimeComment: item.time })} 
              style={{ alignSelf: 'center' }}
            >
              {numberOfReplies}
            </TouchableOpacity>
          </View>
        </View>
        <View style={ListCommentStyle.separator}></View>
      </View>
    )
  }

  onLoadingMore() {
    this.setState({
      loadingMoreData: true,
      pageIndex: this.state.pageIndex + 1
    }, () => {
      this.fetchData();
    })
  }

  sendComment = () => {


    this.setState({
      data: this.state.data.concat(
        [
          {
            id: this.state.data.length + 1,
            name: this.state.userInfo.name,
            content: this.state.commentValue,
            time: convertDateTimeToString(new Date()),
            numberReplies: 0,
            hasFile: false,
          }
        ]
      ),
      commentValue: EMPTY_STRING,
    })
    console.log(this.state.data);
  }
  render() {
    return (
      <Container>
        <Header style={{ backgroundColor: Colors.RED_PANTONE_186C }}>
          <Left style={{ flex: 1 }}>
            <Button transparent onPress={this.navigateBackToDetail}>
              <Icon name='ios-arrow-round-back' size={moderateScale(40)} color={Colors.WHITE} type='ionicon' />
            </Button>
          </Left>

          <Body style={{ flex: 3 }}>
            <Title style={{ color: '#fff', fontWeight: 'bold' }}>
              BÌNH LUẬN
            </Title>
          </Body>

          <Right style={{ flex: 1 }} />
        </Header>

        <Content contentContainerStyle={{ flex: 1 }}>
          <FlatList
            data={this.state.data}
            renderItem={this.renderItem}
            keyExtractor={(item, index) => index.toString()}
            refreshControl={
              <RefreshControl
                refreshing={this.state.refreshingData}
                onRefresh={this.handleRefresh}
                title='Kéo để làm mới'
                colors={[Colors.BLUE_PANTONE_640C]}
                tintColor={[Colors.BLUE_PANTONE_640C]}
                titleColor={Colors.RED}
              />
            }
            ListFooterComponent={
              this.state.loadingMoreData ?
                <ActivityIndicator size={indicatorResponsive} animating color={Colors.BLUE_PANTONE_640C} /> :
                (
                  this.state.data.length >= DEFAULT_PAGE_SIZE ?
                    <Button full style={{ backgroundColor: Colors.BLUE_PANTONE_640C }} onPress={() => this.onLoadingMore()}>
                      <Text>
                        TẢI THÊM
                      </Text>
                    </Button>
                    : null
                )
            }

            ListEmptyComponent={() => emptyDataPage()}
          />
        </Content>

        <Footer style={{ flex: this.state.footerView, justifyContent: 'space-around', flexDirection: 'row', alignSelf: 'stretch' }}>
          <Input style={{ marginLeft: 20 }} placeholder='Gửi bình luận' value={this.state.commentValue} onChangeText={(commentValue) => this.setState({ commentValue })} />
          <Button transparent onPress={this.sendComment} style={{ marginRight: 20 }}>
            <Icon name='md-send' size={moderateScale(40)} color={Colors.BLACK} type='ionicon' />
          </Button>
        </Footer>
      </Container>
    )
  }
}