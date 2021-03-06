/**
* @description: thanh điều hướng của toàn ứng dụng
* @author: duynn
* @since: 03/05/2018
*/
'use strict'
import React, { Component } from 'react';
import { width } from '../../common/SystemConstant';
import { DrawerNavigator, SwitchNavigator, StackNavigator } from 'react-navigation';
//màn hình văn bản trình ký
import ListIsNotProcessed from '../modules/SignDoc/ListIsNotProcessed';
import ListIsNotReviewed from '../modules/SignDoc/ListIsNotReviewed';
import ListIsProcessed from '../modules/SignDoc/ListIsProcessed';
import ListIsReviewed from '../modules/SignDoc/ListIsReviewed';
import DetailSignDoc from '../modules/SignDoc/DetailSignDoc';
import ListFilterSignDoc from '../modules/SignDoc/ListFilterSignDoc';

//màn hình văn bản phát hành
import ListIsPublished from '../modules/PublishDoc/ListIsPublished';
import ListFilterPublishDoc from '../modules/PublishDoc/ListFilterPublishDoc';
import DetailPublishDoc from '../modules/PublishDoc/DetailPublishDoc';

//màn hình công việc
import ListAssignedTask from '../modules/Task/ListAssignedTask';
import ListCombinationTask from '../modules/Task/ListCombinationTask';
import ListPersonalTask from '../modules/Task/ListPersonalTask';
import ListProcessedTask from '../modules/Task/ListProcessedTask';
import ListFilterTask from '../modules/Task/ListFilterTask';
import DetailTask from '../modules/Task/DetailTask';
import AssignTask from '../modules/Task/AssignTask';
import AssignTaskUsers from '../modules/Task/AssignTaskUsers';
import RescheduleTask from '../modules/Task/RescheduleTask';
import UpdateProgressTask from '../modules/Task/UpdateProgressTask';
import ApproveProgressTask from '../modules/Task/ApproveProgressTask';
import EvaluationTask from '../modules/Task/EvaluationTask';
import HistoryRescheduleTask from '../modules/Task/HistoryRescheduleTask';
import HistoryProgressTask from '../modules/Task/HistoryProgressTask';
import ApproveEvaluationTask from '../modules/Task/ApproveEvaluationTask';
import CreateSubTask from '../modules/Task/CreateSubTask';
import HistoryEvaluateTask from '../modules/Task/HistoryEvaluateTask';
import GroupSubTask from '../modules/Task/GroupSubTask';
import ApproveRescheduleTask from '../modules/Task/ApproveRescheduleTask';
import DenyRescheduleTask from '../modules/Task/DenyRescheduleTask';


//đăng nhập + đăng ký + truy vấn tài khoản
import Login from '../modules/User/Login';
import Signup from '../modules/User/Signup';
import AccountInfo from '../modules/User/AccountInfo';
import AccountEditor from '../modules/User/AccountEditor';
import AccountChangePassword from '../modules/User/AccountChangePassword';

import Loading from '../common/Loading';
//sidebar
import SideBar from './SideBar';

//màn hình luồng xử lý công việc
import WorkflowReplyReview from '../modules/Workflow/WorkflowReplyReview';
import WorkflowRequestReview from '../modules/Workflow/WorkflowRequestReview';
import WorkflowStreamProcess from '../modules/Workflow/WorkflowStreamProcess';
import WorkflowStreamProcessUsers from '../modules/Workflow/WorkflowStreamProcessUsers';
import WorkflowRequestReviewUsers from '../modules/Workflow/WorkflowRequestReviewUsers';

//comment
import ListComment from '../modules/Comment/ListComment';
import ReplyComment from '../modules/Comment/ReplyComment';

//chat
// import ListChatter from '../modules/Chat/ListChatter';
// import Chatter from '../modules/Chat/Chatter';
// import DetailChatter from '../modules/Chat/DetailChatter';

