import React, { Component } from 'react';
import { View, Modal, NetInfo, Text, StyleSheet } from 'react-native';

//lib + redux
import { connect } from 'react-redux';
import * as action from '../../redux/modules/network/NetworkAction';
import { Header } from 'react-native-elements';

//constant
import { Colors } from '../../common/SystemConstant';

//styles
import { scale, verticalScale, moderateScale } from '../../assets/styles/ScaleIndicator';

class NetworkStatus extends Component {
    constructor(props) {
        super(props);
    }

    handleNetInfo = (isConnected) => {
        this.props.updateNetworkStatus(isConnected);
    }

    componentDidMount() {
        NetInfo.isConnected.addEventListener('connectionChange', this.handleNetInfo);
    }

    componentWillUnMount() {
        NetInfo.isConnected.addEventListener('connectionChange', this.handleNetInfo);
    }

    render() {
        return (
            <Modal animationType='slide'
                visible={!this.props.isConnected}
                transparent={true}
                onRequestClose={() => console.log('Đã đóng')}>
                <View style={styles.container}>
                    <View style={styles.body}>
                        <Header
                            outerContainerStyle={styles.headerOuter}
                            centerComponent={
                                <Text style={styles.headerTitle}>
                                    LỖI KẾT NỐI
                                </Text>
                            }
                        />
                    </View>

                    <View style={styles.content}>
                        <Text style={styles.bodyTitle}>
                            VUI LÒNG KIỂM TRA KẾT NỐI CỦA BẠN
                        </Text>
                    </View>
                </View>
            </Modal>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(52, 52, 52, 0.8)'
    }, body: {
        width: scale(300),
        height: verticalScale(200),
        borderRadius: 3,
        borderWidth:1,
        borderColor: '#ececec',
        backgroundColor: Colors.WHITE,
        justifyContent: 'center',
        alignItems: 'center'
    }, headerOuter: {
        backgroundColor: Colors.BLUE_PANTONE_640C,
        height: verticalScale(50),
    }, headerTitle: {
        color: Colors.WHITE, 
        fontWeight: 'bold',
        fontSize: moderateScale(16)
    }, bodyTitle: {
        color: Colors.BLACK,
        fontSize: moderateScale(15)
    }, content: {
        height: verticalScale(250),
        justifyContent: 'center',
        alignItems: 'center'
    }
})

const mapStateToProps = (state) => {
    return {
        isConnected: state.networkState.isConnected
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        updateNetworkStatus: (isConnected) => dispatch(action.updateNetworkStatus(isConnected))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(NetworkStatus);