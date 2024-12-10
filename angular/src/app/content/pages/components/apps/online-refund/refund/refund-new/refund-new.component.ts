import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, forkJoin, from, of, BehaviorSubject } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { RefundService } from '../../_core/services/index';
import { RefundModel } from '../../_core/models/refund.model';
import { TypesUtilsService } from '../../_core/utils/types-utils.service';
import { SubheaderService } from '../../../../../../../core/services/layout/subheader.service';
import { LayoutUtilsService, MessageType } from '../../_core/utils/layout-utils.service';
import { FileSelectDirective, FileUploader} from 'ng2-file-upload';
import { RefundBalanceCheckDialogComponent } from '../refund-dialog/refund-balance-check.dialog.component';
import { UserRoleCheckDialogComponent } from '../refund-dialog/user-role-check.dialog.component';
import { environment } from '../../../../../../../../environments/environment';

const uploadUrl = `${environment.apiUrl}/file/upload`;

@Component({
    selector: 'm-refund-edit',
    templateUrl: '../refund-new/refund-new.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RefundNewComponent implements OnInit {
    refund: RefundModel;
    oldRefund: RefundModel;
    loadingSubject = new BehaviorSubject<boolean>(false);
    loading$ = this.loadingSubject.asObservable();
    refundForm: FormGroup;
    hasFormErrors: boolean = false;
    prepaidBalanceValue: number;
    userRole: string;
    declaration: boolean = false;
    noDeclaration: boolean = false;
    uploader:FileUploader = new FileUploader({url:uploadUrl, headers:[{name:'userId', value:localStorage.getItem('userId')}]});
    attachmentList:any = [];
    bankList:any = [];
    disableButton: boolean = false;

    constructor(
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private refundService: RefundService,
        private typesUtilsService: TypesUtilsService,
        private refundFB: FormBuilder,
        public dialog: MatDialog,
        private subheaderService: SubheaderService,
        private layoutUtilsService: LayoutUtilsService
    ) {
        this.uploader.onBeforeUploadItem = (item) => {
            item.withCredentials = false;
        }

        this.uploader.onCompleteItem = (item:any, response:any , status:any, headers:any) => {
            this.attachmentList.push(JSON.parse(response));
        }
    }

    ngOnInit() {
        this.loadingSubject.next(true);
        this.refundService.getCustomerById(parseInt(localStorage.getItem('userId'))).subscribe(res => {
            console.log('value customer')
            console.log(res['items'])
            this.refund = res['items'];
            this.oldRefund = Object.assign({}, res['items']);
            this.prepaidBalanceValue = res['items'].prepaidBalance;
            this.userRole = res['items'].role;
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
            { title: 'New', page: '/refund/new' }
        ]);
        // checking for account admin
        // if (this.userRole != 'Account Admin'){
        //     const dialogRef = this.dialog.open(UserRoleCheckDialogComponent, {
        //         data: {
        //             userRole: this.userRole
        //         },
        //         width: '450px',
        //         disableClose: true
        //     });
        //     dialogRef.afterClosed();
        // }
        if (this.prepaidBalanceValue < 1.00){
            console.log('less rm1')
            console.log(this.prepaidBalanceValue)
            const dialogRef = this.dialog.open(RefundBalanceCheckDialogComponent, {
                data: {
                    prepaidBalance: this.prepaidBalanceValue
                },
                width: '650px',
                disableClose: true
            });
            dialogRef.afterClosed();
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
            // userId: [this.refund.userId],
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
            status: [this.refund.status]
        });
    }

    goBack() {
        let _backUrl = 'refund/request';
        this.router.navigateByUrl(_backUrl);
    }

    viewRefund() {
        const _url = '/refund/request';
        this.router.navigateByUrl(_url);
    }

    reset() {
        this.refund = Object.assign({}, this.oldRefund);
        this.createForm();
        this.hasFormErrors = false;
        this.refundForm.markAsPristine();
        this.refundForm.markAsUntouched();
        this.refundForm.updateValueAndValidity();
    }

    agreeDeclaration(event:any){
        console.log('agreeDeclaration');
        console.log(this.declaration);
        console.log(this.noDeclaration);
        if (event.target.checked){
            this.declaration = true;
            this.noDeclaration = false;
        }
        else{
            this.declaration = false;
            this.noDeclaration = true;
        }
        console.log('after click agreeDeclaration');
        console.log(this.declaration);
        console.log(this.noDeclaration);
    }

    onSumbit(withBack: boolean = false) {
        this.disableButton = true;
        this.hasFormErrors = false;
        console.log('onSumbit');
        console.log(this.hasFormErrors);
        // check prepaid balance
        if (this.prepaidBalanceValue < 1.00){
            const dialogRef = this.dialog.open(RefundBalanceCheckDialogComponent, {
                data: {
                    prepaidBalance: this.prepaidBalanceValue
                },
                width: '450px',
                disableClose: true
            });
            dialogRef.afterClosed();
            this.hasFormErrors = true;
            this.disableButton = false;
            return;
        }
        const controls = this.refundForm.controls;
        /** check form */
        if (this.refundForm.invalid) {
            console.log('check form');
            console.log(this.refundForm);
            Object.keys(controls).forEach(controlName =>
                controls[controlName].markAsTouched()
            );
            // required attachment
            // if (this.uploader.queue.length == 0){
            //     this.noAttachments = true;
            // }
            if (this.declaration == false){
                this.noDeclaration = true;
            }
            this.hasFormErrors = true;
            this.disableButton = false;
            return;
        }
        // required attachment
        // if (this.uploader.queue.length == 0){
        //     this.noAttachments = true;
        //     this.hasFormErrors = true;
        //     return
        // }
        if (this.declaration == false){
            this.hasFormErrors = true;
            this.noDeclaration = true;
            this.disableButton = false;
            return
        }
        this.addRefund(this.prepareRefund(), withBack);
    }

    prepareRefund(): RefundModel {
        const controls = this.refundForm.controls;
        const _refund = new RefundModel();
        _refund.id = this.refund.id;
        // _refund.userId = controls['userId'].value;
        _refund.userId = this.refund.userId;
        _refund.fullName = controls['fullName'].value;
        _refund.icNo = controls['icNo'].value;
        _refund.companyName = controls['companyName'].value;
        _refund.companyNo = controls['companyNo'].value;
        _refund.username = controls['username'].value;
        _refund.email = controls['email'].value;
        _refund.phone = controls['phone'].value;
        _refund.bankName = controls['bankName'].value;
        _refund.accountId = this.refund.accountId;
        _refund.accountName = controls['accountName'].value;
        _refund.accountNo = controls['accountNo'].value;
        _refund.accountRef = controls['accountRef'].value;
        _refund.reason = controls['reason'].value;
        _refund.attachmentId = this.refund.userId;
        // _refund.status = 'New';
        _refund._userId = parseInt(localStorage.getItem('userId'));
        _refund._createdDate = this.typesUtilsService.getDateStringFromDate();
        _refund._isNew = true;
        return _refund;
    }

    addRefund(_refund: RefundModel, withBack: boolean = false) {
        this.loadingSubject.next(true);
        this.refundService.createRefund(_refund).subscribe(res => {
            this.loadingSubject.next(false);
            if (withBack) {
                this.reset();
            } else {
                // const message = `Successfully submit your request.`;
                // this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, false);
                // localStorage.setItem('refundId', res['refundId']);
                // this.viewRefund();
                if (res.success){
                    const message = `Successfully submit your request.`;
                    this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, false);
                    localStorage.setItem('refundId', res.refundId);
                    this.viewRefund();
                }
                else{
                    const message = `Unsuccessful to submit your request.`;
                    this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, false);
                }
            }
        });
    }

    getComponentTitle() {
        let result = 'Refund Request';
        return result;
    }

    onAlertClose($event) {
        this.hasFormErrors = false;
    }
}
