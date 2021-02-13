import { NotionRequestConfigs, NotionHeaders, UpdateCacheManuallyParam, Queries, constructNotionHeaders } from '@nishans/endpoints';
import { ICollection, ISpace, ISpaceView, IUserRoot, RecordMap, SyncRecordValues, TBlock, TDataType } from '@nishans/types';
import { validateCache } from '../utils';
import { CtorArgs, ICache } from './types';

export class NotionCache {
	cache: ICache;
	token: string;
	interval: number;
	headers: NotionHeaders;
	user_id?: string;

	constructor ({ cache, token, interval, user_id }: Omit<CtorArgs, 'shard_id' | 'space_id'>) {
    // Validate the cache first if its passed, otherwise store a default one
		this.cache = (cache && validateCache(cache)) || {
			block: new Map(),
			collection: new Map(),
			space: new Map(),
			collection_view: new Map(),
			notion_user: new Map(),
			space_view: new Map(),
			user_root: new Map(),
			user_settings: new Map()
		};
    if(!token)
      throw new Error(`Token not provided`);
		this.headers = constructNotionHeaders({token, user_id});
		this.token = token;
		this.interval = interval ?? 500;
		this.user_id = user_id;
	}

  /**
   * Get the internal configs passed to the constructor
   */
	getConfigs = (): NotionRequestConfigs => {
		return {
			token: this.token,
			user_id: this.user_id,
			interval: this.interval
		};
	};

	/**
   * Save all the items of a recordMap in internal cache
   * @param recordMap The recordMap to save to cache
   */
	saveToCache (recordMap: Partial<RecordMap>) {
    // Loop through each of the cache keys
    // Store all the values of that particular key thats present in the recordMap in the cache 
		([
      "block",
      "collection",
      "space",
      "collection_view",
      "notion_user",
      "space_view",
      "user_root",
      "user_settings",
    ] as ((keyof ICache)[])).forEach((key) => {
			if (recordMap[key])
				Object.entries(recordMap[key] as Record<any, any>).forEach(([ record_id, record_value ]) => {
					this.cache[key].set(record_id, record_value.value);
				});
		});
	}

  /**
   * Returns the id and data_type tuple passed that is not present in the cache
   * @param update_cache_param Array of tuple of id and data_type to look for in the cache
   * @returns
   */
	returnNonCachedData (update_cache_param: UpdateCacheManuallyParam): UpdateCacheManuallyParam {
		return update_cache_param.filter(
			(info) => !Boolean(this.cache[info[1]].get(info[0]))
		);
  }
  
  /**
   * Initialize the cache by sending a post request to the `getSpaces` endpoint 
   */
  async initializeCache(){
    const data = await Queries.getSpaces({token: this.token, interval: 0});
    // Contains a set of external notion user that has access to the space 
    const external_notion_users: Set<string> = new Set();

    // Going through each recordMap and storing them in cache
    Object.values(data).forEach(recordMap => {
      // Getting the user_root id
      const user_root_id = Object.keys(recordMap.user_root)[0];
      // In the space's permission check if external user has any access to the space, 
      // if it does and its not the user_root it needs to be added to the set created earlier 
      Object.values(recordMap.space).forEach(space => space.value.permissions.forEach(permission =>
        permission.user_id && permission.user_id !== user_root_id && external_notion_users.add(permission.user_id)
      ))
      this.saveToCache(recordMap)
    });

    // If the number of external_notion_users in not zero continue
    if(external_notion_users.size !== 0){
      // Send a api request to syncRecordValues endpoint to fetch the external notion users
      const { recordMap } = await Queries.syncRecordValues({
        requests: Array.from(external_notion_users.values()).map(external_notion_user => ({ table: "notion_user", id: external_notion_user, version: -1 }))
      }, {token: this.token, interval: 0});
      // Save the fetched external notion user to cache
      this.saveToCache(recordMap);
    }
  }

