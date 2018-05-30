/**
 * @description: hiệu ứng style của menu
 * @author: duynn
 * @since: 09/05/2018
 */
import React, { Component } from 'react';
import { StyleSheet } from 'react-native';

export const MenuStyle = StyleSheet.create({
    wrapper: {
        borderRadius: 5
    }
})

export const MenuOptionStyle = StyleSheet.create({
    wrapper: {
        backgroundColor: '#fff',
        paddingVertical: 10,
        borderRadius: 5
    },
    wrapperBorder: {
        borderBottomColor: '#fff',
        borderBottomWidth: 1,
    },
    text: {
        color:'#000',
        fontSize: 15
    }
});