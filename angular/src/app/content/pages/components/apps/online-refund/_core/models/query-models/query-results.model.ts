export class QueryResultsModel {
	// fields
	items: any[];
	totalCount: number;
	summary: any[];
	errorMessage: string;

	constructor(_items: any[] = [], _summary: any[] = [], _errorMessage: string = '') {
		this.items = _items;
		this.summary = _summary;
		this.totalCount = _items.length;
	}
}
