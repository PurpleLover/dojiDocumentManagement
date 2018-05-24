/*
	@description: danh sách văn bản trình kí đã lọc
	@author: duynn
	@since: 15/05/2018
*/
'use strict'
import React, { Component } from 'react';
import {
    RefreshControl, AsyncStorage, ActivityIndicator, View, Text, Modal,
    FlatList, TouchableOpacity, Image
} from 'react-native';

//constant
import {
    API_URL, DEFAULT_PAGE_INDEX,
    DEFAULT_PAGE_SIZE, EMPTY_DATA_ICON_URI,
    EMPTY_STRING, EMTPY_DATA_MESSAGE,
    HEADER_COLOR, LOADER_COLOR, DOKHAN_CONSTANT
} from '../../../common/SystemConstant';

//native-base
import {
    Button, Icon, Item, Input, Title, Toast,
    Container, Header, Content, Left, Right, Body
} from 'native-base';

//react-native-elements
import { ListItem } from 'react-native-elements';

//redux
import { connect } from 'react-redux';

//lib
import renderIf from 'render-if';

//styles
import { ListSignDocStyle } from '../../../assets/styles/SignDocStyle';
import { indicatorResponsive } from '../../../assets/styles/ScaleIndicator';

//utilities
import { formatLongText, closeSideBar, openSideBar, getUserInfo } from '../../../common/Utilities';
import * as util from 'lodash';

class ListFilterSignDoc extends Component {
	constructor(props){
		super(props);
		this.state = {
			loading: false,
			refreshing: false,
			data: [],
			userId: this.props.userInfo.ID,
			filterValue: this.props.navigation.state.params.filterValue,
			filterType: this.props.navigation.state.params.filterType,
			pageSize: DEFAULT_PAGE_SIZE,
			pageIndex: DEFAULT_PAGE_INDEX
		}
		
	}
	
	componentDidMount () {
		this.fetchData();
	}

	onFilter(){
        if(util.isNull(this.state.filterValue) || util.isEmpty(this.state.filterValue)){
            Toast.show({
                text: 'Vui lòng nhập mã hiệu hoặc trích yếu',
                type: 'danger',
                buttonText: "OK",
                buttonStyle: { backgroundColor: '#fff' },
                buttonTextStyle: { color: '#FF0033'},
                duration: 2000
            });
        } else {
            this.setState({
                data: [],
                pageIndex: DEFAULT_PAGE_INDEX,
                pageSize: DEFAULT_PAGE_SIZE
            }, ()=> {
                this.fetchData();
            })
        }
	}

	clearFilterValue () {
		this.setState({
			filterValue: EMPTY_STRING
		})
	}

