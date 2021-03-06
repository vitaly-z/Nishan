import { INotionEndpoints } from '@nishans/types';
import { NotionEndpoints, NotionEndpointsOptions } from '../';

export const NotionEndpointsMutations = {
	async setPageNotificationsAsRead (
		params: INotionEndpoints['setPageNotificationsAsRead']['payload'],
		configs: NotionEndpointsOptions
	) {
		return await NotionEndpoints.Request.send<INotionEndpoints['setPageNotificationsAsRead']['response']>(
			'setPageNotificationsAsRead',
			params,
			configs
		);
	},
	async setSpaceNotificationsAsRead (
		params: INotionEndpoints['setSpaceNotificationsAsRead']['payload'],
		configs: NotionEndpointsOptions
	) {
		return await NotionEndpoints.Request.send<INotionEndpoints['setSpaceNotificationsAsRead']['response']>(
			'setSpaceNotificationsAsRead',
			params,
			configs
		);
	},
	async removeUsersFromSpace (
		params: INotionEndpoints['removeUsersFromSpace']['payload'],
		configs: NotionEndpointsOptions
	) {
		return await NotionEndpoints.Request.send<INotionEndpoints['removeUsersFromSpace']['response']>(
			'removeUsersFromSpace',
			params,
			configs
		);
	},
	async inviteGuestsToSpace (
		params: INotionEndpoints['inviteGuestsToSpace']['payload'],
		configs: NotionEndpointsOptions
	) {
		return await NotionEndpoints.Request.send<INotionEndpoints['inviteGuestsToSpace']['response']>(
			'inviteGuestsToSpace',
			params,
			configs
		);
	},
	async createSpace (params: INotionEndpoints['createSpace']['payload'], configs: NotionEndpointsOptions) {
		return await NotionEndpoints.Request.send<INotionEndpoints['createSpace']['response']>(
			'createSpace',
			params,
			configs
		);
	},
	async saveTransactions (params: INotionEndpoints['saveTransaction']['payload'], configs: NotionEndpointsOptions) {
		return await NotionEndpoints.Request.send<INotionEndpoints['saveTransaction']['response']>(
			'saveTransactions',
			params,
			configs
		);
	},
	async enqueueTask (params: INotionEndpoints['enqueueTask']['payload'], configs: NotionEndpointsOptions) {
		return await NotionEndpoints.Request.send<INotionEndpoints['enqueueTask']['response']>(
			'enqueueTask',
			params,
			configs
		);
	},
	async setBookmarkMetadata (
		params: INotionEndpoints['setBookmarkMetadata']['payload'],
		configs: NotionEndpointsOptions
	) {
		return await NotionEndpoints.Request.send<INotionEndpoints['setBookmarkMetadata']['response']>(
			'setBookmarkMetadata',
			params,
			configs
		);
	},
	async initializePageTemplate (
		params: INotionEndpoints['initializePageTemplate']['payload'],
		configs: NotionEndpointsOptions
	) {
		return await NotionEndpoints.Request.send<INotionEndpoints['initializePageTemplate']['response']>(
			'initializePageTemplate',
			params,
			configs
		);
	},
	async initializeGoogleDriveBlock (
		params: INotionEndpoints['initializeGoogleDriveBlock']['payload'],
		configs: NotionEndpointsOptions
	) {
		return await NotionEndpoints.Request.send<INotionEndpoints['initializeGoogleDriveBlock']['response']>(
			'initializeGoogleDriveBlock',
			params,
			configs
		);
	},
	async loginWithEmail (params: INotionEndpoints['loginWithEmail']['payload'], configs: NotionEndpointsOptions) {
		return await NotionEndpoints.Request.send<INotionEndpoints['loginWithEmail']['response']>(
			'loginWithEmail',
			params,
			configs
		);
	},
	async deleteBlocks (params: INotionEndpoints['deleteBlocks']['payload'], configs: NotionEndpointsOptions) {
		return await NotionEndpoints.Request.send<INotionEndpoints['deleteBlocks']['response']>(
			'deleteBlocks',
			params,
			configs
		);
	}
};
