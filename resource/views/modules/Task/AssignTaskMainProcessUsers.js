/**
 * @description: màn hình giao việc cho người xử lý chính
 * @author: duynn
 * @since: 31/05/2018
 */
import React, { Component } from 'react';
import {
    Animated, TouchableOpacity, Image,
    View, Text as RnText, FlatList, StyleSheet
} from 'react-native';

//redux
import { connect } from 'react-redux';
import * as taskAction from '../../../redux/modules/task/TaskAction'

//lib
import {
    Container, Content, List as NbList, ListItem as NbListItem,
    Left, Title, Text as NbText, Body, Right, Radio
} from 'native-base';
import {
    ListItem
} from 'react-native-elements';
import * as util from 'lodash';



class AssignTaskMainProcessUsrs extends Component {
    constructor(props) {
        super(props);
        this.icon = require('../../../assets/images/arrow-white.png');

        this.state = {
            title: props.title,
            data: props.data,

            expanded: true,
            rowItemHeight: 60,
            heightAnimation: new Animated.Value(60 * (props.data.length > 0 ? (props.data.length + 1) : 1)),
            rotateAnimation: new Animated.Value(0),
        }
    }

    toggle = () => {
        const multiplier = this.state.data.length > 0 ? (this.state.data.length + 1) : 1;

        const initialHeight = this.state.expanded ? (this.state.rowItemHeight * multiplier) : this.state.rowItemHeight;
        const finalHeight = this.state.expanded ? this.state.rowItemHeight : (this.state.rowItemHeight * multiplier);


        const initialRotation = this.state.expanded ? 1 : 0;
        const finalRotation = this.state.expanded ? 0 : 1

        this.setState({
            expanded: !this.state.expanded
        })

        this.state.heightAnimation.setValue(initialHeight);
        this.state.rotateAnimation.setValue(initialRotation);

        Animated.spring(this.state.heightAnimation, {
            duration: 1000,
            toValue: finalHeight
        }).start();

        Animated.spring(this.state.rotateAnimation, {
            duration: 2000,
            toValue: finalRotation
        })
    }

    onSelectUser(userId) {
        this.props.updateTaskProcessors(userId, true);
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
            <Animated.View style={[styles.container, { height: this.state.heightAnimation }]}>
                <View style={styles.titleContainer}>
                    <TouchableOpacity onPress={() => this.toggle()}>
                        <ListItem
                            containerStyle={styles.listItemContainer}
                            hideChevron={this.state.data.length <= 0}
                            title={util.toUpper(this.state.title)}
                            titleStyle={styles.listItemTitle}
                            rightIcon={
                                <Animated.Image source={this.icon} style={iconRotationStyle} />
                            }
                        />
                    </TouchableOpacity>
                </View>

                <View style={styles.body}>
                    {
                        this.state.data.map((item, index) => (
                            <NbListItem
                                key={item.ID} style={styles.listItemRow}
                                onPress={() => this.onSelectUser(item.ID)}>
                                <Left>
                                    <Title>
                                        <NbText>
                                            {item.HOTEN}
                                        </NbText>
                                    </Title>
                                </Left>

                                <Body>
                                    <NbText>
                                        {item.ChucVu}
                                    </NbText>
                                </Body>

                                <Right>
                                    <Radio color={'#FF0033'}
                                        selected={this.props.mainProcessUser == item.ID}
                                        onPress={() => this.onSelectUser(item.ID)} />
                                </Right>
                            </NbListItem>
                        ))
                    }
                </View>
            </Animated.View>
        );
    }
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: '#fff'
    },
    container: {

    },
    titleContainer: {
    },
    listItemContainer: {
        height: 60,
        backgroundColor: '#FF0033',
        justifyContent: 'center'
    },
    listItemRow: {
        height: 60
    },
    listItemTitle: {
        fontWeight: 'bold',
        color: '#fff'
    },
    body: {

    }
});

const mapStateToProps = (state) => {
    return {
        userInfo: state.userState.userInfo,
        mainProcessUser: state.taskState.mainProcessUser,
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        updateTaskProcessors: (userId, isMainProcess) => dispatch(taskAction.updateTaskProcessors(userId, isMainProcess))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(AssignTaskMainProcessUsrs);