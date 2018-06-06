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

export default class ReplyComment extends Component {
  constructor(props) {
    super(props);
    this.state = {
      replyValue: EMPTY_STRING,
      footerView: 0, //comment input

      data: [
        { id: '1', name: 'bc', content: 'And no', time: '03-07-2018', hasFile: false },
        { id: '2', name: 'cb', content: 'And yes', time: '03-07-2018', hasFile: false },
        { id: '3', name: 'bcc', content: 'And yes', time: '03-07-2018', hasFile: false },
      ],
      loadingData: false,
      refreshingData: false,
      searchingData: false,
      loaingMoreData: false,

      userName: this.props.navigation.state.params.userName,
      userContent: this.props.navigation.state.params.userContent,
      userTimeComment: this.props.navigation.state.params.userTimeComment,
      // userId: this.props.userInfo.ID,
      // taskId: this.props.navigation.state.params.taskId,
      // taskType: this.props.navigation.state.params.taskType,

      userInfo: {
        name: 'An'
      }
    };
    console.log(props.userName)
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
    this.props.navigation.navigate('ListCommentScreen', {
      // taskId: this.state.taskId,
      // taskType: this.state.taskType
    });
  }

  sendReply = () => {
    this.setState({
      data: this.state.data.concat(
        [
          {
            id: this.state.data.length + 1,
            name: this.state.userInfo.name,
            content: this.state.replyValue,
            time: new Date(),
            hasFile: false,
          }
        ]
      ),
      replyValue: EMPTY_STRING,
    })
  }

  renderItem = ({ item }) => {
    return (
      <View>
        <View style={{ flexDirection: 'column', padding: 10, marginLeft: 20 }}>
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
          <Text style={{alignSelf:'flex-end', fontSize:12}}>{item.time}</Text>
        </View>
        <View style={{ borderBottomWidth: 1, borderBottomColor: 'lightgrey', marginTop: 10 }}></View>
      </View>
    )
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
              TRẢ LỜI
        </Title>
          </Body>

          <Right style={{ flex: 1 }} />
        </Header>
        <Content>
          <View>
            <View style={{ flexDirection: 'column', padding: 20 }}>
              <View style={{ flexDirection: 'row' }}>
                <View style={{ flex: 1 }}>
                  <Image
                    style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'grey' }}
                  />
                </View>
                <View style={{ flex: 4, borderRadius: 3, backgroundColor: 'lightgrey', flexDirection: 'column' }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 18 }}>{this.state.userName}</Text>
                  <Text style={{ fontSize: 14 }}>{this.state.userContent}</Text>
                </View>
              </View>
      <Text style={{fontSize:12, alignSelf:'flex-end'}}>{this.state.userTimeComment}</Text>
            </View>
            <View style={{ borderBottomWidth: 1, borderBottomColor: 'lightgrey', marginTop: 10 }}></View>
          </View>
          <FlatList
            data={this.state.data}
            renderItem={this.renderItem}
            keyExtractor={(item, index) => index.toString()}
          />
        </Content>
        <Footer style={{ flex: this.state.footerView, justifyContent: 'space-around', flexDirection: 'row', alignSelf: 'stretch' }}>
          <Input style={{ marginLeft: 20 }} placeholder='Gửi trả lời' value={this.state.replyValue} onChangeText={(replyValue) => this.setState({ replyValue })} />
          <Button transparent onPress={this.sendReply} style={{ marginRight: 20 }}>
            <Icon name='md-send' size={moderateScale(40)} color={Colors.BLACK} type='ionicon' />
          </Button>
        </Footer>
      </Container>

    )
  }
}