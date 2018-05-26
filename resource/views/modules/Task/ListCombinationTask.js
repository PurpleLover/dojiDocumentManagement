/**
 * @description: danh sách công việc phối hợp
 * @author: duynn
 * @since: 10/05/2018
 */
'use strict'
/**
 * @description: danh sách công việc được giao
 * @author: duynn
 * @since: 10/05/2018
 */
'use strict'
import React, { Component } from 'react';
import BaseTaskList from './BaseTaskList';

export default class ListPersonalTask extends Component {

    render() {
        return (
            <BaseTaskList type={3} navigator={this.props.navigation} />
        )
    }
}