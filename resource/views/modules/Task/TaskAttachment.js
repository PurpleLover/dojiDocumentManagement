/*
* @description: tài liệu đính kèm công việc
* @author: duynn
* @since: 12/05/2018
*/
'use strict'
import React, { Component } from 'react'
import {
    Platform, Alert, ActivityIndicator,
    View, Text, Image, ScrollView, FlatList,
    TouchableOpacity, RefreshControl
} from 'react-native'

//lib
import renderIf from 'render-if';
import { List, ListItem, Icon as RneIcon } from 'react-native-elements';
import RNFetchBlob from 'react-native-fetch-blob';
import { Container, Content, Header, Item, Input, Icon } from 'native-base';

//styles
import { ListTaskStyle, DetailTaskStyle } from '../../../assets/styles/TaskStyle';

import {
    EMTPY_DATA_MESSAGE, WEB_URL,
    EMPTY_STRING, LOADER_COLOR, API_URL
} from '../../../common/SystemConstant';

//utilities
import { formatLongText, isImage, emptyDataPage, asyncDelay } from '../../../common/Utilities';
import { verticalScale, indicatorResponsive } from '../../../assets/styles/ScaleIndicator';

const android = RNFetchBlob.android;

export default class TaskAttachment extends Component {

    constructor(props) {
        super(props);
        this.state = {
            attachments: props.info.ListTaiLieu,
            searching: false,
            CongViec: props.info.CongViec,
            filterValue: EMPTY_STRING
        }
    }

    async onAttachFilter() {
        this.setState({
            searching: true
        });

        const url = `${API_URL}/api/HscvCongViec/SearchAttachment?id=${this.state.CongViec.ID}&attQuery=${this.state.filterValue}`;

        const result = await fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json; charset=utf-8'
            }
        }).then(response => response.json())
            .then(responseJson => {
                return responseJson;
            })

        await asyncDelay(1000);

        this.setState({
            searching: false,
            attachments: result
        });

        console.log('kết quả', result);
    }

    renderItem = ({ item }) => (
        <ListItem
            leftIcon={
                <View style={[ListTaskStyle.leftSize, {
                    marginRight: 10
                }]}>
                    <RneIcon name='ios-attach-outline' size={26} type='ionicon' style={ListTaskStyle.leftIcon} />
                </View>
            }

            rightIcon={
                <View style={ListTaskStyle.rightSize}>
                    <TouchableOpacity onPress={() => this.downloadFile(item.TENTAILIEU, item.DUONGDAN_FILE, item.DINHDANG_FILE)}>
                        <RneIcon name='download' color={'#4FA800'} size={verticalScale(25)} type='entypo' />
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
            fileLink = fileLink.replace(/ /g, "%20");

            const config = {
                fileCache: true,
                // android only options, these options be a no-op on IOS
                addAndroidDownloads: {
                    notification: true, // Show notification when response data transmitted
                    title: fileName, // Title of download notification
                    description: 'An image file.', // File description (not notification description)
                    mime: fileExtension,
                    mediaScannable: true, // Make the file scannable  by media scanner
                }
            }

            if (Platform.OS == 'ios') {
                config = {
                    fileCache: true
                }
            }

            RNFetchBlob.config(config)
                .fetch('GET', fileLink)
                .then((response) => {
                    //kiểm tra platform nếu là android và file là ảnh
                    if (Platform.OS == 'android' && isImage(fileExtension)) {
                        android.actionViewIntent(response.path(), fileExtension);
                    }
                    response.path();
                }).catch((err) => {
                    Alert.alert(
                        'THÔNG BÁO',
                        'KHÔNG THỂ TẢI ĐƯỢC FILE',
                        [
                            {
                                text: 'OK',
                                onPress: () => { console.log('Lỗi', err) }
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
            <Container>
                <Header searchBar style={{ backgroundColor: '#fff' }}>
                    <Item>
                        <Icon name='ios-search' />
                        <Input placeholder='Tên tài liệu'
                            value={this.state.filterValue}
                            onChangeText={(filterValue) => this.setState({ filterValue })}
                            onSubmitEditing={() => this.onAttachFilter()} />
                    </Item>
                </Header>


                <Content contentContainerStyle={{ flex: 1, justifyContent: (this.state.searching) ? 'center' : 'flex-start' }}>
                    {
                        renderIf(this.state.searching)(
                            <ActivityIndicator size={indicatorResponsive} animating color={LOADER_COLOR} />
                        )
                    }

                    {
                        renderIf(!this.state.searching)(
                            <List containerStyle={DetailTaskStyle.listContainer}>
                                <FlatList
                                    keyExtractor={(item, index) => index.toString()}
                                    data={this.state.attachments}
                                    renderItem={this.renderItem}
                                    ListEmptyComponent={() =>
                                        this.state.loading ? null : (
                                            emptyDataPage()
                                        )
                                    }
                                />
                            </List>
                        )
                    }
                </Content>
            </Container>
        );
    }
}

