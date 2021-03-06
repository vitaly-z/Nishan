import { NotionCache, NotionCacheConfigs } from '@nishans/cache';
import { TCollectionBlock } from '@nishans/types';
import { notionUserResolvers } from './notionUserResolvers';

export const commonBlockResolvers = {
	parent: async ({ parent_id, parent_table }: TCollectionBlock, _: any, ctx: NotionCacheConfigs) =>
		await NotionCache.fetchDataOrReturnCached(parent_table, parent_id, ctx),
	space: async ({ space_id }: TCollectionBlock, _: any, ctx: NotionCacheConfigs) =>
		await NotionCache.fetchDataOrReturnCached('space', space_id, ctx),
	...notionUserResolvers
};
