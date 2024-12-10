import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, forkJoin, from, of, BehaviorSubject } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { RefundService } from '../../_core/services/index';
import { FileService } from '../../_core/services/index';
import { RefundModel } from '../../_core/models/refund.model';
import { TypesUtilsService } from '../../_core/utils/types-utils.service';
import { SubheaderService } from '../../../../../../../core/services/layout/subheader.service';
import { LayoutUtilsService, MessageType } from '../../_core/utils/layout-utils.service';
import { FileUploader} from 'ng2-file-upload';
import { environment } from '../../../../../../../../environments/environment';
import { saveAs } from 'file-saver';

const uploadUrl = `${environment.apiUrl}/file/upload`;

@Component({
    selector: 'm-refund-view',
    templateUrl: './refund-view.component.html',
    // providers:[FileService],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RefundViewComponent implements OnInit {
    refund: RefundModel;
    oldRefund: RefundModel;
    loadingSubject = new BehaviorSubject<boolean>(false);
    loading$ = this.loadingSubject.asObservable();
    refundForm: FormGroup;
    hasFormErrors: boolean = false;
    disableForm: boolean = false;
    statusString: string;
    remarkString: string;
    remarkIndicator: boolean = false;
    uploader: FileUploader = new FileUploader({url:uploadUrl, headers:[{name:'userId', value:localStorage.getItem('userId')}]});
    attachmentList:any = [];
    bankList:any = [];
    // required attachment
    // noAttachments: boolean = false;
    remarkAction1: string;
    remarkAction2: string;
    remarkAction3: string;
    remarkAction4: string;
    remarkList: any = [];
    remarkAction: any = [];
    accountNameErr: string;
    accountNoErr: string;
    accountRefErr: string;
    viewLoading: boolean = false;

    constructor(
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private refundService: RefundService,
        private fileService: FileService,
        private typesUtilsService: TypesUtilsService,
        private refundFB: FormBuilder,
        public dialog: MatDialog,
        private subheaderService: SubheaderService,
        private layoutUtilsService: LayoutUtilsService,
        private changeDetectorRef: ChangeDetectorRef
    ) { 
        this.uploader.onBeforeUploadItem = (item) => {
            item.withCredentials = false;
        }

        this.uploader.onCompleteItem = (item:any, response:any , status:any, headers:any) => {
            this.attachmentList.push(JSON.parse(response));
        }
    }

    removeFile(item: any){
        console.log('sadsadd')
        this.fileService.removeFile(item).subscribe(res => {
            console.log(res)
            if (res.success){
                this.refreshRefund()
                this.changeDetectorRef.markForCheck()
                const message = `Successfully remove attachment.`;
                this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, false);
            }
            else{
                const message = `Unsuccessfully remove attachment.`;
                this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, false);
            }
        })
    }

    ngOnInit() {
        this.loadingSubject.next(true);
        this.refundService.getRefundById(parseInt(localStorage.getItem('refundId'))).subscribe(res => {
            this.refund = res['items'];
            this.oldRefund = Object.assign({}, res);
            // this.remarkList = JSON.parse(res['items'].remarkList)
            this.initRefund();
            this.getBankList();
        });
    }

    initRefund() {
        this.createForm();
        this.loadingSubject.next(false);
        this.subheaderService.setTitle('Refund');
        this.subheaderService.setBreadcrumbs([
            { title: 'Refund Request', page: '/refund/request' },
            { title: 'View', page: '/refund/view' }
        ]);
        if (this.refund['remarkList']){
            this.remarkList = JSON.parse(this.refund['remarkList'])
            this.remarkList.forEach(element => {
                if (element == 1){
                    this.remarkAction1 = 'Invalid Account Name';
                }
                if (element == 2){
                    this.remarkAction2 = 'Invalid Account No';
                }
                if (element == 3){
                    this.remarkAction3 = 'Invalid IC No/Company OR Business Reg No (BRN)';
                }
                if (element == 4){
                    this.remarkAction4 = this.refund['remarkDesc'];
                }
            });
        }
        if (this.refund.status == 'New'){
            this.disableForm = true;
            this.statusString = 'New Request';
            return
        }
        if (this.refund.status == 'Processing'){
            this.disableForm = true;
            this.statusString = 'In Process';
            return
        }
        if (this.refund.status == 'Requery'){
            this.remarkString = this.refund.remark;
            this.remarkIndicator = true;
            this.statusString = 'Requery';
            return
        }
        if (this.refund.status == 'To Process'){
            this.disableForm = true;
            this.statusString = 'In Process';
            return
        }
        if (this.refund.status == 'Approved'){
            this.disableForm = true;
            this.statusString = 'Approved';
            return
        }
    }

    getBankList() {
        this.refundService.getBankList().subscribe(res => {
            this.bankList = res['items'];
            console.log('this.bankList');
            console.log(this.bankList);
        });
    }

    createForm() {
        this.refundForm = this.refundFB.group({
            userId: [this.refund.userId],
            fullName: [this.refund.fullName, Validators.required],
            icNo: [this.refund.icNo, Validators.required],
            companyName: [this.refund.companyName],
            companyNo: [this.refund.companyNo],
            username: [this.refund.username],
            email: [this.refund.email, [Validators.required, Validators.email]],
            phone: [this.refund.phone, Validators.required],
            bankName: [this.refund.bankName, Validators.required],
            accountName: [this.refund.accountName, Validators.required],
            accountNo: [this.refund.accountNo, Validators.required],
            accountRef: [this.refund.accountRef, Validators.required],
            prepaidBalance: [this.refund.prepaidBalance],
            reason: [this.refund.reason, Validators.required],
            remark: [this.refund.remark],
            status: [this.refund.status],
            requestedDate: [this.typesUtilsService.getStringFromDate(new Date(this.refund.requestedDate))]
        });
    }

    downloadRefund() {
        this.viewLoading = true;
        // this.activatedRoute.queryParams.subscribe(params => {
            this.fileService.downloadRefund(parseInt(localStorage.getItem('refundId'))).subscribe(res => {
                var file: Blob = new Blob([res], {type:"application/pdf"});
                var filename = 'Refund_' + localStorage.getItem('refundId') + '.pdf';
                saveAs(file, filename);
                this.changeDetectorRef.markForCheck();
                this.viewLoading = false;
            });
        // });
    }

    goBack() {
        let _backUrl = 'refund/request';
        this.router.navigateByUrl(_backUrl);
    }

    viewRefund() {
        const _url = '/refund/request';
        this.router.navigateByUrl(_url);
    }

    refreshRefund() {
        this.refundService.getRefundById(parseInt(localStorage.getItem('refundId'))).subscribe(res => {
            this.refund = res['items'];
            this.oldRefund = Object.assign({}, res);
            this.initRefund();
        });
    }

    reSubmit(withBack: boolean = false) {
        this.hasFormErrors = false;
        const controls = this.refundForm.controls;
        console.log(this.refundForm)
        /** check form */
        if (this.remarkAction1 && controls['accountName'].value == this.refund.accountName){
            this.refundForm.controls.accountName.markAsPristine();
            this.hasFormErrors = true;
            return
        }
        if (this.remarkAction2 && controls['accountNo'].value == this.refund.accountNo){
            this.refundForm.controls.accountNo.markAsPristine();
            this.hasFormErrors = true;
            return
        }
        if (this.remarkAction3 && controls['accountRef'].value == this.refund.accountRef){
            this.refundForm.controls.accountRef.markAsPristine();
            this.hasFormErrors = true;
            return
        }
        if (this.refundForm.invalid) {
            Object.keys(controls).forEach(controlName =>
                controls[controlName].markAsTouched()
            );
            // required attachment
            // if (this.uploader.queue.length == 0 && this.refund.files.length == 0){
            //     this.noAttachments = true;
            // }
            this.hasFormErrors = true;
            return;
        }
        // required attachment
        // if (this.uploader.queue.length == 0 && this.refund.files.length == 0){
        //     this.noAttachments = true;
        //     this.hasFormErrors = true;
        //     return
        // }

        this.updateRefund(this.prepareRefund(), withBack);
    }


    prepareRefund(): RefundModel {
        const controls = this.refundForm.controls;
        const _refund = new RefundModel();
        _refund.id = this.refund.id;
        _refund.userId = controls['userId'].value;
        // _refund.accountId = parseInt(localStorage.getItem('accountId'));
        _refund.fullName = controls['fullName'].value;
        _refund.icNo = controls['icNo'].value;
        _refund.companyName = controls['companyName'].value;
        _refund.companyNo = controls['companyNo'].value;
        // _refund.username = controls['username'].value;
        _refund.email = controls['email'].value;
        _refund.phone = controls['phone'].value;
        _refund.bankName = controls['bankName'].value;
        _refund.accountName = controls['accountName'].value;
        _refund.accountNo = controls['accountNo'].value;
        _refund.accountRef = controls['accountRef'].value;
        // _refund.prepaidBalance = +controls['prepaidBalance'].value;
        _refund.reason = controls['reason'].value;
        // _refund.status = 'New';
        // _refund.remark = 'Update Request';
        _refund._userId = parseInt(localStorage.getItem('userId'));
        _refund._updatedDate = this.typesUtilsService.getDateStringFromDate();
        _refund._isUpdated = true;
        return _refund;
    }

    updateRefund(_refund: RefundModel, withBack: boolean = false) {
        this.loadingSubject.next(true);
        this.refundService.updateRefund(_refund).subscribe(res => {
            this.loadingSubject.next(false);
            if (withBack) {
                this.goBack();
            } else {
                const message = `Successfully update request.`;
                this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, false);
                this.viewRefund();
            }
        });
    }

    getComponentTitle() {
        if (this.refund) {
            let result = 'View Request - ' + this.refund.fullName;
            return result;
        }
        else {
            let result = 'View Request';
            return result;
        }
    }

    onAlertClose($event) {
        this.hasFormErrors = false;
    }

}
