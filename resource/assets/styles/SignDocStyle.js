/**
 * @description: định dạng style văn bản trình ký
 * @author: duynn
 * @since: 02/05/2018
 */
import { Dimensions, StyleSheet } from 'react-native';

export const DetailSignDocStyle = StyleSheet.create({
    container: {
        flex: 1,
    }, 
    listContainer: {
        marginTop: 0,
        borderTopWidth: 0,
        borderBottomWidth: 0,
        borderBottomColor: '#cbd2d9'
    }, 
    listItemContainer: {
        paddingTop: 10,
        paddingRight: 10,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e5e5'
    }, listItemTitleContainer: {
        fontWeight: 'bold',
        color: 'black',
        fontSize: 14
    }, listItemSubTitleContainer: {
        fontSize: 13,
        color: '#777',
        fontWeight: 'normal'
    }, timelineContainer: {
        paddingTop: 20,
        flex: 1,
    }, timeContainer: {

    }, time: {
        
    }
});

export const ListSignDocStyle = StyleSheet.create({
    emtpyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    emptyIcon: {
        width: 100,
        height: 100,
        resizeMode: 'contain'
    },
    emptyMessage: {
        color: '#ccc',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center'
    },
    leftSide: {
        width: 30
    },
    rightSize: {
        width: 30
    },
    leftIcon: {
        
    },
    abridgment: {
        fontSize: 12,
        flexWrap: 'wrap'
    },
    textNormal: {
        color: '#000'
    },
    textRead: {
        color: '#888'
    }
});

