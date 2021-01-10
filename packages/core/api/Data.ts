import { TDataType, TData, Args, IOperation, TBlock, TOperationTable, ISpace, IUserRoot, ICollection, ISpaceView } from '@nishans/types';
import { TSubjectType, TMethodType, NishanArg, RepositionParams, UpdateCacheManuallyParam, FilterTypes, UpdateTypes, TBlockCreateInput } from '../types';
import { Operation, warn, nestedContentPopulate } from "../utils";
import Operations from "./Operations";

interface CommonIterateOptions<T> {
  child_ids: string[] | keyof T,
  subject_type: TSubjectType,
  multiple?: boolean
}

interface UpdateIterateOptions<T> extends CommonIterateOptions<T> { child_type?: TDataType, execute?: boolean, updateParent?: boolean };
interface DeleteIterateOptions<T> extends UpdateIterateOptions<T> {
  child_path?: keyof T
}

interface IterateOptions<T> {
  method: TMethodType,
  subject_type: TSubjectType,
  child_ids: string[] | keyof T,
  multiple?: boolean
}

interface GetIterateOptions<T> extends CommonIterateOptions<T> {
  method?: TMethodType,
}

/**
 * A class to update and control data specific stuffs
 * @noInheritDoc
 */

export default class Data<T extends TData> extends Operations {
  id: string;
  type: TDataType;
  protected listBeforeOp: (path: string[], args: Args) => IOperation;
  protected listAfterOp: (path: string[], args: Args) => IOperation;
  protected updateOp: (path: string[], args: Args) => IOperation;
  protected setOp: (path: string[], args: Args) => IOperation;
  protected listRemoveOp: (path: string[], args: Args) => IOperation;
  protected child_path: keyof T = "" as any;
  protected child_type: TDataType = "block" as any;
  #init_cache = false;
  #init_child_data = false;

  constructor(arg: NishanArg & { type: TDataType }) {
    super(arg);
    this.type = arg.type;
    this.id = arg.id;
    this.listBeforeOp = Operation[arg.type].listBefore.bind(this, this.id);
    this.listAfterOp = Operation[arg.type].listAfter.bind(this, this.id);
    this.updateOp = Operation[arg.type].update.bind(this, this.id)
    this.setOp = Operation[arg.type].set.bind(this, this.id)
    this.listRemoveOp = Operation[arg.type].listRemove.bind(this, this.id);
    this.#init_cache = false;
    this.#init_child_data = false;
  }

  protected getLastEditedProps() {
    return { last_edited_time: Date.now(), last_edited_by_table: "notion_user", last_edited_by: this.user_id }
  }

  #detectChildData = (type: TDataType, id: string) => {
    let child_type: TDataType = 'block', child_path = '';
    const data = this.cache[type].get(id) as TBlock;
    if (type === "block") {
      if (data.type === "page")
        child_path = "content" as any
      else if (data.type === "collection_view" || data.type === "collection_view_page") {
        child_path = "view_ids" as any
        child_type = "collection_view"
      }
    } else if (type === "space")
      child_path = "pages" as any;
    else if (type === "user_root") {
      child_path = "space_views" as any;
      child_type = "space_view"
    }
    else if (type === "collection")
      child_path = "template_pages" as any;
    else if (type === "space_view")
      child_path = "bookmarked_pages" as any;

