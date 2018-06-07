import { StyleSheet } from 'react-native';
import { Colors } from '../../common/SystemConstant';
import { scale, verticalScale, moderateScale } from './ScaleIndicator';

export const ListCommentStyle = StyleSheet.create({
  commentContainer: {
    padding: moderateScale(10),
  },
  userAvatar: {
  },
  commentAvatarContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start'
  },
  commentAvatar: {
    backgroundColor: Colors.BLUE_PANTONE_640C,
    borderRadius: 5,
    height: verticalScale(60),
    width: '100%'
  },
  commentContentContainer: {
    flex: 4,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    paddingHorizontal: moderateScale(5),
  },
  commentUserName: {
    fontSize: moderateScale(15, 1.5),
    fontWeight: 'bold',
    color: Colors.BLACK
  },
  commentContent: {
    fontSize: moderateScale(11, 1.2),
    color: Colors.BLACK
  },
  boldText: {
    fontSize: moderateScale(14, 1.2),
    fontWeight: 'bold',
  },
  commentTime: {
    alignItems: 'center',
    fontSize: moderateScale(12, 1.1)
  },
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: 'lightgrey',
  },
  subInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  }, replyButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  }, replyButtonText: {
    color: Colors.BLUE_PANTONE_640C
  }, replyCommentContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start'
  }, replyCommentText: {
    fontWeight: 'bold',
    color: Colors.BLACK
  }
});

export const ReplyCommentStyle = StyleSheet.create({
  replyCommentContainer: {
    padding: moderateScale(10),
  },
  replyObjectContainer: {
    marginBottom: moderateScale(10),
    paddingBottom: moderateScale(10),
  },
  replyObjectHeader: {
    height: verticalScale(60),
    flexDirection: 'row'
  },
  replyObjectAvatarContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start'
  },
  replyObjectAvatar: {
    backgroundColor: Colors.BLUE_PANTONE_640C,
    borderRadius: 5,
    height: verticalScale(60),
    width: '100%'
  },
  replyObjectUserContainer: {
    flex: 4,
    flexDirection: 'column',
    justifyContent: 'center',
    paddingHorizontal: moderateScale(10),
  },
  replyObjectContent: {
    marginTop: verticalScale(10)
  },
  replyObjectTime: {
    marginTop: moderateScale(10),
    justifyContent: 'flex-start'
  },
  replyObjectTimeText: {
    fontSize: moderateScale(11, 1.2),
  },
  replyObjectUserText: {
    flexWrap: 'wrap',
    fontWeight: 'bold',
    color: Colors.BLUE_PANTONE_640C,
    fontSize: moderateScale(16, 1.2),
  },
  replyObjectContentText: {
    fontSize: moderateScale(11, 1.2),
    color: Colors.BLACK
  },
  replyListContainer: {
    marginHorizontal: moderateScale(5),
    paddingTop: moderateScale(10),
    borderTopColor: Colors.GRAY,
    borderTopWidth: 1
  }
});