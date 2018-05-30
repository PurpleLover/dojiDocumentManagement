/**
 * @description: hiệu ứng style của menu
 * @author: duynn
 * @since: 09/05/2018
 */
import React, { Component } from 'react';
import { StyleSheet } from 'react-native';
import {scale, verticalScale, moderateScale} from './ScaleIndicator';

export const MenuStyle = StyleSheet.create({
    wrapper: {
        borderRadius: 5
    }
})

export const MenuOptionStyle = StyleSheet.create({
    wrapper: {
        backgroundColor: '#fff',
        paddingVertical: verticalScale(10),
        borderRadius: 5
    },
    wrapperBorder: {
        borderBottomColor: '#FCC954',
        borderBottomWidth: 1,
    },
    text: {
        color:'#000',
        fontSize: moderateScale(15, 1.45)
    }
});