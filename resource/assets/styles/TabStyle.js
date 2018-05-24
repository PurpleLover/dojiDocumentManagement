/**
 * @description: định nghĩa style cho tab
 * @author: duynn
 * @since: 09/05/2018
 */
import React, { Component } from 'react'
import { StyleSheet } from 'react-native'

export const TabStyle = StyleSheet.create({
    tabText: {
        fontSize: 10
    },
    activeTab: {
        backgroundColor: '#fff'
    }, activeText: {
        color: '#FF6600',
        fontWeight: 'bold'
    }, inActiveTab: {
        backgroundColor: '#fff'
    }, inActiveText: {
        color: '#FF993B'
    }
});