  #syncRecordValues = async (args: UpdateCacheManuallyParam) => {
    const sync_record_values: SyncRecordValues[] = [];
    // Iterate through the passed array argument and construct sync_record argument
    args.forEach((arg) => {
      sync_record_values.push({ id: arg[0], table: arg[1], version: 0 });
    });

    // fetch and save notion data to cache
    if (sync_record_values.length){
      const {recordMap} = await Queries.syncRecordValues({ requests: sync_record_values }, {token: this.token, interval: 0});
      this.saveToCache(recordMap);
    }
  }

  /**
   * Fetches data from notions server and store within the cache
   * @param args The array of id and data_type tuple to fetch and store
   */
	async updateCacheManually (args: UpdateCacheManuallyParam) {
		await this.#syncRecordValues(args);
	}

  /**
   * Fetches notion data only if it doesnt exist in the cache
   * @param arg Array of id and data_type tuple to fetch from notion and store
   */
	async updateCacheIfNotPresent (args: UpdateCacheManuallyParam) {
		await this.#syncRecordValues(args.filter(arg=>!this.cache[arg[1]].get(arg[0])));
  }
  
  /**
   * Initialize cache of specific type of data
   * @param id The id of the data
   * @param type The type of data
   */
  async initializeCacheForSpecificData(id: string, type: TDataType){
    const container: UpdateCacheManuallyParam = [];
    if (type === "block") {
      const data = this.cache[type].get(id) as TBlock;
      // If the type is block and page, fetch its content
      if (data.type === "page")
        data.content.forEach(id=>container.push([id, "block"]));
      // If the type is block and cvp or cv, fetch its views and collection
      if (data.type === "collection_view" || data.type === "collection_view_page") {
        data.view_ids.map((view_id) => container.push([view_id, "collection_view"]))
        container.push([data.collection_id, "collection"])
      }
    } else if (type === "space") {
      // If the type is space, fetch its pages and notion_user
      const data = this.cache[type].get(id) as ISpace;
      data.pages.forEach(id=>container.push([id, "block"]));
      data.permissions.forEach((permission) => container.push([permission.user_id, "notion_user"]))
    } else if (type === "user_root"){
      // If the type is user_root, fetch its space_view
      const data = this.cache[type].get(id) as IUserRoot;
      data.space_views.map((space_view => container.push([space_view, "space_view"])))
    }
    else if (type === "collection") {
      // If the type is collection, fetch its template_pages and all of its row_pages
      const data = this.cache[type].get(id) as ICollection;
      if(data.template_pages)
        data.template_pages.forEach(id=>container.push([id, "block"]));
      // Fetching the row_pages of collection
      const {recordMap} = await Queries.queryCollection({
        collectionId: id,
        collectionViewId: "",
        query: {},
        loader: {
          type: "table",
          loadContentCover: true
        }
      }, {
        token: this.token,
        interval: 0
      })
      this.saveToCache(recordMap);
    }
    else if (type === "space_view"){
      // If the type is space_view, fetch its bookmarked_pages
      const data = this.cache[type].get(id) as ISpaceView;
      if(data.bookmarked_pages)
        data.bookmarked_pages.forEach(id=>container.push([id, "block"]));
    }
    else
      throw new Error(`${type} data is not supported`);

    // Filters data that doesnt exist in the cache
    const non_cached = this.returnNonCachedData(container);
    
    await this.updateCacheManually(non_cached);

    // If the block is a page, for all the collection block contents, fetch the collection attached with it as well
    if(type === "block"){
      const data = this.cache[type].get(id) as TBlock;
      if(data.type === "page"){
        const collection_blocks_ids: UpdateCacheManuallyParam = [];
        for (let index = 0; index < data.content.length; index++) {
          const content_id = data.content[index],
            content = this.cache.block.get(content_id)
          if(content && (content.type === "collection_view_page" || content.type === "collection_view"))
            collection_blocks_ids.push([content.collection_id, "collection"])
        }
        await this.updateCacheManually(this.returnNonCachedData(collection_blocks_ids));
      }
    }
  }
}