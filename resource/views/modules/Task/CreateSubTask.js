/*
	@description: tạo công việc con
	@author: duynn
	@since: 19/05/2018
*/
'use strict'
import React, { Component } from 'react';
import { Platform } from 'react-native';
//lib
import {
	Container, Header, Left, Body, Content,
	Right, Item, Title, Text, Icon, Input,
	Button, Form, Picker, Toast, Label
} from 'native-base'
import { Icon as RneIcon } from 'react-native-elements';
import DatePicker from 'react-native-datepicker';

//utilities
import { API_URL, HEADER_COLOR, EMPTY_STRING, Colors } from '../../../common/SystemConstant';
import { verticalScale } from '../../../assets/styles/ScaleIndicator';
import { executeLoading } from '../../../common/Effect';
import { asyncDelay, convertDateToString } from '../../../common/Utilities';
import * as util from 'lodash';

//redux
import { connect } from 'react-redux';

//style
import { scale, moderateScale } from '../../../assets/styles/ScaleIndicator';
import { NativeBaseStyle } from '../../../assets/styles/NativeBaseStyle';

class CreateSubTask extends Component {
	constructor(props) {
		super(props);

		this.state = {
			userId: props.userInfo.ID,

			taskId: props.navigation.state.params.taskId,
			taskType: props.navigation.state.params.taskType,

			deadline: EMPTY_STRING,
			content: EMPTY_STRING,
			listPriority: props.navigation.state.params.listPriority,
			listUrgency: props.navigation.state.params.listUrgency,
			priorityValue: props.navigation.state.params.priorityValue, //độ ưu tiên
			urgencyValue: props.navigation.state.params.urgencyValue, //đô khẩn
			planValue: '0', //lập kế hoạch 

			executing: false,
			chosenDate: null
		}
	}

	setDate = (newDate) => {
		this.setState({
			chosenDate: newDate,
		})
	}

	onPriorityValueChange(value) {
		this.setState({
			priorityValue: value
		})
	}

	onUrgencyValueChange(value) {
		this.setState({
			urgencyValue: value
		})
	}

	onPlanValueChange(value) {
		this.setState({
			planValue: value
		})
	}

	navigateBackToDetail() {
		this.props.navigation.navigate('DetailTaskScreen', {
			taskId: this.state.taskId,
			taskType: this.state.taskType
		});
	}

	onCreateSubTask = async () => {
		if (util.isNull(this.state.content) || util.isEmpty(this.state.content)) {
			Toast.show({
				text: 'Vui lòng nhập nội dung',
				type: 'danger',
				buttonText: "OK",
				buttonStyle: { backgroundColor: Colors.WHITE },
				buttonTextStyle: { color: Colors.RED_PANTONE_186C },
			});
		} else if (util.isNull(this.state.chosenDate) || util.isEmpty(this.state.chosenDate)) {
			Toast.show({
				text: 'Vui lòng nhập thời hạn xử lý',
				type: 'danger',
				buttonText: "OK",
				buttonStyle: { backgroundColor: Colors.WHITE },
				buttonTextStyle: { color: Colors.RED_PANTONE_186C },
			});
		} else {
			this.setState({
				executing: true
			});

			const url = `${API_URL}/api/HscvCongViec/CreateSubTask`;

			const headers = new Headers({
				'Accept': 'application/json',
				'Content-Type': 'application/json; charset=utf-8'
			});

			const body = JSON.stringify({
				beginTaskId: this.state.taskId,
				taskContent: this.state.content,
				priority: this.state.priorityValue,
				urgency: this.state.urgencyValue,
				deadline: this.state.chosenDate,
				isHasPlan: this.state.planValue == '1'
			});

			const result = await fetch(url, {
				method: 'POST',
				headers,
				body
			});

			const resultJson = await result.json();

			await asyncDelay(2000);

			this.setState({
				executing: false
			});

			Toast.show({
				text: resultJson.Status ? 'Tạo công việc con thành công' : 'Tạo công việc con không thành công',
				type: resultJson.Status ? 'success' : 'danger',
				buttonText: "OK",
				buttonStyle: { backgroundColor: Colors.WHITE },
				buttonTextStyle: { color: resultJson.Status ? Colors.GREEN_PANTONE_364C : Colors.RED_PANTONE_186C },
				duration: 3000,
				onClose: () => {
					if (resultJson.Status) {
						this.navigateBackToDetail();
					}
				}
			});
		}

	}

