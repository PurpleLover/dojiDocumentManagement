/**
 * @description: danh sách trả lời comment
 * @author: annv
 * @since: 07/06/2018
 */
'use strict'
import React, { Component } from 'react';

//redux
import { connect } from 'react-redux';

//utilities
import {
  API_URL, Colors, DEFAULT_PAGE_INDEX,
  DEFAULT_PAGE_SIZE, EMPTY_STRING,
} from '../../../common/SystemConstant';

//lib
import {
  View, Text, FlatList,
  TouchableOpacity, ScrollView
} from 'react-native';
import {
  Container, Header, Left, Right, Body, Title, Input,
  Button, Content, Icon, Footer, Text as NbText
} from 'native-base';
import renderIf from 'render-if';
import { Icon as RneIcon } from 'react-native-elements';
import * as util from 'lodash';

//styles
import { NativeBaseStyle } from '../../../assets/styles/NativeBaseStyle';
import { ListCommentStyle, ReplyCommentStyle } from '../../../assets/styles/CommentStyle';
import { emptyDataPage, convertDateTimeToString, asyncDelay } from '../../../common/Utilities';
import { scale, verticalScale, moderateScale, indicatorResponsive } from '../../../assets/styles/ScaleIndicator';
import { dataLoading, executeLoading } from '../../../common/Effect';

class ReplyComment extends Component {
  constructor(props) {
    super(props);

    this.state = {
      userId: props.userInfo.ID,
      comment: props.navigation.state.params.comment,
      taskId: props.navigation.state.params.taskId,
      taskType: props.navigation.state.params.taskType,

      footerFlex: 0,
      commentContent: EMPTY_STRING,
      data: [],
      executing: false,
      loading: false,
      refreshing: false,
      loadingMore: false,
      pageIndex: DEFAULT_PAGE_INDEX,
      pageSize: DEFAULT_PAGE_SIZE,
    }
  }

  componentWillMount = () => {
    this.setState({
      loading: true
    }, () => this.fetchData());
  }

  loadingMore = () => {
    this.setState({
      loadingMore: false,
      pageIndex: this.state.pageIndex + 1
    }, () => this.fetchData())
  }

  handleRefresh = () => {
    this.setState({
      pageIndex: DEFAULT_PAGE_SIZE
    }, () => this.fetchData())
  }

  fetchData = async () => {
    const url = `${API_URL}/api/HscvCongViec/GetRepliesOfComment/${this.state.comment.ID}/${this.state.pageIndex}/${this.state.pageSize}`;
    const result = await fetch(url);
    const resultJson = await result.json();

    this.setState({
      loading: false,
      loadingMore: false,
      refreshing: false,
      data: this.state.loadingMore ? [...this.state.data, ...resultJson] : resultJson
    })
  }

  navigateToListComment = () => {
    this.props.navigation.navigate('ListCommentScreen', {
      taskId: this.state.taskId,
      taskType: this.state.taskType
    });
  }

  sendComment = async () => {
    this.setState({
      executing: true
    });

    const url = `${API_URL}/api/HscvCongViec/SaveComment`;
    const headers = new Headers({
      'Accept': 'application/json',
      'Content-Type': 'application/json;charset=utf-8'
    });

    const body = JSON.stringify({
      ID: 0,
      CONGVIEC_ID: this.state.taskId,
      REPLY_ID: this.state.comment.ID,
      USER_ID: this.state.userId,
      NOIDUNG: this.state.commentContent,
      CREATED_BY: this.state.userId
    });

    await asyncDelay(1000);

    const result = await fetch(url, {
      method: 'post',
      headers,
      body
    });

    const resultJson = await result.json();
    if (resultJson.Status == true && !util.isNull(resultJson.GroupTokens) && !util.isEmpty(resultJson.GroupTokens)) {
      const message = this.props.userInfo.Fullname + ' đã đăng trao đổi nội dung công việc #Công việc ' + this.state.taskId;
      const content = {
        title: 'TRAO ĐỔI CÔNG VIỆC',
        message,
        isTaskNotification: true,
        targetScreen: 'DetailTaskScreen',
        targetTaskId: this.state.taskId,
        targetTaskType: this.state.taskType
      }

      resultJson.GroupTokens.forEach(token => {
        pushFirebaseNotify(content, token, 'notification');
      })
    }

    this.setState({
      executing: false
    }, () => this.fetchData());
  }

