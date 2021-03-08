import fs from 'fs';
import { dump } from 'js-yaml';
import path from 'path';
import { NotionSync } from '../';
import { LocalFileStructure } from '../types';

export async function storeInFile (filepath: string, result_data: LocalFileStructure) {
	const ext = path.extname(filepath);
	if (ext === '.json')
		await fs.promises.writeFile(
			filepath,
			JSON.stringify(NotionSync.ExtractData.extract(result_data), null, 2),
			'utf-8'
		);
	else if (ext === '.yaml' || ext === '.yml')
		await fs.promises.writeFile(filepath, dump(NotionSync.ExtractData.extract(result_data)), 'utf-8');
	else throw new Error('Unsupported output file extension. Use either json or yaml file when specifying the filepath');
}