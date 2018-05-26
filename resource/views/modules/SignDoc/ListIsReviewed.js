/**
 * @description: danh sách văn bản trình ký đã review
 * @author: duynn
 * @since: 02/05/2018
 */
'use strict'
import React, { Component } from 'react';
import BaseSignDocList from './BaseSignDocList';

export default class ListIsProcessed extends Component {

    render() {
        return (
            <BaseSignDocList type={4} navigator={this.props.navigation} />
        )
    }
}