	async fetchData(){
		const isRefreshing = this.state.refreshing
        if(!isRefreshing){
            this.setState({ loading: true });
        }

        //quy ước xử lý
        /*
			1:chưa xử lý
			2: đã xử lý
			3: cần review
			4: đã review
        */

        let apiUrlParam = 'GetListProcessing';

        if(this.state.filterType == 2){
			apiUrlParam = 'GetListProcessed'
        }else if(this.state.filterType == 3){
			apiUrlParam = 'GetListReview'
        }else if(this.state.fitlerType == 4){
			apiUrlParapiUrlParamam = 'GetListReviewed'
        }

        const url = `${API_URL}/api/VanBanDi/${apiUrlParam}/${this.state.userId}/${this.state.pageSize}/${this.state.pageIndex}?query=${this.state.filterValue}`;
		console.log('url vua day la', url);
        let result = await fetch(url).then(response => {
            return response.json();
        }).then(responseJson => {
            return responseJson.ListItem;
        }).catch(err => {
            console.log(`Error in URL: ${url}`, err);
            return []
        });

        this.setState({
            loading: false,
            refreshing: false,
            data: isRefreshing ? result : [...this.state.data, ...result]
        });
	}


	
	renderItem = ({item}) => {
        let content = [];

        if(item == this.state.data[0]){
            content.push(
                <ListItem key={-1}
                    leftIcon={
                        <Text style={{color: '#9E9E9E'}}>
                            KẾT QUẢ
                        </Text>
                    }

                    rightIcon={
                        <Text style={{color: '#000', fontWeight: 'bold'}}>
                            {this.state.data.length}
                        </Text>
                    }
                    containerStyle={{height: 40, backgroundColor: '#EEE', justifyContent: 'center'}}
                />
            )
        }

        content.push(
            <TouchableOpacity key={item.ID} onPress={() => this.props.navigation.navigate('DetailSignDocScreen', {
                docId: item.ID
            })}>
                <ListItem
                    badge={{ 
                        value: (item.DOKHAN_ID == DOKHAN_CONSTANT.THUONG_KHAN) ? 'T.KHẨN' : ((item.DOKHAN_ID == DOKHAN_CONSTANT.KHAN) ? 'KHẨN': 'THƯỜNG'), 
                        textStyle: { 
                            color: '#fff',
                            fontWeight: 'bold' 
                        }, 
                        containerStyle: { 
                            backgroundColor: (item.DOKHAN_ID == DOKHAN_CONSTANT.THUONG_KHAN) ? '#FF0033' : ((item.DOKHAN_ID == DOKHAN_CONSTANT.KHAN) ? '#FF6600': '#337321') 
                        } 
                    }}

                    leftIcon={
                        <View style={ListSignDocStyle.leftSide}>
                            {
                                renderIf(item.HAS_FILE)(
                                    <Icon name='ios-attach' />
                                )
                            }
                        </View>
                    }

                    title={
                        <Text style={item.IS_READ === true ? ListSignDocStyle.textRead : ListSignDocStyle.textNormal}>
                            {'SỐ HIỆU: ' + item.SOHIEU}
                        </Text>
                    }

                    subtitle={
                        <Text style={[item.IS_READ === true ? ListSignDocStyle.textRead : ListSignDocStyle.textNormal, ListSignDocStyle.abridgment]}>
                            {formatLongText(item.TRICHYEU, 50)}
                        </Text>
                    }
                />
            </TouchableOpacity>
        )

		return (content);
	}

	navigateToList (){
		let screenName = 'ListIsNotProcessedScreen';

        if(this.state.filterType == 2){
			screenName = 'ListIsProcessedScreen'
        }else if(this.state.filterType == 3){
			screenName = 'ListIsNotReviewedScreen'
        }else if(this.state.fitlerType == 4){
			screenName = 'ListIsReviewedScreen'
        }

        this.props.navigation.navigate(screenName);
	}

	handleEnd(){
		if (this.state.data.length >= 10) {
            this.setState(state => ({
                pageIndex: state.pageIndex + 1
            }), () => this.fetchData());
        }
	}

	handleRefresh(){
		this.setState({
            refreshing: true,
            pageIndex: DEFAULT_PAGE_INDEX,
            pageSize: DEFAULT_PAGE_SIZE,
        }, () => {
            if(!util.isEmpty(this.state.filterValue)){
                this.fetchData();
            }
        });
	}

	render(){
		return(
			<Container>
				<Header searchBar rounded style={{backgroundColor: HEADER_COLOR}}>
					<Item>
						<Icon name='ios-arrow-round-back' onPress={() => this.navigateToList()}/>
						<Input placeholder='Mã hiệu hoặc trích yếu'
							value={this.state.filterValue}
							onChangeText={(filterValue) => this.setState({filterValue})}
							onSubmitEditing={()=> this.onFilter()}
						 />

						 <Icon name='ios-close' onPress={() => this.clearFilterValue()}/>
					</Item>
				</Header>

				<Content>
					<FlatList
                        onEndReached={() => this.handleEnd()}
                        onEndReachedThreshold={0.1}
                        data={this.state.data}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={this.renderItem}
                        ListFooterComponent={() => this.state.loading ? <ActivityIndicator size={indicatorResponsive} animating color={LOADER_COLOR} /> : null}
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
                        refreshControl={
                            <RefreshControl
                                refreshing={this.state.refreshing}
                                onRefresh={this.handleRefresh.bind(this)}
                                title='Kéo để làm mới'
                                colors={[LOADER_COLOR]}
                             />
                          }
                    />
				</Content>
			</Container>
		);
	}
}

const mapStateToProps = (state) => {
	return{
		userInfo: state.userState.userInfo
	}
}

export default connect(mapStateToProps)(ListFilterSignDoc);