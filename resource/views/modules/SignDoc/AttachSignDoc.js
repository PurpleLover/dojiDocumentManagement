/**
 * @description: tài liệu đính kèm văn bản trình ký
 * @author: duynn
 * @since: 04/05/2018
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
import { ListSignDocStyle, DetailSignDocStyle } from '../../../assets/styles/SignDocStyle';

import { EMPTY_DATA_ICON_URI, EMTPY_DATA_MESSAGE, WEB_URL } from '../../../common/SystemConstant';

//utilities
import { formatLongText, isImage } from '../../../common/Utilities';

const android = RNFetchBlob.android;

export default class AttachSignDoc extends Component {

    constructor(props) {
        super(props);
        this.state = {
            attachments: props.info
        }
    }

    renderItem = ({ item }) => (
        <ListItem
            leftIcon={
                <View style={[ListSignDocStyle.leftSize, {
                    marginRight: 10
                }]}>
                    <Icon name='ios-attach-outline' size={26} type='ionicon' style={ListSignDocStyle.leftIcon} />
                </View>
            }

            rightIcon={
                <View style={ListSignDocStyle.rightSize}>
                    <TouchableOpacity onPress={() => this.downloadFile(item.TENTAILIEU, item.DUONGDAN_FILE, item.DINHDANG_FILE)}>
                        <Icon name='download' size={26} color={'#337321'} type="entypo" />
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
                  // android only options, these options be a no-op on IOS
                  addAndroidDownloads : {
                    notification : true, // Show notification when response data transmitted
                    title : fileName, // Title of download notification
                    description : 'An image file.', // File description (not notification description)
                    mime : fileExtension,
                    mediaScannable : true, // Make the file scannable  by media scanner
                  }
            }).fetch('GET', fileLink)
                .then((response) => {
                    //kiểm tra platform nếu là android và file là ảnh
                    if (Platform.OS == 'android' && isImage(fileExtension)) {
                        android.actionViewIntent(response.path(), fileExtension);
                    }
                    response.path();
                }).catch((errr) => {
                    Alert.alert(
                        'THÔNG BÁO',
                        'KHÔNG THỂ TẢI ĐƯỢC FILE',
                        [
                            {
                                text: 'OK',
                                onPress: () => { console.log('close alert') }
                            }
                        ]
                    )
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
            <View style={DetailSignDocStyle.container}>
                <ScrollView>
                    <FlatList
                        keyExtractor={(item, index) => index.toString()}
                        data={this.state.attachments}
                        renderItem={this.renderItem}
                        ListEmptyComponent={() =>
                            this.state.loading ? null : (
                                <View style={ListSignDocStyle.emtpyContainer}>
                                    <Image source={EMPTY_DATA_ICON_URI} style={ListSignDocStyle.emptyIcon} />
                                    <Text style={ListSignDocStyle.emptyMessage}>
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
