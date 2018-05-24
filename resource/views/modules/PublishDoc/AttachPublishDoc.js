/**
 * @description: tài liệu đính kèm văn bản phát hành
 * @author: duynn
 * @since: 09/05/2018
 */
'use strict'
import React, { Component } from 'react'
import {
    Platform, Alert,
    View, Text, Image, ScrollView, FlatList,
    TouchableOpacity, RefreshControl, ActivityIndicator
} from 'react-native'

//lib
import { List, ListItem, Icon } from 'react-native-elements';
import RNFetchBlob from 'react-native-fetch-blob';

//styles
import { ListPublishDocStyle, DetailPublishDocStyle } from '../../../assets/styles/PublishDocStyle';

import { EMPTY_DATA_ICON_URI, EMTPY_DATA_MESSAGE, WEB_URL } from '../../../common/SystemConstant';

//utilities
import { formatLongText, isImage } from '../../../common/Utilities';

const android = RNFetchBlob.android;

export default class AttachPublishDoc extends Component {

    constructor(props) {
        super(props);
        this.state = {
            attachments: props.info
        }
    }

    renderItem = ({ item }) => (
        <ListItem
            leftIcon={
                <View style={[ListPublishDocStyle.leftSize, {
                    marginRight: 10
                }]}>
                    <Icon name='ios-attach-outline' size={26} type='ionicon' style={ListPublishDocStyle.leftIcon} />
                </View>
            }

            rightIcon={
                <View style={ListPublishDocStyle.rightSize}>
                    <TouchableOpacity onPress={() => this.downloadFile(item.TENTAILIEU, item.DUONGDAN_FILE, item.DINHDANG_FILE)}>
                        <Icon name='download' size={26} color={'#005aab'} type="entypo" />
                    </TouchableOpacity>
                </View>
            }
            title={formatLongText(item.TENTAILIEU)}
            titleStyle={{
                color: 'black',
                fontWeight: 'bold'
            }}
        />
    );

    downloadFile(fileName, fileLink, fileExtension) {
        try {
            fileLink = WEB_URL + fileLink;
            fileLink = fileLink.replace('////', '/');

            fileLink = fileLink.replace(/ /g,"%20");
            
            RNFetchBlob.config({
                fileCache : true,
                addAndroidDownloads: {
                    notification: true,
                    mediaScannable: true,
                    title: fileName,
                    mime: fileExtension,
                    description: 'Tải tài liệu đính kèm của văn bản đến'
                }
            }).fetch('GET', fileLink)
                .then((response) => {
                    //kiểm tra platform nếu là android và file là ảnh
                    if (Platform.OS == 'android' && isImage(fileExtension)) {
                        android.actionViewIntent(response.path(), fileExtension);
                    }
                    response.path();
                }).catch((errr) => {
                    Alert.alert({
                        'title': 'THÔNG BÁO',
                        'message': 'KHÔNG THỂ TẢI ĐƯỢC FILE',
                        buttons: [
                            {
                                text: 'OK',
                                onPress: () => { console.log('close alert') }
                            }
                        ]
                    })
                });
        } catch (err) {
            Alert.alert({
                'title': 'THÔNG BÁO',
                'message': `Lỗi: ${err.toString()}`,
                buttons: [
                    {
                        text: 'OK',
                        onPress: () => { console.log('close alert') }
                    }
                ]
            })
        }
    }

    render() {
        return (
            <View style={DetailPublishDocStyle.container}>
                <ScrollView>
                    <FlatList
                        keyExtractor={(item, index) => index.toString()}
                        data={this.state.attachments}
                        renderItem={this.renderItem}
                        ListEmptyComponent={() =>
                            this.state.loading ? null : (
                                <View style={ListPublishDocStyle.emtpyContainer}>
                                    <Image source={EMPTY_DATA_ICON_URI} style={ListPublishDocStyle.emptyIcon} />
                                    <Text style={ListPublishDocStyle.emptyMessage}>
                                        {EMTPY_DATA_MESSAGE}
                                    </Text>
                                </View>
                            )
                        }
                    />
                </ScrollView>
            </View>
        );
    }
}
