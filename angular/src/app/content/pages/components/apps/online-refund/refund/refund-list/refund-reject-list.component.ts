import { Component, OnInit, ElementRef, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { saveAs } from 'file-saver';
// Material
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
// RXJS
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { fromEvent, merge } from 'rxjs';
// Services
import { RefundService } from '../../_core/services/index';
import { FileService } from '../../_core/services/index';
import { TypesUtilsService } from '../../_core/utils/types-utils.service';
import { LayoutUtilsService, MessageType } from '../../_core/utils/layout-utils.service';
import { SubheaderService } from '../../../../../../../core/services/layout/subheader.service';
// Models
import { RefundModel } from '../../_core/models/refund.model';
import { RefundDataSource } from '../../_core/models/data-sources/refund.datasource';
import { QueryParamsModel } from '../../_core/models/query-models/query-params.model';
// Providers
import { AppDateAdapter, APP_DATE_FORMATS } from '../../_core/utils/format-datepicker';

@Component({
    selector: 'm-refund-reject-list',
    templateUrl: './refund-list.component.html',
    styleUrls: ['./refund-list.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        { provide: DateAdapter, useClass: AppDateAdapter },
        { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS }
    ]
})
export class RefundRejectListComponent implements OnInit {
    // Table fields
    dataSource: RefundDataSource;
    displayedColumns = ['requestedDate','refundNumber', 'fullName', 'refundAmount', 'status', 'remark', 'actions'];
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    // Filter fields
    @ViewChild('searchInput') searchInput: ElementRef;
    @ViewChild('dateFromInput') dateFromInput: ElementRef;
    @ViewChild('dateToInput') dateToInput: ElementRef;
    filterStatus: string = '';
    filterEnable: boolean = true;
    exportEnable: boolean = true;
    // Selection
    selection = new SelectionModel<RefundModel>(true, []);
    refundResult: RefundModel[] = [];
    viewLoading: boolean = false;

    constructor(
        private refundService: RefundService,
        private fileService: FileService,
        private changeDetectorRef: ChangeDetectorRef,
        private router: Router,
        public dialog: MatDialog,
        private route: ActivatedRoute,
        private subheaderService: SubheaderService,
        private typesUtilsService: TypesUtilsService,
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
                    this.loadRejectRefundList();
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
                    this.loadRejectRefundList();
                })
            )
            .subscribe();

        // Set title to page breadCrumbs
        this.subheaderService.setTitle('Refund');
        this.subheaderService.setBreadcrumbs([
            { title: 'New Refund', page: '/refund/new/list' }
        ]);
        // Init DataSource
        this.dataSource = new RefundDataSource(this.refundService);
        this.loadRejectRefundList();
        this.dataSource.entitySubject.subscribe(res => {
            this.refundResult = res
        });
    }

    changeEvent() {
        this.paginator.pageIndex = 0;
        this.loadRejectRefundList();
    }

    loadRejectRefundList() {
        this.selection.clear();
        const queryParams = new QueryParamsModel(
            this.filterConfiguration(),
            this.sort.direction,
            this.sort.active,
            this.paginator.pageIndex + 1,
            this.paginator.pageSize
        );
        this.dataSource.loadrejectRefund(queryParams);
    }

    exportExcel() {
        this.viewLoading = true;
        this.selection.clear();
        const queryParams = new QueryParamsModel(
            this.filterConfiguration(),
            this.sort.direction,
            this.sort.active
        );
        this.refundService.exportExcel(queryParams).subscribe(res => {
            var res: Blob = new Blob([res], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8"
            });
            saveAs(res, "Refund-list.xlsx");
            this.changeDetectorRef.markForCheck();
            this.viewLoading = false;
        });
    }

    /** FILTRATION */
    filterConfiguration(): any {
        const filter: any = {};
        const searchUser: string = this.searchInput.nativeElement.value;
        const dateFrom: string = this.typesUtilsService.getDateStringFromString(this.dateFromInput.nativeElement.value);
        const dateTo: string = this.typesUtilsService.getDateStringFromString(this.dateToInput.nativeElement.value);

        filter.searchUser = searchUser;
        filter.dateFrom = dateFrom;
        filter.dateTo = dateTo;
        filter.status = 'New';

        return filter;
    }

    downloadRefund(refundId) {
        this.viewLoading = true;
        this.fileService.downloadRefund(refundId).subscribe(res => {
            var file: Blob = new Blob([res], {type:"application/pdf"});
            var filename = 'Refund_' + refundId + '.pdf';
            saveAs(file, filename);
            this.changeDetectorRef.markForCheck();
            this.viewLoading = false;
        });
    }

    processRefund(refundId){
        this.refundService.processRefundList({
            id: refundId,
            _userId: parseInt(localStorage.getItem('userId')),
            _updatedDate: this.typesUtilsService.getDateStringFromDate()
        }).subscribe(res => {
            const message = `Successfully process request.`;
            this.layoutUtilsService.showActionNotification(message, MessageType.Update, 10000, true, false);
            this.changeDetectorRef.markForCheck();
            this.loadRejectRefundList();
        });
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
    
    getComponentTitle() {
        let result = 'Rejected Refund List';
        return result;
    }
}
