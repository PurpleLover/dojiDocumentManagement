/**
 * @description: lịch sử xử lý văn bản trình ký
 * @author: duynn
 * @since: 04/05/2018
 */
'use strict'
import React, { Component } from 'react'
import { View, Text, ScrollView, RefreshControl, ActivityIndicator, Image } from 'react-native'

//lib
import Timeline from 'react-native-timeline-listview';
import * as util from 'lodash';
import HTMLView from 'react-native-htmlview';
import renderIf from 'render-if';
//styles
import { DetailSignDocStyle, ListSignDocStyle } from '../../../assets/styles/SignDocStyle';

import { EMPTY_DATA_ICON_URI, EMTPY_DATA_MESSAGE } from '../../../common/SystemConstant';

import { convertDateToString } from '../../../common/Utilities';

export default class TimelineSignDoc extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: []
        }
    }

    componentWillMount = () => {
        if(!util.isNull(this.props.info) && !util.isEmpty(this.props.info)){
            let data = [];
            this.props.info.forEach((item, index)=> {
                data.push(
                    {
                        time:  convertDateToString(item.create_at),
                        title: item.IS_RETURN ? 'Trả về' : (item.step ? item.step.name : 'N/A') , 
                        description: `Người xử lý: ${item.TenNguoiXuLy}`
                    },
                );
            });

            this.setState({
                data
            });
        }
    }


    render() {
        
        return (
            <View style={DetailSignDocStyle.container}>

                {
                    renderIf(this.state.data.length <= 0)(
                        <View style={ListSignDocStyle.emtpyContainer}>
                            <Image source={EMPTY_DATA_ICON_URI} style={ListSignDocStyle.emptyIcon} />
                            <Text style={ListSignDocStyle.emptyMessage}>
                                {EMTPY_DATA_MESSAGE}
                            </Text>
                        </View>
                    )
                }
                
                {
                    renderIf(this.state.data.length > 0)(
                        <Timeline
                            circleSize={22}
                            circleColor={'#FF993B'}
                            lineColor={'#FF993B'}
                            timeContainerStyle={{ minWidth: 50 }}
                            timeStyle={{
                                textAlign: 'center',
                                backgroundColor: '#FF993B',
                                color: '#fff',
                                borderRadius: 10,
                                fontSize:10,
                                paddingVertical: 5
                            }}
                            descriptionStyle={{
                                color: 'gray'
                            }}
                            titleStyle={{
                                color: '#000',
                                fontSize: 20,
                                fontWeight: 'bold',
                                marginTop: -15
                            }}
                            innerCircle={'dot'}
                            style={DetailSignDocStyle.timelineContainer}
                            data={this.state.data}
                        />
                    )
                }
            </View>
        );
    }
}