import { IUserRoot, ISpaceView } from '@nishans/types';
import { NishanArg, FilterType, FilterTypes, UpdateType, ISpaceViewUpdateInput, UpdateTypes } from '../types';
import Data from './Data';

import SpaceView from './SpaceView';

class UserRoot extends Data<IUserRoot> {
	constructor (arg: NishanArg) {
		super({ ...arg, type: 'user_root' });
	}

	/**
   * Get a single space view from the user root
   * @param arg criteria to filter pages by
   * @returns A page object matching the passed criteria
   */
	async getSpaceView (arg?: FilterType<ISpaceView>) {
		return (await this.getSpaceViews(typeof arg === 'string' ? [ arg ] : arg, false))[0];
	}

	/**
   * Get multiple Space views from the user root
   * @param arg criteria to filter pages by
   * @returns An array of pages object matching the passed criteria
   */
	async getSpaceViews (args?: FilterTypes<ISpaceView>, multiple?: boolean) {
		const space_views: SpaceView[] = [];
		await this.getIterate<ISpaceView>(
			args,
			{ multiple, child_type: 'space_view', child_ids: 'space_views' },
			(space_id) => this.cache.space_view.get(space_id),
			(id) =>
				space_views.push(
					new SpaceView({
						...this.getProps(),
						id
					})
				)
		);
		return space_views;
	}

	async updateSpaceView (arg: UpdateType<ISpaceView, ISpaceViewUpdateInput>) {
		return await this.updateSpaceViews(typeof arg === 'function' ? arg : [ arg ], false);
	}

	async updateSpaceViews (args: UpdateTypes<ISpaceView, ISpaceViewUpdateInput>, multiple?: boolean) {
		const space_views: SpaceView[] = [];
		await this.updateIterate<ISpaceView, ISpaceViewUpdateInput>(
			args,
			{
				child_ids: this.getCachedData().space_views,
				child_type: 'space_view',
				multiple
			},
			(id) => this.cache.space_view.get(id),
			(id) => space_views.push(new SpaceView({ ...this.getProps(), id }))
		);
		return space_views;
	}
}

export default UserRoot;
