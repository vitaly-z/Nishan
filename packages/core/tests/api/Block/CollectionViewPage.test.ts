import { NotionCacheObject } from '@nishans/cache';
import { CollectionViewPage } from '../../../libs';
import { default_nishan_arg } from '../../utils';

afterEach(() => {
	jest.restoreAllMocks();
});

it(`getCachedParentData`, () => {
	const cache = {
		...NotionCacheObject.createDefaultCache(),
		block: new Map([
			[ 'block_1', { id: 'block_1' } ],
			[ 'block_2', { id: 'block_2', parent_id: 'block_1', parent_table: 'block' } ]
		])
	} as any;

	const collection_view_page = new CollectionViewPage({
		...default_nishan_arg,
		cache,
		id: 'block_2'
	});

	const parent_data = collection_view_page.getCachedParentData();
	expect(parent_data).toStrictEqual({
		id: 'block_1'
	});
});