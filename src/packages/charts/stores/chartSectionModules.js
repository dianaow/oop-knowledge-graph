/** @format */

import ChartSectionModuleName from '@/packages/charts/types/ChartSectionModuleName';
import DataType from '@/packages/data/types/DataType';
import ChartOption from '@/packages/data/types/ChartOption';

export default Object.freeze(
	[
		{
			name: ChartSectionModuleName.MAIN,
			moduleType: null,
			dataType: DataType.GRAPH,
			options: {
				[ChartOption.CHART_HEIGHT]: 200,
				[ChartOption.VISIBLE]: true,
			},
		}
	]
);

