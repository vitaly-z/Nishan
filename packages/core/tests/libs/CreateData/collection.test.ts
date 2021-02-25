import { ICache, NotionCacheObject } from '@nishans/cache';
import { IOperation } from '@nishans/types';
import { CreateData, CreateMaps } from '../../../libs';
import { TViewCreateInput } from '../../../src';
import { default_nishan_arg, o } from '../../utils';

afterEach(() => {
	jest.restoreAllMocks();
});

it(`createCollection should work correctly`, async () => {
	const view_ids = [ '123' ],
		view_input: TViewCreateInput[] = [
			{
				type: 'table',
				name: 'Table View',
				schema_units: [
					{
						type: 'title',
						name: 'Title'
					}
				]
			}
		];
	const cache: ICache = NotionCacheObject.createDefaultCache();
	const stack: IOperation[] = [];

	const createDataViewsMock = jest
			.spyOn(CreateData, 'views')
			.mockImplementationOnce(() => [ view_ids, CreateMaps.view() ]),
		logger = jest.fn();

	const [ collection_id, created_view_ids ] = await CreateData.collection(
		{
			name: [ [ 'Collection Name' ] ],
			schema: [
				{
					type: 'title',
					name: 'Title'
				}
			],
			views: view_input
		},
		'parent_id',
		{
			...default_nishan_arg,
			cache,
			stack,
			logger
		}
	);

	const output_collection = {
		id: collection_id,
		schema: {
			title: {
				type: 'title',
				name: 'Title'
			}
		},
		parent_id: 'parent_id',
		parent_table: 'block',
		alive: true,
		name: [ [ 'Collection Name' ] ],
		migrated: false,
		version: 0
	};

	expect(createDataViewsMock).toHaveBeenCalledTimes(1);
	expect(createDataViewsMock.mock.calls[0][0]).toStrictEqual({
		...output_collection,
		cover: undefined,
		icon: undefined
	});
	expect(createDataViewsMock.mock.calls[0][1]).toBe(view_input);
	expect(logger).toHaveBeenCalledWith('CREATE', 'collection', collection_id);
	expect(stack).toStrictEqual([ o.c.u(collection_id, [], output_collection) ]);
	expect(cache.collection.get(collection_id)).toStrictEqual(output_collection);
	expect(created_view_ids).toBe(view_ids);
});
