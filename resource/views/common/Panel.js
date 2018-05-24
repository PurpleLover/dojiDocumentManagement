/**
 * @description: phần panel dropdown sử dụng animation
 * @author: duynn
 * @since: 05/05/2018
 */
'use strict';
import React, { Component } from 'react';
import {
    Animated, View, Text, StyleSheet,
    TouchableOpacity, Image
} from 'react-native';

//lib
import { ListItem } from 'react-native-elements';
//styles
import { PanelStyle } from '../../assets/styles/PanelStyle';
import { SideBarStyle } from '../../assets/styles/SideBarStyle';

export default class Panel extends Component {
    constructor(props) {
        super(props);
        this.icon = require('../../assets/images/arrow.png');

        this.state = {
            title: props.title,
            expanded: false,
            rotateAnimation: new Animated.Value(0),
            heightAnimation: new Animated.Value(60),
        };
        this.setMaxHeight = this.setMaxHeight.bind(this);
        this.setMinHeight = this.setMinHeight.bind(this);
    }

    setMaxHeight = (event) => {
        this.setState({
            maxHeight: event.nativeEvent.layout.height
        });
    }

    setMinHeight = (event) => {
        this.setState({
            minHeight: event.nativeEvent.layout.height
        });
    }

    toggle() {
        const initialHeightValue = this.state.expanded ? (this.state.minHeight + this.state.maxHeight) : this.state.minHeight;
        const finalHeightValue = this.state.expanded ? this.state.minHeight : (this.state.minHeight + this.state.maxHeight);
        this.state.heightAnimation.setValue(initialHeightValue);

        const initRotateValue = this.state.expanded ? 1 : 0;
        const finalRotateValue = this.state.expanded ? 0 : 1;
        this.state.rotateAnimation.setValue(initRotateValue)

        this.setState({
            expanded: !this.state.expanded
        });

        Animated.spring(this.state.rotateAnimation, {
            toValue: finalRotateValue,
            duration: 1000
        }).start();

        Animated.spring(this.state.heightAnimation, {
            toValue: finalHeightValue,
            duration: 2000
        }).start();
    }

    render() {
        const interpolateRotation = this.state.rotateAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '180deg']
        });

        const iconRotationStyle = {
            transform: [
                {
                    rotate: interpolateRotation
                }
            ]
        }

        return (
            <Animated.View style={[PanelStyle.container, { height: this.state.heightAnimation }]}>
                <View style={PanelStyle.titleContainer} onLayout={this.setMinHeight}>
                    <TouchableOpacity onPress={() => this.toggle()}>
                        <ListItem
                            containerStyle={SideBarStyle.listItemContainer}
                            hidechevron={true}
                            title={this.props.title}
                            titleStyle={SideBarStyle.listItemTitle}
                            rightIcon={
                                <Animated.Image source={this.icon} style={iconRotationStyle} />
                            }
                        />
                    </TouchableOpacity>
                </View>

                <View style={PanelStyle.body} onLayout={this.setMaxHeight}>
                    {this.props.children}
                </View>
            </Animated.View>
        );
    }
}
