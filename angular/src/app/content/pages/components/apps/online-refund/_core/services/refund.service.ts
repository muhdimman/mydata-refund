import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { HttpUtilsService } from '../utils/http-utils.service';
import { RefundModel } from '../models/refund.model';
import { QueryParamsModel } from '../models/query-models/query-params.model';
import { QueryResultsModel } from '../models/query-models/query-results.model';
import { environment } from '../../../../../../../../environments/environment';
import { saveAs } from 'file-saver';

const API_URL = `${environment.apiUrl}`;
// Real REST API
@Injectable()
export class RefundService {
    lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'asc', '', 0, 10));

    constructor(private http: HttpClient,
        private httpUtils: HttpUtilsService) { }

    // createRefund(refund): Observable<RefundModel> {
    //     const httpHeaders = this.httpUtils.getHTTPHeaders();
    //     return this.http.post<RefundModel>(API_URL + '/refund-service/create', refund, { headers: httpHeaders });
    // }
    createRefund(refund): Observable<any> {
        const httpHeaders = this.httpUtils.getHTTPHeaders();
        return this.http.post(API_URL + '/refund-service/create', refund, { headers: httpHeaders });
    }

    getRefundById(refundId: number): Observable<RefundModel> {
        return this.http.get<RefundModel>(API_URL + `/refund-service/view?refundId=${refundId}`);
    }

    getCustomerById(userId: number): Observable<RefundModel> {
        return this.http.get<RefundModel>(API_URL + `/refund-service/customer?userId=${userId}`);
    }

    getBankList(): Observable<any> {
        return this.http.get<any>(API_URL + `/refund-service/getBankList`);
    }

    findRefund(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
        const httpHeaders = this.httpUtils.getHTTPHeaders();
        const httpParams = this.httpUtils.findRefundParams(queryParams);
        const url = API_URL + '/refund-service/list';
        return this.http.get<QueryResultsModel>(url, {
            headers: httpHeaders,
            params: httpParams
        });
    }

    findNewRefund(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
        const httpHeaders = this.httpUtils.getHTTPHeaders();
        const httpParams = this.httpUtils.findNewRefundParams(queryParams);
        const url = API_URL + '/refund-service/new/list';
        return this.http.get<QueryResultsModel>(url, {
            headers: httpHeaders,
            params: httpParams
        });
    }

    findRejectRefund(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
        const httpHeaders = this.httpUtils.getHTTPHeaders();
        const httpParams = this.httpUtils.findProcessRefundParams(queryParams);
        const url = API_URL + '/refund-service/reject/list';
        return this.http.get<QueryResultsModel>(url, {
            headers: httpHeaders,
            params: httpParams
        });
    }

    findProcessRefund(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
        const httpHeaders = this.httpUtils.getHTTPHeaders();
        const httpParams = this.httpUtils.findProcessRefundParams(queryParams);
        const url = API_URL + '/refund-service/process/list';
        return this.http.get<QueryResultsModel>(url, {
            headers: httpHeaders,
            params: httpParams
        });
    }

    findRequeryRefund(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
        const httpHeaders = this.httpUtils.getHTTPHeaders();
        const httpParams = this.httpUtils.findRequeryRefundParams(queryParams);
        const url = API_URL + '/refund-service/requery/list';
        return this.http.get<QueryResultsModel>(url, {
            headers: httpHeaders,
            params: httpParams
        });
    }

    findApprovedRefund(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
        const httpHeaders = this.httpUtils.getHTTPHeaders();
        const httpParams = this.httpUtils.findApprovedRefundParams(queryParams);
        const url = API_URL + '/refund-service/approved/list';
        return this.http.get<QueryResultsModel>(url, {
            headers: httpHeaders,
            params: httpParams
        });
    }

    exportExcel(queryParams: QueryParamsModel) {
        const httpHeaders = this.httpUtils.getHTTPHeaders();
        const httpParams = this.httpUtils.exportRefundParams(queryParams);
        const url = API_URL + '/refund-service/list/export';
        return this.http.get(url, {
            headers: httpHeaders,
            params: httpParams, responseType: "blob"
        })
        // .subscribe(res => {
        //     var res: Blob = new Blob([res], {
        //         type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8"
        //     });
        //     saveAs(res, "Refund-list.xlsx");
        // });
    }

    processRejectRefund(refund: RefundModel): Observable<any> {
        const httpHeaders = this.httpUtils.getHTTPHeaders();
        return this.http.put(API_URL + '/refund-service/reject', refund, { headers: httpHeaders });
    }

    processApproveRefund(refund: RefundModel): Observable<any> {
        const httpHeaders = this.httpUtils.getHTTPHeaders();
        return this.http.put(API_URL + '/refund-service/approve', refund, { headers: httpHeaders });
    }

    processRefund(refund: RefundModel): Observable<any> {
        const httpHeaders = this.httpUtils.getHTTPHeaders();
        return this.http.put(API_URL + '/refund-service/process', refund, { headers: httpHeaders });
    }

    processRefundList(refund): Observable<any> {
        const httpHeaders = this.httpUtils.getHTTPHeaders();
        return this.http.put(API_URL + '/refund-service/process', refund, { headers: httpHeaders });
    }

    processRequeryRefund(refund: RefundModel): Observable<any> {
        console.log('service processRequeryRefund')
        const httpHeaders = this.httpUtils.getHTTPHeaders();
        return this.http.put(API_URL + '/refund-service/requery', refund, { headers: httpHeaders });
    }

    processRenewRefund(refund: RefundModel): Observable<any> {
        const httpHeaders = this.httpUtils.getHTTPHeaders();
        return this.http.put(API_URL + '/refund-service/renew', refund, { headers: httpHeaders });
    }

    updateRefund(refund: RefundModel): Observable<any> {
        const httpHeaders = this.httpUtils.getHTTPHeaders();
        return this.http.put(API_URL + '/refund-service/update', refund, { headers: httpHeaders });
    }

    findRefundReport(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
        const httpHeaders = this.httpUtils.getHTTPHeaders();
        const httpParams = this.httpUtils.findRefundReportParams(queryParams);
        const url = API_URL + '/refund-service/report';
        return this.http.get<QueryResultsModel>(url, {
            headers: httpHeaders,
            params: httpParams
        });
    }

    getRefundReportWidget(): Observable<any> {
        console.log('widget aerice')
        return this.http.get<any>(API_URL + `/refund-service/report/widget`);
    }

}