  renderItem = ({ item }) => {
    return (
      <View>
        <View style={{ flexDirection: 'row', marginTop: verticalScale(10) }}>
          <View style={ListCommentStyle.commentAvatarContainer}>
            <View style={ListCommentStyle.commentAvatar}>
              <RneIcon size={moderateScale(50)} type='ionicon' name='ios-people' color={Colors.WHITE} />
            </View>
          </View>


          <View style={ListCommentStyle.commentContentContainer}>
            <Text style={ListCommentStyle.commentUserName}>{item.FullName}</Text>
            <Text style={ListCommentStyle.commentContent}>
              {item.NOIDUNG}
            </Text>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={ListCommentStyle.commentTime}>
                {convertDateTimeToString(item.NGAYTAO)}
              </Text>
            </View>

            {
              renderIf(item.NUMBER_REPLY > 0)(
                <TouchableOpacity style={ListCommentStyle.replyCommentContainer} onPress={() => this.onReplyComment(item)}>
                  <Text style={ListCommentStyle.replyCommentText}>
                    {'Đã có ' + item.NUMBER_REPLY + ' phản hồi'}
                  </Text>
                </TouchableOpacity>
              )
            }
          </View>
        </View>
      </View >
    )
  }

  render() {
    return (
      <Container>
        <Header style={{ backgroundColor: Colors.RED_PANTONE_186C }}>
          <Left style={NativeBaseStyle.left}>
            <Button transparent onPress={this.navigateToListComment}>
              <RneIcon name='ios-arrow-round-back' size={moderateScale(40)} color={Colors.WHITE} type='ionicon' />
            </Button>
          </Left>

          <Body style={NativeBaseStyle.body}>
            <Title style={NativeBaseStyle.bodyTitle}>
              TRẢ LỜI
          </Title>
          </Body>

          <Right style={NativeBaseStyle.right} />
        </Header>

        <Content contentContainerStyle={{ flex: 1 }}>
          <ScrollView>
            <View style={ReplyCommentStyle.replyCommentContainer}>
              <View style={ReplyCommentStyle.replyObjectContainer}>
                <View style={ReplyCommentStyle.replyObjectHeader}>

                  <View style={ReplyCommentStyle.replyObjectAvatarContainer}>
                    <View style={ReplyCommentStyle.replyObjectAvatar}>
                      <RneIcon size={moderateScale(50)} type='ionicon' name='ios-people' color={Colors.WHITE} />
                    </View>
                  </View>

                  <View style={ReplyCommentStyle.replyObjectUserContainer}>
                    <Text style={ReplyCommentStyle.replyObjectUserText}>
                      {this.state.comment.FullName}
                    </Text>
                  </View>
                </View>

                <View style={ReplyCommentStyle.replyObjectContent}>
                  <Text style={ReplyCommentStyle.replyObjectContentText}>
                    {this.state.comment.NOIDUNG}
                  </Text>
                </View>

                <View style={ReplyCommentStyle.replyObjectTime}>
                  <Text style={ReplyCommentStyle.replyObjectTimeText}>
                    {convertDateTimeToString(this.state.comment.NGAYTAO)}
                  </Text>
                </View>
              </View>
            </View>
            <View style={ReplyCommentStyle.replyListContainer}>
              {
                renderIf(this.state.loading)(
                  dataLoading(true)
                )
              }

              {
                renderIf(!this.state.loading)(
                  <FlatList
                    renderItem={this.renderItem}
                    data={this.state.data}
                    keyExtractor={(item, index) => index.toString()}
                    ListEmptyComponent={() => emptyDataPage()}
                    ListFooterComponent={() => this.state.loadingMore ?
                      <ActivityIndicator size={indicatorResponsive} animating color={Colors.BLUE_PANTONE_640C} /> :
                      (
                        this.state.data.length >= DEFAULT_PAGE_SIZE ?
                          <Button small full style={{ backgroundColor: Colors.BLUE_PANTONE_640C }} onPress={() => this.loadingMore()}>
                            <NbText>
                              TẢI THÊM BÌNH LUẬN
                          </NbText>
                          </Button>
                          : null
                      )
                    }
                  />
                )
              }
            </View>
          </ScrollView>
        </Content>

        <Footer style={{
          flex: this.state.footerFlex,
          justifyContent: 'space-around',
          flexDirection: 'row',
          backgroundColor: Colors.WHITE,
          borderTopWidth: 1,
          borderColor: '#e5e5e5'
        }}>
          <Input style={{ paddingLeft: moderateScale(10) }}
            placeholder='Nhập nội dung trao đổi'
            value={this.state.commentContent}
            onChangeText={(commentContent) => this.setState({ commentContent })} />
          <Button transparent onPress={this.sendComment}>
            <RneIcon name='md-send' size={moderateScale(40)} color={Colors.GRAY} type='ionicon' />
          </Button>
        </Footer>

        {
          executeLoading(this.state.executing)
        }
      </Container>
    )
  }
}

const mapStatToProps = (state) => {
  return {
    userInfo: state.userState.userInfo
  }
}

export default connect(mapStatToProps)(ReplyComment);