	render() {
		const pickerStyle = Platform.OS === 'ios' ? { justifyContent: 'center' } : { width: '100%' };
		return (
			<Container>
				<Header style={{ backgroundColor: Colors.RED_PANTONE_186C }}>
					<Left style={NativeBaseStyle.left}>
						<Button transparent onPress={() => this.navigateBackToDetail()}>
							<RneIcon name='ios-arrow-round-back' size={moderateScale(40)} color={Colors.WHITE} type='ionicon' />
						</Button>
					</Left>

					<Body style={NativeBaseStyle.body}>
						<Title style={NativeBaseStyle.bodyTitle}>
							TẠO CÔNG VIỆC CON
						</Title>
					</Body>

					<Right style={NativeBaseStyle.right} />
				</Header>

				<Content>
					<Form>
						<Item stackedLabel>
							<Label>
								Nội dung công việc
							</Label>

							<Input value={this.state.content} onChangeText={(content) => this.setState({ content })} />
						</Item>

						<Item stackedLabel>
							<Label>Độ ưu tiên</Label>
							<Picker
								iosHeader='Chọn độ ưu tiên'
								mode='dropdown'
								iosIcon={<Icon name='ios-arrow-down-outline' />}
								style={pickerStyle}
								selectedValue={this.state.priorityValue} //sai chinh ta @@
								onValueChange={this.onPriorityValueChange.bind(this)}>
								{
									this.state.listPriority.map((item, index) => (
										<Picker.Item value={item.Value.toString()} label={item.Text.toString()} key={index} />
									))
								}
							</Picker>
						</Item>

						<Item stackedLabel>
							<Label>Độ khẩn</Label>
							<Picker
								iosHeader='Chọn độ khẩn'
								mode='dropdown'
								iosIcon={<Icon name='ios-arrow-down-outline' />}
								style={pickerStyle}
								selectedValue={this.state.urgencyValue}
								onValueChange={this.onUrgencyValueChange.bind(this)}>
								{
									this.state.listUrgency.map((item, index) => (
										<Picker.Item value={item.Value.toString()} label={item.Text.toString()} key={index} />
									))
								}
							</Picker>
						</Item>

						<Item stackedLabel>
							<Label>Lập kế hoạch</Label>
							<Picker
								iosHeader='Chọn độ khẩn'
								mode='dropdown'
								iosIcon={<Icon name='ios-arrow-down-outline' />}
								style={pickerStyle}
								selectedValue={this.state.planValue}
								onValueChange={this.onPlanValueChange.bind(this)}>
								<Picker.Item value="1" label="Có" />
								<Picker.Item value="0" label="Không" />
							</Picker>
						</Item>

						<Item stackedLabel style={{ height: verticalScale(100), justifyContent: 'center' }}>
							<Label>Hạn hoàn thành</Label>
							<DatePicker
								style={{ width: scale(300), alignSelf: 'center', marginTop: verticalScale(30) }}
								date={this.state.chosenDate}
								mode="date"
								placeholder='Hạn hoàn thành'
								format='DD/MM/YYYY'
								minDate={new Date()}
								confirmBtnText='CHỌN'
								cancelBtnText='BỎ'
								customStyles={{
									dateIcon: {
										position: 'absolute',
										left: 0,
										top: 4,
										marginLeft: 0
									},
									dateInput: {
										marginLeft: scale(36),
									}
								}}
								onDateChange={this.setDate}
							/>
						</Item>

						<Button block danger
							style={{ backgroundColor: HEADER_COLOR, marginTop: verticalScale(20) }}
							onPress={() => this.onCreateSubTask()}>
							<Text>
								TẠO CÔNG VIỆC
                            </Text>
						</Button>
					</Form>
				</Content>
				{
					executeLoading(this.state.executing)
				}
			</Container>
		);
	}
}

const mapStateToProps = (state) => {
	return {
		userInfo: state.userState.userInfo
	}
}

export default connect(mapStateToProps)(CreateSubTask);