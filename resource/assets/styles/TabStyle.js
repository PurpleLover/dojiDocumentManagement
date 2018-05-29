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
        color: '#FF0033',
        fontWeight: 'bold'
    }, inActiveTab: {
        backgroundColor: '#fff'
    }, inActiveText: {
        color: '#FF0033'
    }, underLineStyle: {
        borderBottomWidth: 4,
        borderBottomColor: '#FF0033'
    }
});