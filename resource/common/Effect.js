/**
 * @description: các hàm tạo hiệu ứng
 * @author: duynn
 * @since: 04/05/2018
 */
import React, { Component } from 'react';
import { Text, View, Modal, ActivityIndicator, StyleSheet } from 'react-native';
import {indicatorResponsive} from '../assets/styles/ScaleIndicator';

export function authenticateLoading(isVisible) {
    return (
        <Modal onRequestClose={() => { }}
            animationTyal='fade'
            transparent={true}
            visible={isVisible}>
            <View style={[styles.alContainer, { backgroundColor: 'rgba(52, 52, 52, 0.8)' }]}>
                <View style={styles.alBorderBlock}>
                    <ActivityIndicator size={indicatorResponsive} color={'#fff'} />
                    <Text style={styles.alText}>
                        ...Đang xác thực
                    </Text>
                </View>
            </View>
        </Modal>
    )
}


export function executeLoading(isVisible) {
    return (
        <Modal onRequestClose={() => { }}
            animationTyal='fade'
            transparent={true}
            visible={isVisible}>
            <View style={[styles.alContainer, { backgroundColor: 'rgba(52, 52, 52, 0.8)' }]}>
                <View style={styles.alExecuteBorderBlock}>
                    <ActivityIndicator size={indicatorResponsive} color={'#F7A30A'} />
                    <Text style={styles.alExecuteText}>
                        ...Đang xử lý
                    </Text>
                </View>
            </View>
        </Modal>
    )
}

export function dataLoading(isVisible) {
    return (
        <View style={styles.alContainer}>
            <ActivityIndicator size={indicatorResponsive} color={'#337321'} />
        </View>
    )
}

const styles = StyleSheet.create({
    alContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff'
        // backgroundColor: 'rgba(52, 52, 52, 0.8)'
    },
    alBorderBlock: {
        backgroundColor: '#da2032',
        width: 200,
        height: 100,
        borderRadius: 3,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-around'
    }, alText: {
        marginTop: 10,
        fontSize: 14,
        color: '#fff'
    },alExecuteText: {
        marginTop: 10,
        fontSize: 14,
        color: '#F7A30A'
    },alExecuteBorderBlock:{
        backgroundColor: '#fff',
        width: 200,
        height: 100,
        borderRadius: 3,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-around'
    }
});