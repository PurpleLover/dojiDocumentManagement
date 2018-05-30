/*
    @description: duyệt đánh giá công việc
    @author: duynn
    @since: 17/05/2018
*/
'use strict'
import React, { Component } from 'react';
import { StyleSheet } from 'react-native';

//redux
import { connect } from 'react-redux';

//lib
import {
    Container, Header, Toast 
} from 'native-base';
import {
    Icon as RneIcon
} from 'react-native-elements';
import * as util from 'lodash';

//utilities
import { API_URL, EMPTY_STRING, HEADER_COLOR } from '../../../common/SystemConstant';
import { asyncDelay } from '../../../common/Utilities';

//firebase
import { pushFirebaseNotify } from '../../../firebase/FireBaseClient';

class ApproveEvaluationTask extends Component {
    constructor(props){
        super(props);
        
        this.state = {
            userId: this.props.userInfo.ID,

            taskId: this.props.navigation.state.params.taskId,
            taskType: this.props.navigation.state.params.taskType,
            comment: EMPTY_STRING,

            PhieuDanhGia: this.props.navigation.state.params.PhieuDanhGia,
            executing: false,
        
            TUCHU_CAO: 0,
            TRACHNHIEM_LON: 0,
            TUONGTAC_TOT: 0,
            TOCDO_NHANH: 0,
            TIENBO_NHIEU: 0,
            THANHTICH_VUOT: 0
        }
    }

    componentWillMount() {
        const phieuDanhGia = this.state.PhieuDanhGia;

        this.setState({
            TUCHU_CAO: phieuDanhGia.TDG_TUCHUCAO != null ? phieuDanhGia.toString() : '0',
            TRACHNHIEM_LON: phieuDanhGia.TDG_TRACHNHIEMLON != null ? phieuDanhGia.TDG_TRACHNHIEMLON.toString() : '0',
            TUONGTAC_TOT: phieuDanhGia.TDG_TUONGTACTOT != null ?  phieuDanhGia.TDG_TUONGTACTOT.toString() : '0',
            TOCDO_NHANH: phieuDanhGia.TDG_TOCDONHANH != null ? phieuDanhGia.TDG_TOCDONHANH.toString() : '0',
            TIENBO_NHIEU: phieuDanhGia.TDG_TIENBONHIEU != null ? phieuDanhGia.TDG_TIENBONHIEU.toString() : '0',
            THANHTICH_VUOT: phieuDanhGia.TDG_THANHTICHVUOT != null ? phieuDanhGia.TDG_THANHTICHVUOT.toString() : '0'
        });
    }

    onValueChange(value, type){
        switch(type){
            case 'TUCHU_CAO':
                this.setState({
                    TUCHU_CAO: value
                })
            break;

            case 'TRACHNHIEM_LON':
                this.setState({
                    TRACHNHIEM_LON: value
                })
            break;

            case 'TUONGTAC_TOT':
                this.setState({
                    TUONGTAC_TOT: value
                })
            break;

            case 'TOCDO_NHANH':
                this.setState({
                    TOCDO_NHANH: value
                })
            break;

            case 'TIENBO_NHIEU':
                this.setState({
                    TIENBO_NHIEU: value
                })
            break;

            default:
                 this.setState({
                    THANHTICH_VUOT: value
                })
            break;
        }
    }

    onApproveEvaluateTask = async () => {
        this.setState({
            executingLoading: true
        })
        const url = `${API_URL}/api/HscvCongViec/ApproveEvaluationTask`;
        const headers = new Headers({
            'Accept': 'application/json',
            'Content-Type': 'application/json; charset=utf-8',
        });

        const body = JSON.stringify({
                userId: this.state.userId,
                taskId: this.state.taskId,
                comment: this.state.comment,
                TUCHU_CAO: this.state.TUCHU_CAO == EMPTY_STRING ? 0 : this.state.TUCHU_CAO,
                TRACHNHIEM_LON: this.state.TRACHNHIEM_LON == EMPTY_STRING ? 0 : this.state.TRACHNHIEM_LON,
                TUONGTAC_TOT: this.state.TUONGTAC_TOT == EMPTY_STRING ? 0 : this.state.TUONGTAC_TOT,
                TOCDO_NHANH: this.state.TOCDO_NHANH == EMPTY_STRING ? 0 : this.state.TOCDO_NHANH,
                TIENBO_NHIEU: this.state.TIENBO_NHIEU == EMPTY_STRING ? 0 : this.state.TIENBO_NHIEU,
                THANHTICH_VUOT: this.state.THANHTICH_VUOT == EMPTY_STRING ? 0 : this.state.THANHTICH_VUOT
        });

        const result = await fetch(url, {
            method: 'POST',
            headers,
            body
        });

        const resultJson = await result.json();
        

        await asyncDelay(2000);

        this.setState({
            executing: false
        });

        if(resultJson.Status == true && !util.isNull(resultJson.GroupTokens) && !util.isEmpty(resultJson.GroupTokens)){
            const message = this.props.userInfo.Fullname + ' đã phê duyệt bản đánh giá công việc';
            const content = {
                title: 'PHÊ DUYỆT ĐÁNH GIÁ CÔNG VIỆC',
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

        Toast.show({
            text: resultJson.Status ? 'Phê duyệt đánh giá công việc thành công' : 'Phê duyệt đánh giá công việc không thành công',
            type: resultJson.Status ? 'success' : 'danger',
            buttonText: "OK",
            buttonStyle: { backgroundColor: '#fff' },
            buttonTextStyle: { color: resultJson.Status ? '#337321' :'#FF0033'},
            duration: 3000,
            onClose: ()=> {
                if(resultJson.Status){
                    this.navigateBackToDetail();
                }
            }
        });
    }


    navigateBackToDetail(){
        this.props.navigation.navigate('DetailTaskScreen', {
            taskId: this.state.taskId,
            taskType: this.state.taskType
        });
    }

    
    render(){
        return(
        );
    }
}

const mapStateToProps = (state) => {
    return {
        userInfo: state.userState.userInfo
    }
}

export default connect(mapStateToProps)(ApproveEvaluationTask)