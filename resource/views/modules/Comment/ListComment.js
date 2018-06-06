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

export default class ListComment extends Component {
  constructor(props) {
    super(props);
    this.state = {
      commentValue: EMPTY_STRING,
      footerView: 0, //comment input

      data: [
        { id: '1', name: 'acccccc', content: 'And yes', time: '03-07-2018', numberReplies: 3, hasFile: false },
        { id: '2', name: 'a', content: 'And yes', time: '03-07-2018', numberReplies: 3, hasFile: false },
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

  renderItem = ({ item }) => {
    const numberOfReplies = item.numberReplies > 0 ? `(${item.numberReplies})` : null;
    return (
      <View>
        <View style={{ flexDirection: 'column', padding: 10 }}>
          <View style={{ flexDirection: 'row' }}>
            <View style={{ flex: 1 }}>
              <Image
                style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'grey' }}
              />
            </View>
            <View style={{ flex: 4, borderRadius: 3, backgroundColor: 'lightgrey', flexDirection: 'column' }}>
              <Text style={{ fontWeight: 'bold', fontSize: 18 }}>{item.name}</Text>
              <Text style={{ fontSize: 14 }}>{item.content}</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'column' }}>
            <Text style={{ alignSelf: 'flex-end', fontSize: 12 }}>{convertDateTimeToString(item.time)}</Text>
            <TouchableOpacity onPress={() => this.props.navigation.navigate('ReplyCommentScreen', { userName: item.name, userContent: item.content, userTimeComment: item.time })} style={{ alignSelf: 'center' }}>
              <Text style={{ color: 'blue' }}>Reply{numberOfReplies}</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ borderBottomWidth: 1, borderBottomColor: 'lightgrey', marginTop: 10 }}></View>
      </View>
    )
  }

  // onOpenReply = () => {
  //   this.props.navigation.navigate('ReplyCommentScreen', {
  //     userName: item.item.name,
  //   });
  // }

  sendComment = () => {


    this.setState({
      data: this.state.data.concat(
        [
          {
            id: this.state.data.length + 1,
            name: this.state.userInfo.name,
            content: this.state.commentValue,
            time: new Date(),
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