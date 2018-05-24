/**
 * @description: định dạng style cho sidebar
 * @author: duynn
 * @since: 05/05/2018
 */
'use strict';
import React, { Component } from 'react';
import { StyleSheet } from 'react-native';

export const SideBarStyle = StyleSheet.create({
    container: {
        flex: 1
    }, 
    header: {
        flex: 1,
    },headerBackground: {
        flex: 1,
        borderBottomColor: '#d4d4d4',
        borderBottomWidth: 1,
        flexDirection: 'row',
    },headerAvatarContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingLeft: 20,
    },headerUserInfoContainer: {
        justifyContent: 'center',
        paddingLeft: 20,
        alignItems: 'flex-start'
    },headerAvatar: {
        width: 80,
        height: 80,
        borderRadius: 50,
        resizeMode: 'stretch',
    },headerUserName: {
        justifyContent: 'center',
        textAlign: 'center',
        fontWeight: 'bold',
        color: '#000',
        fontSize: 16
    },headerUserJob: {
        fontSize: 11,
        fontWeight: 'normal'
    },
    body: {
        flex: 3,
        backgroundColor: '#fff'
    },listItemTitle: {
        fontWeight: 'bold',
        color: 'black'
    },listItemContainer: {
        height: 60,
        justifyContent: 'center',
        borderBottomColor: '#cccccc',
        backgroundColor: '#fff'
    }, subItemContainer: {
        height: 60,
        justifyContent: 'center',
        borderBottomColor: '#cccccc'
    },listItemSubTitleContainer: {
        color: '#000',
        marginLeft: 40
    }
});
