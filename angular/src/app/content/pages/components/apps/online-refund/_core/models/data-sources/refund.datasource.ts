import { of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { RefundService } from '../../services/index';
import { QueryParamsModel } from '../query-models/query-params.model';
import { BaseDataSource } from './_base.datasource';
import { QueryResultsModel } from '../query-models/query-results.model';

export class RefundDataSource extends BaseDataSource {
    constructor(private refundService: RefundService) {
        super();
    }

    loadNewRefund(queryParams: QueryParamsModel) {
        this.refundService.lastFilter$.next(queryParams);
        this.loadingSubject.next(true);

        this.refundService.findNewRefund(queryParams)
            .pipe(
                tap(res => {
                    console.log("res")
                    console.log(res)
                    this.entitySubject.next(res.items);
                    this.paginatorTotalSubject.next(res.totalCount);
                }),
                catchError(err => of(new QueryResultsModel([], err))),
                finalize(() => this.loadingSubject.next(false))
            ).subscribe();
    }

    loadrejectRefund(queryParams: QueryParamsModel) {
        this.refundService.lastFilter$.next(queryParams);
        this.loadingSubject.next(true);

        this.refundService.findRejectRefund(queryParams)
            .pipe(
                tap(res => {
                    console.log("res")
                    console.log(res)
                    this.entitySubject.next(res.items);
                    this.paginatorTotalSubject.next(res.totalCount);
                }),
                catchError(err => of(new QueryResultsModel([], err))),
                finalize(() => this.loadingSubject.next(false))
            ).subscribe();
    }

    loadProcessRefund(queryParams: QueryParamsModel) {
        this.refundService.lastFilter$.next(queryParams);
        this.loadingSubject.next(true);

        this.refundService.findProcessRefund(queryParams)
            .pipe(
                tap(res => {
                    console.log("res")
                    console.log(res)
                    this.entitySubject.next(res.items);
                    this.paginatorTotalSubject.next(res.totalCount);
                }),
                catchError(err => of(new QueryResultsModel([], err))),
                finalize(() => this.loadingSubject.next(false))
            ).subscribe();
    }

    loadRequeryRefund(queryParams: QueryParamsModel) {
        this.refundService.lastFilter$.next(queryParams);
        this.loadingSubject.next(true);

        this.refundService.findRequeryRefund(queryParams)
            .pipe(
                tap(res => {
                    console.log("res")
                    console.log(res)
                    this.entitySubject.next(res.items);
                    this.paginatorTotalSubject.next(res.totalCount);
                }),
                catchError(err => of(new QueryResultsModel([], err))),
                finalize(() => this.loadingSubject.next(false))
            ).subscribe();
    }

    loadApprovedRefund(queryParams: QueryParamsModel) {
        this.refundService.lastFilter$.next(queryParams);
        this.loadingSubject.next(true);

        this.refundService.findApprovedRefund(queryParams)
            .pipe(
                tap(res => {
                    console.log("res")
                    console.log(res)
                    this.entitySubject.next(res.items);
                    this.paginatorTotalSubject.next(res.totalCount);
                }),
                catchError(err => of(new QueryResultsModel([], err))),
                finalize(() => this.loadingSubject.next(false))
            ).subscribe();
    }

    loadRefundReport(queryParams: QueryParamsModel) {
        this.refundService.lastFilter$.next(queryParams);
        this.loadingSubject.next(true);

        this.refundService.findRefundReport(queryParams)
            .pipe(
                tap(res => {
                    this.entitySubject.next(res.items);
                    this.summarySubject.next(res.summary);
                    this.paginatorTotalSubject.next(res.totalCount);
                }),
                catchError(err => of(new QueryResultsModel([], err))),
                finalize(() => this.loadingSubject.next(false))
            ).subscribe();
    }

    loadRefund(queryParams: QueryParamsModel) {
        this.refundService.lastFilter$.next(queryParams);
        this.loadingSubject.next(true);

        this.refundService.findRefund(queryParams)
            .pipe(
                tap(res => {
                    console.log("res")
                    console.log(res)
                    this.entitySubject.next(res.items);
                    this.paginatorTotalSubject.next(res.totalCount);
                }),
                catchError(err => of(new QueryResultsModel([], err))),
                finalize(() => this.loadingSubject.next(false))
            ).subscribe();
    }
}
