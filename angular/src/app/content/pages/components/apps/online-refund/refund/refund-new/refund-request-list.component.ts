import { Component, OnInit, ElementRef, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { saveAs } from 'file-saver';
// Material
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
// RXJS
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { fromEvent, merge } from 'rxjs';
// Services
import { RefundService } from '../../_core/services/index';
import { FileService } from '../../_core/services/index';
import { LayoutUtilsService, MessageType } from '../../_core/utils/layout-utils.service';
import { SubheaderService } from '../../../../../../../core/services/layout/subheader.service';
// Models
import { RefundModel } from '../../_core/models/refund.model';
import { RefundDataSource } from '../../_core/models/data-sources/refund.datasource';
import { QueryParamsModel } from '../../_core/models/query-models/query-params.model';

// Table with EDIT item in new page
// ARTICLE for table with sort/filter/paginator
// https://blog.angular-university.io/angular-material-data-table/
// https://v5.material.angular.io/components/table/overview
// https://v5.material.angular.io/components/sort/overview
// https://v5.material.angular.io/components/table/overview#sorting
// https://www.youtube.com/watch?v=NSt9CI3BXv4
@Component({
    selector: 'm-refund-list',
    templateUrl: './refund-request-list.component.html',
    styleUrls: ['./refund-request-list.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RefundRequestListComponent implements OnInit {
    // Table fields
    dataSource: RefundDataSource;
    displayedColumns = ['requestedDate', 'fullName', 'username', 'prepaidBalance', 'status', 'remark', 'actions'];
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    // Filter fields
    @ViewChild('searchInput') searchInput: ElementRef;
    filterStatus: string = '';
    filterStatusEnable: boolean = false;
    filterEnable: boolean = false;
    // Selection
    selection = new SelectionModel<RefundModel>(true, []);
    refundResult: RefundModel[] = [];
    viewLoading: boolean = false;

    constructor(
        private refundService: RefundService,
        private fileService: FileService,
        private changeDetectorRef: ChangeDetectorRef,
        public dialog: MatDialog,
        private route: ActivatedRoute,
        private subheaderService: SubheaderService,
        private layoutUtilsService: LayoutUtilsService
    ) { }

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
                    this.loadRequestRefundList();
                })
            )
            .subscribe();

        // Set title to page breadCrumbs
        this.subheaderService.setTitle('Refund');
        this.subheaderService.setBreadcrumbs([
            { title: 'Refund Request', page: '/refund/request' }
        ]);
        // Init DataSource
        this.dataSource = new RefundDataSource(this.refundService);
        let queryParams = new QueryParamsModel({});
        // Read from URL itemId, for restore previous state
        this.route.queryParams.subscribe(params => {
            if (params.id) {
                queryParams = this.refundService.lastFilter$.getValue();
                // this.restoreState(queryParams, +params.id);
            }
            // First load
            // this.dataSource.loadNewRefund(queryParams);
            this.loadRequestRefundList();
        });
        this.dataSource.entitySubject.subscribe(res => {
            this.refundResult = res
        });
    }

    loadRequestRefundList() {
        this.selection.clear();
        const queryParams = new QueryParamsModel(
            this.filterConfiguration(),
            this.sort.direction,
            this.sort.active,
            this.paginator.pageIndex + 1,
            this.paginator.pageSize
        );
        this.dataSource.loadRefund(queryParams);
    }

    setLocalStorage(id){
        localStorage.setItem('refundId', JSON.stringify(id));
    }

    /** FILTRATION */
    filterConfiguration(): any {
        const filter: any = {};
        filter.userId = parseInt(localStorage.getItem('userId'))

        return filter;
    }

    downloadRefund(refundId) {
        this.viewLoading = true;
        this.fileService.downloadRefund(refundId).subscribe(res => {
            var file: Blob = new Blob([res], { type: "application/pdf" });
            var filename = 'Refund_' + refundId + '.pdf';
            saveAs(file, filename);
            this.changeDetectorRef.markForCheck();
            this.viewLoading = false;
        });
    }

    /* UI */
    getItemStatusString(status: string): string {
        switch (status) {
            case 'New':
                return 'New Request';
            case 'Processing':
                return 'In Process';
            case 'Requery':
                return 'Requery';
            case 'To Process':
                return 'In Process';
            case 'Approved':
                return 'Approved';
        }
        return '';
    }

    getItemCssClassByStatus(status: string): string {
        switch (status) {
            case 'New':
                return 'primary';
            case 'Processing':
                return 'primary';
            case 'Requery':
                return 'warning';
            case 'To Process':
                return 'primary';
            case 'Approved':
                return 'success';
        }
        return '';
    }

    getComponentTitle() {
        let result = 'Refund Request';
        return result;
    }
}