const appRoutes = {
    ListIsNotProcessedScreen: {
        screen: ListIsNotProcessed
    },
    ListIsNotReviewedScreen: {
        screen: ListIsNotReviewed
    },
    ListIsProcessedScreen: {
        screen: ListIsProcessed
    },
    ListIsReviewedScreen: {
        screen: ListIsReviewed
    },
    DetailSignDocScreen: {
        screen: DetailSignDoc
    },
    ListFilterSignDocScreen: {
        screen: ListFilterSignDoc
    },
    ListIsPublishedScreen: {
        screen: ListIsPublished
    },
    DetailPublishDocScreen: {
        screen: DetailPublishDoc
    }, ListFilterPublishDocScreen: {
        screen: ListFilterPublishDoc
    },
    ListAssignedTaskScreen: {
        screen: ListAssignedTask
    },
    ListCombinationTaskScreen: {
        screen: ListCombinationTask
    },
    ListPersonalTaskScreen: {
        screen: ListPersonalTask
    },
    ListProcessedTaskScreen: {
        screen: ListProcessedTask
    },
    ListFilterTaskScreen: {
        screen: ListFilterTask
    },
    DetailTaskScreen: {
        screen: DetailTask
    },
    AssignTaskScreen: {
        screen: AssignTask
    }, AssignTaskUsersScreen: {
        screen: AssignTaskUsers
    },
    RescheduleTaskScreen: {
        screen: RescheduleTask
    },
    UpdateProgressTaskScreen: {
        screen: UpdateProgressTask
    },
    ApproveProgressTaskScreen: {
        screen: ApproveProgressTask
    },
    EvaluationTaskScreen: {
        screen: EvaluationTask
    },
    HistoryEvaluateTaskScreen: {
        screen: HistoryEvaluateTask
    },
    ApproveEvaluationTaskScreen: {
        screen: ApproveEvaluationTask
    },
    HistoryRescheduleTaskScreen: {
        screen: HistoryRescheduleTask
    },
    HistoryProgressTaskScreen: {
        screen: HistoryProgressTask
    },
    GroupSubTaskScreen: {
        screen: GroupSubTask
    },
    CreateSubTaskScreen: {
        screen: CreateSubTask
    },
    WorkflowReplyReviewScreen: {
        screen: WorkflowReplyReview
    },
    WorkflowRequestReviewScreen: {
        screen: WorkflowRequestReview
    },
    WorkflowStreamProcessScreen: {
        screen: WorkflowStreamProcess
    },
    WorkflowRequestReviewUsersScreen: {
        screen: WorkflowRequestReviewUsers
    },
    WorkflowStreamProcessUsersScreen: {
        screen: WorkflowStreamProcessUsers
    },
    ListCommentScreen: {
        screen: ListComment
    },
    ReplyCommentScreen: {
        screen: ReplyComment
    }, ApproveRescheduleTaskScreen: {
        screen: ApproveRescheduleTask
    }, DenyRescheduleTaskScreen: {
        screen: DenyRescheduleTask
    },
    AccountInfoScreen: {
        screen: AccountInfo
    }, AccountEditorScreen: {
        screen: AccountEditor
    }, AccountChangePasswordScreen: {
        screen: AccountChangePassword
    },
    // ListChatterScreen: {
    //     screen: ListChatter
    // }, ChatterScreen: {
    //     screen: Chatter
    // }, 
    // DetailChatterScreen: {
    //     screen: DetailChatter
    // }
}
const appConfig = {
    headerMode: 'none',
    initialRouteName: 'ListAssignedTaskScreen',
    //initialRouteName: 'ListChatterScreen',
    drawerWidth: width * 0.8,
    contentComponent: props => <SideBar {...props} />
}
const AppStack = DrawerNavigator(appRoutes, appConfig);

const authRoutes = {
    LoginScreen: {
        screen: Login
    },
    SignupScreen: {
        screen: Signup
    }
}
const authConfig = {
    headerMode: 'none',
}
const AuthStack = StackNavigator(authRoutes, authConfig);

export const CommonDrawerNavigator = SwitchNavigator({
    LoadingScreen: {
        screen: Loading
    },
    Auth: AuthStack,
    App: AppStack

}, {
        initialRouteName: 'LoadingScreen'
    });