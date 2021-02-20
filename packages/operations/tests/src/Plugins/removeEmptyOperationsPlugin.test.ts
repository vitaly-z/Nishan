import { IOperation } from '@nishans/types';
import { NotionOperationsPlugin } from '../../../src';
import { NotionOperationsPluginOptions } from '../../../src/Plugins/Options';

afterEach(() => {
	jest.restoreAllMocks();
});

describe('removeEmptyOperationsPlugin', () => {
	it(`Should work for empty args`, () => {
		const args = {},
			operation: IOperation = {
				args,
				command: 'update',
				id: '123',
				path: [],
				table: 'block'
			};

		const skipPluginOptionMock = jest
			.spyOn(NotionOperationsPluginOptions, 'skip')
			.mockImplementationOnce(() => operation);

		expect(
			NotionOperationsPlugin.removeEmptyOperations({
				skip: undefined
			})(operation)
		).toStrictEqual(false);

		expect(skipPluginOptionMock).toHaveBeenCalledWith(operation, undefined);
	});

	it(`Should work for undefined args`, () => {
		const args = undefined,
			operation: IOperation = {
				args,
				command: 'update',
				id: '123',
				path: [],
				table: 'block'
			};

		const skipPluginOptionMock = jest
			.spyOn(NotionOperationsPluginOptions, 'skip')
			.mockImplementationOnce(() => operation);

		expect(
			NotionOperationsPlugin.removeEmptyOperations({
				skip: undefined
			})(operation)
		).toStrictEqual(false);

		expect(skipPluginOptionMock).toHaveBeenCalledWith(operation, undefined);
	});

	it(`Should work for non empty args`, () => {
		const args = {
				a: 1
			},
			operation: IOperation = {
				args,
				command: 'update',
				id: '123',
				path: [],
				table: 'block'
			};

		const skipPluginOptionMock = jest
			.spyOn(NotionOperationsPluginOptions, 'skip')
			.mockImplementationOnce(() => operation);

		expect(
			NotionOperationsPlugin.removeEmptyOperations({
				skip: undefined
			})(operation)
		).toStrictEqual(operation);
		expect(skipPluginOptionMock).toHaveBeenCalledWith(operation, undefined);
	});
});