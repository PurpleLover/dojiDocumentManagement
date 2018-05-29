/**
 * @description: tài liệu đính kèm văn bản trình ký
 * @author: duynn
 * @since: 04/05/2018
 */
'use strict'
import React, { Component } from 'react';
import { Alert, ActivityIndicator, FlatList, TouchableOpacity, Platform } from 'react-native';

//lib
import { Container, Content, Header, Item, Icon, Input } from 'native-base';
import { List, ListItem, Icon as RneIcon } from 'react-native-elements';
import RNFetchBlob from 'react-native-fetch-blob';

//styles
import { DetailSignDocStyle } from '../../../assets/styles/SignDocStyle';

//utilities
import renderIf from 'render-if';
import { API_URL, WEB_URL, EMPTY_STRING, LOADER_COLOR } from '../../../common/SystemConstant';
import { asyncDelay, isImage, emptyDataPage } from '../../../common/Utilities';
import { verticalScale, indicatorResponsive } from '../../../assets/styles/ScaleIndicator';

const android = RNFetchBlob.android;
export default class AttachSignDoc extends Component {
    constructor(props) {
        super(props);

        this.state = {
            VanBanDi: props.info.VanBanDi,
            ListTaiLieu: props.info.ListTaiLieu,
            filterValue: EMPTY_STRING,
            searching: false
        }
    }

    async onAttachFilter() {
        this.setState({
            searching: true
        });

        const url = `${API_URL}/api/VanBanDi/SearchAttachment?id=${this.state.VanBanDi.ID}&attQuery=${this.state.filterValue}`;

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
            ListTaiLieu: result
        });
    }


    onDownloadFile(fileName, fileLink, fileExtension) {
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

    renderItem = ({ item }) => (
        <ListItem
            rightIcon={
                <TouchableOpacity onPress={() => this.onDownloadFile(item.TENTAILIEU, item.DUONGDAN_FILE, item.DINHDANG_FILE)}>
                    <RneIcon name='download' color={'#4FA800'} size={verticalScale(25)} type='entypo' />
                </TouchableOpacity>
            }
            title={item.TENTAILIEU}
            titleStyle={{ color: 'black', fontWeight: 'bold' }} />
    )

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
                            <List containerStyle={DetailSignDocStyle.listContainer}>
                                <FlatList
                                    data={this.state.ListTaiLieu}
                                    renderItem={this.renderItem}
                                    keyExtractor={(item, index) => index.toString()}
                                    ListEmptyComponent={() =>
                                        emptyDataPage()
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