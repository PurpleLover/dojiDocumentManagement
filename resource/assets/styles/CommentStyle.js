import {StyleSheet} from 'react-native';
import {scale, verticalScale, moderateScale} from './ScaleIndicator';

export const ListCommentStyle = StyleSheet.create({
  commentContainer: { 
    flexDirection: 'column', 
    padding: moderateScale(10), 
    marginHorizontal: scale(10), 
    marginVertical: verticalScale(10) 
  }, 
  userAvatar: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20), 
    backgroundColor: 'grey' 
  }, 
  userContent: {
    borderRadius: 3, 
    backgroundColor: 'lightgrey', 
    flexDirection: 'column'
  }, userFullname: {
    fontSize: moderateScale(18,1.5),
    fontWeight: 'bold',
  }, 
  normalText: {
    fontSize: moderateScale(14,1.2),
  }, 
  boldText: {
    fontSize: moderateScale(14,1.2),
    fontWeight: 'bold',
  },
  userTimeCheck: {
    alignSelf: 'flex-end', 
    fontSize: moderateScale(12,1.1)
  },
  separator: {
    borderBottomWidth: 1, 
    borderBottomColor: 'lightgrey',
  }
});

export const ReplyCommentStyle = StyleSheet.create({
 replyCommentContainer: {
  flexDirection: 'column', 
  padding: moderateScale(10), 
  marginHorizontal: scale(10), 
  marginVertical: verticalScale(10) 
 }

});