    return [child_path, child_type] as [string, TDataType]
  }

  protected initializeChildData() {
    if (!this.#init_child_data) {
      const [child_path, child_type] = this.#detectChildData(this.type, this.id);
      this.child_path = child_path as any;
      this.child_type = child_type as any;
      this.#init_child_data = true;
    }
  }

  /**
   * Get the cached data using the current data id
   */
  getCachedData() {
    const data = this.cache[this.type].get(this.id);
    if ((data as any).alive === false)
      warn(`${this.type}:${this.id} has been deleted`);
    return data as T;
  }

  /**
   * Delete the cached data using the id
   */
  protected deleteCachedData() {
    this.cache[this.type].delete(this.id);
  }

  async updateCachedData(){
    await this.updateCacheManually([[this.id, this.type]])
  }

  /**
   * Adds the passed block id in the child container array of parent
   * @param $block_id id of the block to add
   * @param arg
   * @returns created Operation and a function to update the cache and the class data
   */
  protected addToChildArray(child_id: string, position: RepositionParams) {
    const data = this.getCachedData();
    this.initializeChildData();

    if (!data[this.child_path]) data[this.child_path] = [] as any;

    const container: string[] = data[this.child_path] as any;

    return this.#addToChildArrayUtil({ child_id, position, container, child_path: this.child_path as string, parent_id: this.id, parent_type: this.type })
  }

  #addToChildArrayUtil = (arg: { child_id: string, position: RepositionParams, container: string[], child_path: string, parent_type: TOperationTable, parent_id: string }) => {
    const { child_id, position, container, child_path, parent_type, parent_id } = arg;
    if (position !== undefined) {
      let where: "before" | "after" = "before", id = '';
      if (typeof position === "number") {
        id = container?.[position] ?? '';
        where = container.indexOf(child_id) > position ? "before" : "after";
        container.splice(position, 0, child_id);
      } else {
        where = position.position, id = position.id;
        container.splice(container.indexOf(position.id) + (position.position === "before" ? -1 : 1), 0, child_id);
      }

      return (Operation[parent_type] as any)[`list${where.charAt(0).toUpperCase() + where.substr(1)}`](parent_id, [child_path], {
        [where]: id,
        id: child_id
      }) as IOperation
    } else {
      container.push(child_id);
      return Operation[parent_type].listAfter(parent_id, [child_path], {
        after: '',
        id: child_id
      }) as IOperation;
    }
  }

  protected addToParentChildArray(child_id: string, position: RepositionParams) {
    const data = this.getCachedData() as any, parent = (this.cache as any)[data.parent_table].get(data.parent_id),
      child_path = this.#detectChildData(data.parent_table, parent.id)[0], container: string[] = parent[child_path] as any;

    return this.#addToChildArrayUtil({ child_id, position, container, child_path, parent_id: data.parent_id, parent_type: data.parent_table })
  }

  /**
   * Update the cache of the data using only the passed keys
   * @param arg
   * @param keys
   */
  updateCacheLocally(arg: Partial<T>, keys: ReadonlyArray<(keyof T)>) {
    const parent_data = this.getCachedData(), data = arg as T;

    const update = () =>{
      Object.entries(arg).forEach(([key, value])=>{
        if(keys.includes(key as keyof T))
          parent_data[key as keyof T] = value;
      })
    }

    return [this.updateOp(this.type === "user_settings" ? ["settings"] : [], data), update] as [IOperation, (() => void)]
  }

  protected async initializeCache() {
    if (!this.#init_cache) {

      const container: UpdateCacheManuallyParam = []
      if (this.type === "block") {
        const data = this.getCachedData() as TBlock;
        if (data.type === "page")
          container.push(...data.content);
        if (data.type === "collection_view" || data.type === "collection_view_page") {
          data.view_ids.map((view_id) => container.push([view_id, "collection_view"]))
          container.push([data.collection_id, "collection"])
        }
      } else if (this.type === "space") {
        const space = this.getCachedData() as ISpace;
        container.push(...space.pages);
        space.permissions.forEach((permission) => container.push([permission.user_id, "notion_user"]))
      } else if (this.type === "user_root")
        (this.getCachedData() as IUserRoot).space_views.map((space_view => container.push([space_view, "space_view"]))) ?? []
      else if (this.type === "collection") {
        container.push(...((this.getCachedData() as ICollection).template_pages ?? []))
        await this.queryCollection({
          collectionId: this.id,
          collectionViewId: "",
          query: {},
          loader: {
            type: "table",
            loadContentCover: true
          }
        })
      }
      else if (this.type === "space_view")
        container.push(...(this.getCachedData() as ISpaceView).bookmarked_pages ?? [])

      const non_cached: UpdateCacheManuallyParam = container.filter(info =>
        !Boolean(Array.isArray(info) ? this.cache[info[1]].get(info[0]) : this.cache.block.get(info))
      );

      if (non_cached.length !== 0)
        await this.updateCacheManually(non_cached);

      this.#init_cache = true;
    }
  }

  // cb1 is passed from the various iterate methods, cb2 is passed from the actual method
  #iterate = async<TD, RD = TD>(args: FilterTypes<TD> | UpdateTypes<TD, RD>, transform: ((id: string) => TD | undefined), options: IterateOptions<T>, cb1?: (id: string, data: TD, updated_data: RD | undefined, index: number) => any, cb2?: ((id: string, data: TD, updated_data: RD, index: number) => any)) => {
    await this.initializeCache();
    const matched_ids: TD[] = [], { multiple = true, method, subject_type } = options;
    const child_ids = ((Array.isArray(options.child_ids) ? options.child_ids : this.getCachedData()[options.child_ids]) ?? []) as string[];

    const iterateUtil = async (child_id: string, child_data: TD, updated_data: RD | undefined, index: number) => {
      cb1 && await cb1(child_id, child_data, updated_data, index);
      cb2 && await cb2(child_id, child_data, updated_data as any, index);
      this.logger && this.logger(method, subject_type, child_id);
      matched_ids.push(child_data);
    }

    if (Array.isArray(args)) {
      for (let index = 0; index < args.length; index++) {
        const arg = args[index];
        if (Array.isArray(arg)) {
          const [child_id, updated_data] = arg, child_data = transform(child_id), matches = child_ids.includes(child_id);
          if (!child_data) warn(`Child:${child_id} does not exist in the cache`);
          else if (!matches) warn(`Child:${child_id} is not a child of ${this.type}:${this.id}`);
          if (child_data && matches)
            await iterateUtil(child_id, child_data, updated_data, index)
        } else if (typeof arg === "string") {
          const child_id = arg, child_data = transform(child_id), matches = child_ids.includes(child_id);
          if (!child_data) warn(`Child:${child_id} does not exist in the cache`);
          else if (!matches) warn(`Child:${child_id} is not a child of ${this.type}:${this.id}`);
          if (child_data && matches)
            await iterateUtil(child_id, child_data, undefined, index)
        }
        if (!multiple && matched_ids.length === 1) break;
      }
    } else {
      for (let index = 0; index < child_ids.length; index++) {
        const child_id = child_ids[index], child_data = transform(child_id);
        if (!child_data) warn(`Child:${child_id} does not exist in the cache`);
        else {
          const matches = args ? await args(child_data, index) : true;
          if (child_data && matches)
            await iterateUtil(child_id, child_data, matches as RD, index)
        }
        if (!multiple && matched_ids.length === 1) break;
      }
    }

    return matched_ids;
  }

  protected async deleteIterate<TD>(args: FilterTypes<TD>, options: DeleteIterateOptions<T>, transform: ((id: string) => TD | undefined), cb?: (id: string, data: TD) => void | Promise<any>) {
    const { child_type, child_path, execute = this.defaultExecutionState } = options, updated_props = this.getLastEditedProps();
    const ops: IOperation[] = [], sync_records: UpdateCacheManuallyParam = [];
    const matched_ids = await this.#iterate(args, transform, {
      method: "DELETE",
      ...options
    }, (child_id) => {
      if (child_type) {
        ops.push(Operation[child_type].update(child_id, [], { alive: false, ...updated_props }));
        sync_records.push([child_id, child_type])
        if (typeof child_path === "string") ops.push(this.listRemoveOp([child_path], { id: child_id }));
      }
    }, cb);
    if (ops.length !== 0) {
      ops.push(Operation[this.type].update(this.id, [], { ...updated_props }));
      sync_records.push([this.id, this.type]);
    }
    await this.executeUtil(ops, sync_records, execute);
    return matched_ids;
  }

  protected async updateIterate<TD, RD>(args: UpdateTypes<TD, RD>, options: UpdateIterateOptions<T>, transform: ((id: string) => TD | undefined), cb?: (id: string, data: TD, updated_data: RD, index: number) => any) {
    const { child_type, execute = this.defaultExecutionState, updateParent = true } = options, updated_props = this.getLastEditedProps();
    const matched_ids: string[] = [], ops: IOperation[] = [], sync_records: UpdateCacheManuallyParam = [];

    await this.#iterate(args, transform, {
      method: "UPDATE",
      ...options
    }, (child_id, _, updated_data) => {
      if (child_type) {
        ops.push(Operation[child_type].update(child_id, [], { ...updated_data, ...updated_props }));
        sync_records.push([child_id, child_type])
      }
    }, cb);

    if (ops.length !== 0 && updateParent) {
      ops.push(Operation[this.type].update(this.id, [], { ...updated_props }));
      sync_records.push([this.id, this.type]);
    }
    await this.executeUtil(ops, sync_records, execute);
    return matched_ids;
  }

  protected async getIterate<RD>(args: FilterTypes<RD>, options: GetIterateOptions<T>, transform: ((id: string) => RD | undefined), cb?: (id: string, data: RD) => void | Promise<any>) {
    return await this.#iterate<RD>(args, transform, {
      method: 'READ',
      ...options,
    }, undefined, cb);
  }

  protected getProps() {
    return {
      token: this.token,
      interval: this.interval,
      user_id: this.user_id,
      shard_id: this.shard_id,
      space_id: this.space_id,
      cache: this.cache,
      logger: this.logger,
      defaultExecutionState: this.defaultExecutionState,
      ...this.getStackSyncRecords()
    }
  }

  protected async nestedContentPopulateAndExecute(options: TBlockCreateInput[], execute?: boolean) {
    const [ops, sync_records, block_map] = await nestedContentPopulate(options, this.id, this.type, this.getProps(), this.id);
    await this.executeUtil(ops, sync_records, execute);
    return block_map;
  }
}