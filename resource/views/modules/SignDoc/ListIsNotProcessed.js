/**
 * @description: danh sách văn bản trình ký chưa xử lý
 * @author: duynn
 * @since: 02/05/2018
 */
'use strict'
import React, { Component } from 'react';
import BaseSignDocList from './BaseSignDocList';

export default class ListIsNotProcessed extends Component {

    render() {
        return (
            <BaseSignDocList type={1} navigator={this.props.navigation} />
        )
    }
}