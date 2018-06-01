/*
	@description: danh sách xin lùi hạn của công việc
	@author: duynn
	@since: 15/05/2018
*/
'use strict';
import React, { Component } from 'react';
import { View as RnView, Text as RnText } from 'react-native';
import {
	Alert, FlatList, RefreshControl, StyleSheet
} from 'react-native';
//lib
import {
	SwipeRow, Button, View, Text, Icon, Item,
	Label, Container, Header, Left, Body, Right,
	Title, Content, Form, Toast
} from 'native-base';
import renderIf from 'render-if';
import * as util from 'lodash';
import {
	Icon as RneIcon
} from 'react-native-elements';
import PopupDialog, { DialogTitle, DialogButton } from 'react-native-popup-dialog';

//redux
import { connect } from 'react-redux';

//utilities
import { API_URL, HEADER_COLOR, LOADER_COLOR } from '../../../common/SystemConstant';
import { asyncDelay, emptyDataPage, formatLongText, convertDateToString } from '../../../common/Utilities';
import { dataLoading, executeLoading } from '../../../common/Effect';
import { scale, verticalScale } from '../../../assets/styles/ScaleIndicator';
import { pushFirebaseNotify } from '../../../firebase/FireBaseClient';

class HistoryRescheduleTask extends Component {
	constructor(props) {
		super(props);

		this.state = {
			userId: props.userInfo.ID,

			taskId: props.navigation.state.params.taskId,
			taskType: props.navigation.state.params.taskType,

			data: [],
			loading: false,
			executing: false,
			rescheduleId: 0,
			rescheduleInfo: {}
		}
	}

	componentWillMount() {
		this.fetchData();
	}

	fetchData = async () => {
		this.setState({
			loading: true
		});

		const url = `${API_URL}/api/HscvCongViec/JobDetail/${this.state.taskId}/${this.state.userId}`;
		const result = await fetch(url);
		const resultJson = await result.json();

		this.setState({
			loading: false,
			data: resultJson.LstXinLuiHan || []
		});
	}

	onShowRescheduleInfo = (item) => {
		this.setState({
			rescheduleInfo: item
		}, () => {
			this.popupDialog.show();
		})
	}

	onConfirmApproveReschedule = (item) => {
		this.setState({
			rescheduleInfo: item
		}, () => {
			Alert.alert(
				'PHẢN HỒI YÊU CẦU LÙI HẠN',
				'Phản hồi yêu cầu lùi hạn của ' + item.FullName,
				[
					{
						'text': 'ĐỒNG Ý', onPress: () => { this.onApproveReschedule(true, item.ID) }
					}, {
						'text': 'KHÔNG ĐỒNG Ý', onPress: () => { this.onApproveReschedule(false, item.ID) }
					}, {
						'text': 'THOÁT', onPress: () => console.log('pressed cancel')
					}
				]
			)
		})
	}

	onApproveReschedule = async (isApprove, id) => {
		this.setState({
			executing: true
		});

		const status = isApprove ? 1 : 0;

		const url = `${API_URL}/api/HscvCongViec/ApproveExtendTask?id=${id}&userId=${this.state.userId}&status=${status}`;
		const headers = new Headers({
			'Accept': 'application/json',
			'Content-Type': 'application/json; charset=utf-8',
		})
		const result = await fetch(url, {
			method: 'POST',
			headers
		});

		const resultJson = await result.json();

		await asyncDelay(2000);

		this.setState({
			executing: false
		});

		if (resultJson.Status == true && !util.isNull(resultJson.GroupTokens) && !util.isEmpty(resultJson.GroupTokens)) {
			const message = this.props.userInfo.Fullname + ' đã ' + (isApprove ? 'phê duyệt' : 'từ chối') + ' yêu cầu lùi hạn';
			const content = {
				title: (isApprove ? 'ĐỒNG Ý' : 'TỪ CHỐI') + ' YÊU CẦU GIA HẠN CÔNG VIỆC',
				message,
				isTaskNotification: true,
				targetScreen: 'DetailTaskScreen',
				targetTaskId: this.state.taskId,
				targetTaskType: this.state.taskType
			}

			resultJson.GroupTokens.forEach(token => {
				pushFirebaseNotify(content, token, 'notification');
			})
		}

		Toast.show({
			text: resultJson.Status ? 'Phản hồi yêu cầu lùi hạn thành công' : 'Phản hồi yêu cầu lùi hạn không thành công',
			type: resultJson.Status ? 'success' : 'danger',
			buttonText: "OK",
			buttonStyle: { backgroundColor: '#fff' },
			buttonTextStyle: { color: resultJson.Status ? '#337321' : '#FF0033' },
			duration: 3000,
			onClose: () => {
				if (resultJson.Status) {
					this.fetchData();
				}
			}
		});
	}

