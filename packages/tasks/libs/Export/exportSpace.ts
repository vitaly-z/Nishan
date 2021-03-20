import { INotionEndpointsOptions } from '@nishans/endpoints';
import { ExportOptions } from '@nishans/types';
import { enqueueAndPollTask } from '../utils';

export const exportSpace = async (
	space_id: string,
	export_options: ExportOptions,
	options: INotionEndpointsOptions
) => {
	return await enqueueAndPollTask(
		space_id,
		{
			task: {
				eventName: 'exportSpace',
				request: {
					spaceId: space_id,
					exportOptions: export_options
				}
			}
		},
		options
	);
};