import { Dimensions } from'react-native'

// export const WEB_URL = 'http://www.dartist-doji-web.com:8354';
// export const WEB_URL = 'http://192.168.1.75:89';

export const WEB_URL = 'http://192.168.1.21:8355';
export const API_URL = 'http://192.168.1.21:26633';

export const DEFAULT_PAGE_SIZE = 20;
export const DEFAULT_PAGE_INDEX = 1;

export const EMPTY_STRING = '';

export const EMTPY_DATA_MESSAGE = 'KHÔNG CÓ DỮ LIỆU';
export const EMPTY_DATA_ICON_URI = require('../assets/images/empty_data.png');
export const SAD_FACE_ICON_URI = require('../assets/images/error.png');

export const { width, height } = Dimensions.get('window');

export const HEADER_COLOR = '#FF993B'
export const LOADER_COLOR = '#337321'

export const PLANJOB_CONSTANT = {
	CHUALAPKEHOACH: 0,
    CHUATRINHKEHOACH: 1,
    DATRINHKEHOACH: 2,
    DAPHEDUYETKEHOACH: 3,
    LAPLAIKEHOACH: 4
}

export const DOKHAN_CONSTANT = {
	KHAN: 98,
	THUONG: 99,
	THUONG_KHAN: 100
}