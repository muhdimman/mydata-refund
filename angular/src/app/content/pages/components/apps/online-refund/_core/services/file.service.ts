import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpUtilsService } from '../utils/http-utils.service';
import { environment } from '../../../../../../../../environments/environment';

const API_URL = `${environment.apiUrl}`;

@Injectable()

export class FileService {

    constructor(
        private http: HttpClient,
        private httpUtils: HttpUtilsService
    ) { }


    removeFile(item: any): Observable<any> {
        const httpHeaders = this.httpUtils.getHTTPHeaders();
        return this.http.put(API_URL + '/file/remove', {
            fileId: item.id,
            fileName: item.fileName,
            attachmentId: item.refundAttachmentId
        }, { headers: httpHeaders });
    }

    downloadRefund(refundId: number) {
        const url = API_URL + `/file/downloadRefund?refundId=${refundId}`;
        return this.http.get(url, { responseType: "blob" })
    }

}