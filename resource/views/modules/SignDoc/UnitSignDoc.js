/*
* @description: Đơn vị/ phòng ban nhận văn bản
* @author: duynn
* @since: 28/05/2018
*/
import React, { Component } from 'react';
import { ActivityIndicator, View, ScrollView, FlatList } from 'react-native';

//lib
import { Container, Content, Header, Icon, Item, Input } from 'native-base';
import { List, ListItem } from 'react-native-elements';
import renderIf from 'render-if';

//styles
import { DetailSignDocStyle } from '../../../assets/styles/SignDocStyle';

//utilities
import { API_URL, EMPTY_STRING, LOADER_COLOR } from '../../../common/SystemConstant';
import { asyncDelay, emptyDataPage } from '../../../common/Utilities';
import { verticalScale, indicatorResponsive } from '../../../assets/styles/ScaleIndicator';

export default class UnitSignDoc extends Component {
	constructor(props){
		super(props);
		this.state = {
			VanBanDi: props.info.VanBanDi,
			ListDonVi: props.info.ListDonVi,
			filterValue: EMPTY_STRING
		}
	}

	renderItem = ({item}) => (
		<ListItem title={item} hideChevron={true}/>
	)

	onUnitFilter = async () => {
		this.setState({
			searching: true
		});
		
		const url = `${API_URL}/api/VanBanDi/SearchInternalUnit?id=${this.state.VanBanDi.ID}&unitQuery=${this.state.filterValue}`;

		const result = await fetch(url, {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json;charset=utf-8'
			}
		})
		.then(response => response.json())
		.then(responseJson => {
			return responseJson;
		});

		await asyncDelay(1000)

		this.setState({
			searching: false,
			ListDonVi: result
		});
	}

	render(){
		return(
			<Container>
				<Header searchBar style={{backgroundColor: '#fff'}}>
					<Item>
						<Icon name='ios-search'/>
						<Input placeholder='Tên phòng ban, đơn vị'
							onChangeText={(filterValue) => this.setState({filterValue})}
							onSubmitEditing={()=> this.onUnitFilter()}
							value={this.state.filterValue}/>
					</Item>
				</Header>
				<Content contentContainerStyle={{flex: 1, justifyContent: (this.state.searching ? 'center': 'flex-start')}}>
					{
						renderIf(this.state.searching)(
							<ActivityIndicator size={indicatorResponsive} animating color={LOADER_COLOR} />
						)
					}

					{
						renderIf(!this.state.searching)(
							<List containerStyle={DetailSignDocStyle.listContainer}>
								<FlatList 
									data={this.state.ListDonVi}
									keyExtractor={(item, index) => index.toString()}
									renderItem={this.renderItem}
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