	renderItem = ({ item }) => {
		return (
			<SwipeRow
				leftOpenValue={75}
				rightOpenValue={-75}
				disableLeftSwipe={!util.isNull(item.IS_APPROVED)}
				left={
					<Button style={{ backgroundColor: '#d1d2d3' }} onPress={() => this.onShowRescheduleInfo(item)}>
						<RneIcon name='info' type='foundation' size={verticalScale(30)} color={'#fff'} />
					</Button>
				}
				body={
					<RnView style={styles.rowContainer}>
						<RnText style={styles.rowDateContainer}>
							<RnText>
								{'Lùi đến: '}
							</RnText>

							<RnText style={styles.rowDate}>
								{convertDateToString(item.HANKETHUC)}
							</RnText>
						</RnText>

						<RnText style={styles.rowStatusLabel}>
							{'Trạng thái: '}
						</RnText>
						{
							util.isNull(item.IS_APPROVED) ?
								<RnText style={[styles.notConfirmText, styles.rowStatus]}>
									Chưa phê duyệt
								</RnText> :
								(
									item.IS_APPROVED ?
										<RnText style={[styles.approveText, styles.rowStatus]}>
											Đã phê duyệt
										</RnText>
										: <RnText style={[styles.denyText, styles.rowStatus]}>
											Không phê duyệt
										</RnText>
								)
						}
					</RnView>
				}

				right={
					<Button style={{ backgroundColor: LOADER_COLOR }} onPress={() => this.onConfirmApproveReschedule(item)}>
						<RneIcon name='pencil' type='foundation' size={verticalScale(30)} color={'#fff'} />
					</Button>
				}
			/>
		)
	}

	navigateBackToDetail() {
		this.props.navigation.navigate('DetailTaskScreen', {
			taskId: this.state.taskId,
			taskType: this.state.taskType
		});
	}

	render() {
		return (
			<Container>
				<Header style={{ backgroundColor: HEADER_COLOR }}>
					<Left>
						<Button transparent onPress={() => this.navigateBackToDetail()}>
							<RneIcon name='ios-arrow-round-back' size={verticalScale(40)} color={'#fff'} type='ionicon' />
						</Button>
					</Left>

					<Body>
						<Title>
							LỊCH SỬ LÙI HẠN
						</Title>
					</Body>
				</Header>

				<Content contentContainerStyle={{ flex: 1 }}>
					{
						renderIf(this.state.loading)(
							dataLoading(true)
						)
					}

					{
						renderIf(!this.state.loading)(
							<FlatList
								data={this.state.data}
								keyExtractor={(item, index) => index.toString()}
								renderItem={this.renderItem}
								ListEmptyComponent={() => emptyDataPage()}
							/>
						)
					}
				</Content>

				{
					executeLoading(this.state.executing)
				}

				{/* hiển thị thông tin lùi hạn công việc */}

				<PopupDialog
					dialogTitle={<DialogTitle title='THÔNG TIN LÙI HẠN' />}
					ref={(popupDialog) => { this.popupDialog = popupDialog }}
					width={0.8}
					height={verticalScale(400)}
					actions={[
						<DialogButton
							align={'center'}
							buttonStyle={{
								height: verticalScale(50),
								justifyContent: 'center',
							}}
							text="ĐÓNG"
							onPress={() => {
								this.popupDialog.dismiss();
							}}
							key="button-0"
						/>,
					]}>
					<Form>
						<Item stackedLabel>
							<Label style={styles.dialogLabel}>
								Người xin lùi hạn
							</Label>

							<Label style={styles.dialogText}>
								{this.state.rescheduleInfo.FullName}
							</Label>
						</Item>

						<Item stackedLabel>
							<Label style={styles.dialogLabel}>
								Xin lùi tới ngày
							</Label>

							<Label style={styles.dialogText}>
								{convertDateToString(this.state.rescheduleInfo.HANKETHUC)}
							</Label>
						</Item>

						<Item stackedLabel>
							<Label style={styles.dialogLabel}>
								Lý do xin lùi hạn
							</Label>

							<Label style={styles.dialogText}>
								{(this.state.rescheduleInfo.NOIDUNG)}
							</Label>
						</Item>

						<Item stackedLabel>
							<Label style={styles.dialogLabel}>
								Trạng thái phê duyệt
							</Label>

							{
								util.isNull(this.state.rescheduleInfo.IS_APPROVED) ?
									<Label style={[styles.notConfirmText]}>
										Chưa phê duyệt
								</Label> :
									(
										this.state.rescheduleInfo.IS_APPROVED ?
											<Label style={[styles.approveText]}>
												Đã phê duyệt
											</Label>
											: <Label style={[styles.denyText]}>
												Không phê duyệt
											</Label>
									)
							}
						</Item>
					</Form>
				</PopupDialog>
			</Container>
		);
	}
}

const styles = StyleSheet.create({
	rowContainer: {
		width: '100%',
		paddingLeft: scale(10),
		flexDirection: 'row'
	},
	rowDateContainer: {
		color: '#000',
	},
	rowDate: {
		color: '#000',
		fontWeight: 'bold',
		paddingLeft: scale(10),
		textDecorationLine: 'underline'
	},
	rowStatusLabel: {
		color: '#000',
		marginLeft: scale(10)
	},
	rowStatus: {
		fontWeight: 'bold',
		textDecorationLine: 'underline'
	}, notConfirmText: {
		color: '#FF6600'
	}, approveText: {
		color: '#337321'
	}, denyText: {
		color: '#FF0033'
	}, dialogLabel: {
		fontWeight: 'bold',
		color: '#000',
		fontSize: verticalScale(14)
	}
});



const mapStateToProps = (state) => {
	return {
		userInfo: state.userState.userInfo
	}
}

export default connect(mapStateToProps)(HistoryRescheduleTask)