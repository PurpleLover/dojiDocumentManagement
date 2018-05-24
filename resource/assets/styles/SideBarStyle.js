/**
 * @description: định dạng style cho sidebar
 * @author: duynn
 * @since: 05/05/2018
 */
'use strict';
import React, { Component } from 'react';
import { StyleSheet } from 'react-native';

import { scale, verticalScale, moderateScale } from './ScaleIndicator'

export const SideBarStyle = StyleSheet.create({
    container: {
        flex: 1
    },
    header: {
        flex: 1,
    }, headerBackground: {
        flex: 1,
        borderBottomColor: '#d4d4d4',
        borderBottomWidth: 1,
        flexDirection: 'row',
    }, headerAvatarContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingLeft: scale(20),
    }, headerUserInfoContainer: {
        justifyContent: 'center',
        paddingLeft: scale(20),
        alignItems: 'flex-start'
    }, headerAvatar: {
        width: moderateScale(80),
        height: moderateScale(80),
        borderRadius: 50,
        resizeMode: 'stretch',
    }, headerUserName: {
        justifyContent: 'center',
        textAlign: 'center',
        fontWeight: 'bold',
        color: '#000',
        fontSize: moderateScale(16,1.2)
    }, headerUserJob: {
        fontSize: moderateScale(11,1.7),
        fontWeight: 'normal'
    },
    body: {
        flex: 3,
        backgroundColor: '#fff'
    }, listItemTitle: {
        fontWeight: 'bold',
        color: 'black'
    }, listItemContainer: {
        height: verticalScale(60),
        justifyContent: 'center',
        borderBottomColor: '#cccccc',
        backgroundColor: '#fff'
    }, subItemContainer: {
        height: verticalScale(60),
        justifyContent: 'center',
        borderBottomColor: '#cccccc'
    }, listItemSubTitleContainer: {
        color: '#000',
        marginLeft: scale(40)
    }
});
