import { Component, OnInit, ElementRef, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
// Material
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
// RXJS
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { fromEvent, merge } from 'rxjs';
// Services
import { RefundService } from '../../../_core/services/index';
import { LayoutUtilsService, MessageType } from '../../../_core/utils/layout-utils.service';
import { SubheaderService } from '../../../../../../../../core/services/layout/subheader.service';
// Models
import { RefundModel } from '../../../_core/models/refund.model';
import { RefundDataSource } from '../../../_core/models/data-sources/refund.datasource';
import { QueryParamsModel } from '../../../_core/models/query-models/query-params.model';

// Table with EDIT item in new page
// ARTICLE for table with sort/filter/paginator
// https://blog.angular-university.io/angular-material-data-table/
// https://v5.material.angular.io/components/table/overview
// https://v5.material.angular.io/components/sort/overview
// https://v5.material.angular.io/components/table/overview#sorting
// https://www.youtube.com/watch?v=NSt9CI3BXv4
@Component({
	selector: 'm-refund-report-table',
	templateUrl: './refund-report-table.component.html',
	styleUrls: ['./refund-report-table.component.css'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class RefundReportTableComponent implements OnInit {
	// Table fields
	dataSource: RefundDataSource;
	displayedColumns = ['requestedDate','refundNumber', 'fullName', 'username', 'status', 'aging', 'refundAmount'];
	@ViewChild(MatPaginator) paginator: MatPaginator;
	@ViewChild(MatSort) sort: MatSort;
	// Filter fields
	@ViewChild('searchInput') searchInput: ElementRef;
	filterStatus: string = '';
	// Selection
	selection = new SelectionModel<RefundModel>(true, []);
	refundResult: RefundModel[] = [];
	refundSummary: any = {};
	selectedTab: number = 0;

	constructor(private refundService: RefundService,
		public dialog: MatDialog,
		private route: ActivatedRoute,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService) { }

	/** LOAD DATA */
	ngOnInit() {
		// If the user changes the sort order, reset back to the first page.
		this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

		/* Data load will be triggered in two cases:
		- when a pagination event occurs => this.paginator.page
		- when a sort event occurs => this.sort.sortChange
		**/
		merge(this.sort.sortChange, this.paginator.page)
			.pipe(
				tap(() => {
					this.loadRefundReport();
				})
			)
			.subscribe();

		// Filtration, bind to searchInput
		fromEvent(this.searchInput.nativeElement, 'keyup')
			.pipe(
				debounceTime(150),
				distinctUntilChanged(),
				tap(() => {
					this.paginator.pageIndex = 0;
					this.loadRefundReport();
				})
			)
			.subscribe();
		this.selectedTab = 0;
		this.dataSource = new RefundDataSource(this.refundService);
		let queryParams = new QueryParamsModel({});
		this.dataSource.loadRefundReport(queryParams);
		this.dataSource.entitySubject.subscribe(res => {
			this.refundResult = res
		});
		this.dataSource.summarySubject.subscribe(res => {
			this.refundSummary = res
		});
	}

	loadRefundReport() {
		this.selection.clear();
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex + 1,
			this.paginator.pageSize
		);
		this.dataSource.loadRefundReport(queryParams);
	}

	/** FILTRATION */
	filterConfiguration(): any {
		const filter: any = {};
		const searchUser: string = this.searchInput.nativeElement.value;

		if (this.filterStatus) {
			filter.status = this.filterStatus;
		}
		filter.searchUser = searchUser;

		return filter;
	}

	/* UI */
	getItemStatusString(status: string): string {
		switch (status) {
			case 'New':
				return 'New';
			case 'Processing':
				return 'Processing';
			case 'Requery':
				return 'Requery';
			case 'To Process':
				return 'To Process';
			case 'Approved':
				return 'Approved';
			case 'Rejected':
				return 'Rejected';
		}
		return '';
	}

	getItemCssClassByStatus(status: string): string {
		switch (status) {
			case 'New':
				return 'primary';
			case 'Processing':
				return 'info';
			case 'Requery':
				return 'warning';
			case 'To Process':
				return 'brand';
			case 'Approved':
				return 'success';
			case 'Rejected':
				return 'danger';
		}
		return '';
	}

	// getComponentTitle() {
	// 	let result = 'Refund Report';
	// 	return result;
	// }
}
