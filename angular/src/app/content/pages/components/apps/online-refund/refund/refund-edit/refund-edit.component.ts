import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Location } from '@angular/common';
import { MatDialog } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, forkJoin, from, of, BehaviorSubject } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { RefundService } from '../../_core/services/index';
import { FileService } from '../../_core/services/index';
import { RefundModel } from '../../_core/models/refund.model';
import { TypesUtilsService } from '../../_core/utils/types-utils.service';
import { ListStateModel } from '../../_core/utils/list-state.model';
import { SubheaderService } from '../../../../../../../core/services/layout/subheader.service';
import { LayoutUtilsService, MessageType } from '../../_core/utils/layout-utils.service';
import { TokenStorage } from './../../../../../../../core/auth/token-storage.service';
import { RejectRefundDialogComponent } from '../refund-dialog/reject-refund.dialog.component';
import { saveAs } from 'file-saver';

@Component({
    selector: 'm-refund-edit',
    templateUrl: './refund-edit.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RefundEditComponent implements OnInit {
    refund: RefundModel;
    oldRefund: RefundModel;
    loadingSubject = new BehaviorSubject<boolean>(false);
    loading$ = this.loadingSubject.asObservable();
    refundForm: FormGroup;
    hasFormErrors: boolean = false;
    approvedBtn: boolean = false;
    requeryBtn: boolean = false;
    processBtn: boolean = false;
    rejectBtn: boolean = false;
    // cancelBtn: boolean = false;
    enableRemark: boolean = false;
    disableRemarkDesc: boolean = true;
    enableAction: boolean = false;
    actionValue: any = [];
    action1Remark: string = null;
    action2Remark: string = null;
    action3Remark: string = null;
    action4Remark: string = null;
    remarkList: any = [];
    timeline: any = [];
    orderList: any = [];
    viewLoading: boolean = false;
    // userRole: string;
    userFinance: boolean = false;
    userSupport: boolean = false;
    rejectReason: string = '';

    constructor(
        private activatedRoute: ActivatedRoute,
        private changeDetectorRef: ChangeDetectorRef,
        private router: Router,
        private refundService: RefundService,
        private fileService: FileService,
        private typesUtilsService: TypesUtilsService,
        private refundFB: FormBuilder,
        public dialog: MatDialog,
        private subheaderService: SubheaderService,
        private layoutUtilsService: LayoutUtilsService,
        private location: Location,
        private tokenStorage: TokenStorage
    ) { }

    ngOnInit() {
        this.loadingSubject.next(true);
        this.activatedRoute.queryParams.subscribe(params => {
            const id = +params.id;
            if (id && id > 0) {
                this.refundService.getRefundById(id).subscribe(res => {
                    this.refund = res['items'];
                    this.timeline = res['timeline'];
                    this.orderList = res['orderItem'];
                    // this.userRole = res['items'].userRole;
                    this.oldRefund = Object.assign({}, res);
                    this.initRefund();
                });
            } else {
                const newRefund = new RefundModel();
                newRefund.clear();
                this.refund = newRefund;
                this.oldRefund = Object.assign({}, newRefund);
                this.initRefund();
            }
        });
    }

    initRefund() {
        this.createForm();
        this.loadingSubject.next(false);
        this.timeline.forEach(item => {
            item.remarkList = []
            if (item.reference){
                JSON.parse(item.reference).forEach(element => {
                    if (element == 1){
                        item.remarkList.push({msg:'Invalid Account Name'})
                    }
                    if (element == 2){
                        item.remarkList.push({msg:'Invalid Account No'})
                    }
                    if (element == 3){
                        item.remarkList.push({msg:'Invalid IC No/Company OR Business Reg No (BRN)'})
                    }
                    if (element == 4){
                        item.remarkList.push({msg:item.referenceDesc})
                    }
                });
            }
        })
        this.subheaderService.setTitle('Refund');
        console.log('userRoles');
        console.log(JSON.parse(localStorage.getItem('userRoles'))[0]);
        if (JSON.parse(localStorage.getItem('userRoles'))[0] == 'FINANCE_BDW'){
            this.userFinance = true
        }
        if (JSON.parse(localStorage.getItem('userRoles'))[0] == 'SUPPORT_BDW'){
            this.userSupport = true
        }
        if (this.refund.status == 'New') {
            this.subheaderService.setBreadcrumbs([
                { title: 'New Refund', page: '/refund/new/list' },
                { title: 'View', page: '/refund/edit', queryParams: { id: this.refund.id } }
            ]);
            this.processBtn = true;
            return
        }
        if (this.refund.status == 'Processing') {
            this.subheaderService.setBreadcrumbs([
                { title: 'Processing Refund', page: '/refund/process/list' },
                { title: 'View', page: '/refund/edit', queryParams: { id: this.refund.id } }
            ]);
            this.enableAction = true;
            this.requeryBtn = true;
            this.approvedBtn = true;
            return
        }
        if (this.refund.status == 'Requery') {
            if (this.refund['remarkList']){
                this.remarkList = JSON.parse(this.refund['remarkList'])
                this.remarkList.forEach(element => {
                    if (element == 1){
                        this.action1Remark = 'Invalid Account Name';
                    }
                    if (element == 2){
                        this.action2Remark = 'Invalid Account No';
                    }
                    if (element == 3){
                        this.action3Remark = 'Invalid IC No/Company OR Business Reg No (BRN)';
                    }
                    if (element == 4){
                        this.action4Remark = this.refund['remarkDesc'];
                    }
                });
            }
            this.subheaderService.setBreadcrumbs([
                { title: 'Requery Refund', page: '/refund/requery/list' },
                { title: 'View', page: '/refund/edit', queryParams: { id: this.refund.id } }
            ]);
            // this.cancelBtn = true;
            this.enableRemark = true;
            return
        }
        if (this.refund.status == 'To Process') {
            this.subheaderService.setBreadcrumbs([
                { title: 'Requery Refund', page: '/refund/requery/list' },
                { title: 'View', page: '/refund/edit', queryParams: { id: this.refund.id } }
            ]);
            this.processBtn = true;
            return
        }
        if (this.refund.status == 'Approved') {
            this.subheaderService.setBreadcrumbs([
                { title: 'Approved Refund', page: '/refund/approved/list' },
                { title: 'View', page: '/refund/edit', queryParams: { id: this.refund.id } }
            ]);
            // this.cancelBtn = true;
            return
        }
    }

    createForm() {
        this.refundForm = this.refundFB.group({
            fullName: [this.refund.fullName, Validators.required],
            icNo: [this.refund.icNo, Validators.required],
            refundNumber: [this.refund.refundNumber],
            invoiceNumber: [this.orderList[0].invoiceNumber],
            companyName: [this.refund.companyName],
            companyNo: [this.refund.companyNo],
            username: [this.refund.username],
            email: [this.refund.email, [Validators.required, Validators.email]],
            phone: [this.refund.phone, Validators.required],
            bankName: [this.refund.bankName, Validators.required],
            accountName: [this.refund.accountName, Validators.required],
            accountNo: [this.refund.accountNo, Validators.required],
            accountRef: [this.refund.accountRef],
            refundAmount: [this.refund.refundAmount],
            reason: [this.refund.reason, Validators.required],
            remarkDesc: [this.refund.remarkDesc],
            remark: [this.refund.remark, Validators.required],
            requestedDate: [this.typesUtilsService.getStringFromDate(new Date(this.refund.requestedDate))],
            status: [this.refund.status]
        });
    }

    downloadRefund() {
        this.viewLoading = true;
        this.activatedRoute.queryParams.subscribe(params => {
            this.fileService.downloadRefund(params.id).subscribe(res => {
                var file: Blob = new Blob([res], {type:"application/pdf"});
                var filename = 'Refund_' + params.id + '.pdf';
                saveAs(file, filename);
                this.changeDetectorRef.markForCheck();
                this.viewLoading = false;
            });
        });
    }

    updateRemark(event:any, action:number){
        if (action == 1){
            if (event.target.checked){
                this.actionValue.push(action)
                this.action1Remark = 'Invalid Account Name';
            }
            else{
                this.actionValue.splice( this.actionValue.indexOf(action), 1 );
                this.action1Remark = null;
            }
        }
        if (action == 2){
            if (event.target.checked){
                this.actionValue.push(action)
                this.action2Remark = 'Invalid Account No';
            }
            else{
                this.actionValue.splice( this.actionValue.indexOf(action), 1 );
                this.action2Remark = null;
            }
        }
        if (action == 3){
            if (event.target.checked){
                this.actionValue.push(action)
                this.action3Remark = 'Invalid IC No/Company OR Business Reg No (BRN)';
            }
            else{
                this.actionValue.splice( this.actionValue.indexOf(action), 1 );
                this.action3Remark = null;
            }
        }
        if (action == 4){
            if (event.target.checked){
                this.actionValue.push(action)
                this.action4Remark = this.refundForm.value.remarkDesc;
                this.disableRemarkDesc = false;
            }
            else{
                this.actionValue.splice( this.actionValue.indexOf(action), 1 );
                this.action4Remark = null;
                this.disableRemarkDesc = true;
                this.refundForm.patchValue({
                    remarkDesc: null
                })
            }
        }
        var remarkList = null;
        this.enableRemark = false;
        if (this.actionValue.length > 0){
            this.enableRemark = true;
            remarkList = JSON.stringify(this.actionValue);
        }
        this.refundForm.patchValue({
            remark: remarkList
        })
    }

    onBlurMethod(){
        this.action4Remark = this.refundForm.value.remarkDesc;
    }

    goBack() {
        console.log('test')
        this.location.back()
    }

    refreshRefund(id = 0) {
        const _refreshUrl = '/refund/edit?id=' + id;
        this.router.navigateByUrl(_refreshUrl);

    }

    viewRejectedRefund() {
        const _redirectUrl = '/refund/reject/list';
        this.router.navigateByUrl(_redirectUrl);
    }

    viewApprovedRefund() {
        const _redirectUrl = '/refund/approved/list';
        this.router.navigateByUrl(_redirectUrl);
    }

    viewProcessRefund() {
        const _redirectUrl = '/refund/process/list';
        this.router.navigateByUrl(_redirectUrl);
    }

    viewRequeryRefund() {
        const _redirectUrl = '/refund/requery/list';
        this.router.navigateByUrl(_redirectUrl);
    }

    viewNewRefund() {
        const _redirectUrl = '/refund/new/list';
        this.router.navigateByUrl(_redirectUrl);
    }

    // viewRefundList() {
    // 	const _url = '/refund/list';
    // 	this.router.navigateByUrl(_url);
    // }

    // reset() {
    // 	this.refund = Object.assign({}, this.oldRefund);
    // 	this.createForm();
    // 	this.hasFormErrors = false;
    // 	this.refundForm.markAsPristine();
    //     this.refundForm.markAsUntouched();
    //     this.refundForm.updateValueAndValidity();
    // }

    rejectRefund(withBack: boolean = false) {

        const dialogRef = this.dialog.open(RejectRefundDialogComponent, {
            data: {  } ,
            width: '450px',
            disableClose: true
        });
        dialogRef.afterClosed().subscribe(res => {
            if (!res) {
                return;
            }
            console.log(res);
            this.rejectReason = res
            this.hasFormErrors = false;
            const controls = this.refundForm.controls;
    
            this.processRejectRefund(this.prepareRejectRefund(), withBack);
        });
    }

    approveRefund(withBack: boolean = false) {
        this.hasFormErrors = false;
        const controls = this.refundForm.controls;
        /** check form */
        // if (this.refundForm.invalid) {
        // 	Object.keys(controls).forEach(controlName =>
        // 		controls[controlName].markAsTouched()
        // 	);

        // 	this.hasFormErrors = true;
        // 	return;
        // }

        this.processApproveRefund(this.prepareApproveRefund(), withBack);
    }

    processRefund(withBack: boolean = false) {
        this.hasFormErrors = false;
        const controls = this.refundForm.controls;
        this.toProcessRefund(this.prepareProcessRefund(), withBack);
    }

    requeryRefund(withBack: boolean = false) {
        this.hasFormErrors = false;
        const controls = this.refundForm.controls;
        /** check form */
        console.log(this.refundForm)
        if (this.refundForm.invalid) {
            Object.keys(controls).forEach(controlName =>
                controls[controlName].markAsTouched()
            );

            this.hasFormErrors = true;
            return;
        }

        this.processRequeryRefund(this.prepareRequeryRefund(), withBack);
    }

    renewRefund(withBack: boolean = false) {
        this.hasFormErrors = false;
        this.processRenewRefund(this.prepareRenewRefund(), withBack);
    }

    prepareRejectRefund(): RefundModel {
        const controls = this.refundForm.controls;
        const _refund = new RefundModel();
        _refund.id = this.refund.id;
        _refund.refundNumber = this.refund.refundNumber;
        // _refund.status = 'Approved';
        _refund.remark = this.rejectReason;
        _refund._userId = parseInt(localStorage.getItem('userId'));
        _refund._updatedDate = this.typesUtilsService.getDateStringFromDate();
        _refund._isUpdated = true;
        return _refund;
    }

    prepareApproveRefund(): RefundModel {
        const controls = this.refundForm.controls;
        const _refund = new RefundModel();
        _refund.id = this.refund.id;
        _refund.refundNumber = this.refund.refundNumber;
        // _refund.status = 'Approved';
        // _refund.remark = 'Successfully Refund';
        _refund._userId = parseInt(localStorage.getItem('userId'));
        _refund._updatedDate = this.typesUtilsService.getDateStringFromDate();
        _refund._isUpdated = true;
        return _refund;
    }

    prepareProcessRefund(): RefundModel {
        const controls = this.refundForm.controls;
        const _refund = new RefundModel();
        _refund.id = this.refund.id;
        // _refund.status = 'Processing';
        // _refund.remark = '';
        _refund._userId = parseInt(localStorage.getItem('userId'));
        _refund._updatedDate = this.typesUtilsService.getDateStringFromDate();
        _refund._isUpdated = true;
        return _refund;
    }

    prepareRequeryRefund(): RefundModel {
        console.log('prepareRequeryRefund')
        const controls = this.refundForm.controls;
        const _refund = new RefundModel();
        _refund.id = this.refund.id;
        _refund.refundNumber = this.refund.refundNumber;
        // _refund.status = 'Requery';
        _refund.remark = controls['remark'].value;
        _refund.remarkDesc = controls['remarkDesc'].value;
        _refund._userId = parseInt(localStorage.getItem('userId'));
        _refund._updatedDate = this.typesUtilsService.getDateStringFromDate();
        _refund._isUpdated = true;
        return _refund;
    }

    prepareRenewRefund(): RefundModel {
        const controls = this.refundForm.controls;
        const _refund = new RefundModel();
        _refund.id = this.refund.id;
        // _refund.status = 'In Process';
        // _refund.remark = '';
        _refund._userId = parseInt(localStorage.getItem('userId'));
        _refund._updatedDate = this.typesUtilsService.getDateStringFromDate();
        _refund._isUpdated = true;
        return _refund;
    }

    prepareRefund(): RefundModel {
        const controls = this.refundForm.controls;
        const _refund = new RefundModel();
        _refund.id = this.refund.id;
        _refund.userId = parseInt(localStorage.getItem('userId'));
        _refund.accountId = parseInt(localStorage.getItem('accountId'));
        _refund.fullName = controls['fullName'].value;
        _refund.icNo = controls['icNo'].value;
        _refund.companyName = controls['companyName'].value;
        _refund.companyNo = controls['companyNo'].value;
        _refund.username = controls['username'].value;
        _refund.email = controls['email'].value;
        _refund.phone = controls['phone'].value;
        _refund.bankName = controls['bankName'].value;
        _refund.accountName = controls['accountName'].value;
        _refund.accountNo = controls['accountNo'].value;
        _refund.accountRef = controls['accountRef'].value;
        _refund.refundAmount = +controls['refundAmount'].value;
        _refund.reason = controls['reason'].value;
        _refund.remark = controls['remark'].value;
        _refund.status = controls['status'].value;
        _refund._userId = parseInt(localStorage.getItem('userId'));
        _refund._updatedDate = this.typesUtilsService.getDateStringFromDate();
        _refund._isUpdated = true;
        // _refund._createdDate = this.refund._createdDate;
        // _refund._updatedDate = this.refund._updatedDate;
        // _refund._updatedDate = this.typesUtilsService.getDateStringFromDate();
        // _refund._createdDate = this.refund.id > 0 ? _refund._createdDate : _refund._updatedDate;
        // _refund._isNew = this.refund.id > 0 ? false : true;
        // _refund._isUpdated = this.refund.id > 0;
        return _refund;
    }

    // addRefund(_refund: RefundModel, withBack: boolean = false) {
    // 	this.loadingSubject.next(true);
    // 	this.refundService.createRefund(_refund).subscribe(res => {
    // 		this.loadingSubject.next(false);
    // 		if (withBack) {
    // 			this.goBack(res.id);
    // 		} else {
    // 			const message = `Successfully submit your request.`;
    // 			this.layoutUtilsService.showActionNotification(message, MessageType.Create, 10000, true, false);
    // 			this.viewRefundList();
    // 		}
    // 	});
    // }

    processRejectRefund(_refund: RefundModel, withBack: boolean = false) {
        this.loadingSubject.next(true);
        // Update Product
        let tasks$ = [this.refundService.processRejectRefund(_refund)];

        forkJoin(tasks$).subscribe(res => {
            this.loadingSubject.next(false);
            if (withBack) {
                this.goBack();
            } else {
                const message = `Successfully reject refund.`;
                this.layoutUtilsService.showActionNotification(message, MessageType.Update, 10000, true, false);
                this.viewRejectedRefund();
            }
        });
    }

    processApproveRefund(_refund: RefundModel, withBack: boolean = false) {
        this.loadingSubject.next(true);
        // Update Product
        let tasks$ = [this.refundService.processApproveRefund(_refund)];

        forkJoin(tasks$).subscribe(res => {
            this.loadingSubject.next(false);
            if (withBack) {
                this.goBack();
            } else {
                const message = `Successfully update request.`;
                this.layoutUtilsService.showActionNotification(message, MessageType.Update, 10000, true, false);
                this.viewApprovedRefund();
            }
        });
    }

    toProcessRefund(_refund: RefundModel, withBack: boolean = false) {
        this.loadingSubject.next(true);
        let tasks$ = [this.refundService.processRefund(_refund)];
        forkJoin(tasks$).subscribe(res => {
            this.loadingSubject.next(false);
            if (withBack) {
                this.goBack();
            } else {
                const message = `Successfully process request.`;
                this.layoutUtilsService.showActionNotification(message, MessageType.Update, 10000, true, false);
                this.viewProcessRefund();
            }
        });
    }

    processRequeryRefund(_refund: RefundModel, withBack: boolean = false) {
        this.loadingSubject.next(true);
        // Update Product
        let tasks$ = [this.refundService.processRequeryRefund(_refund)];

        forkJoin(tasks$).subscribe(res => {
            this.loadingSubject.next(false);
            if (withBack) {
                this.goBack();
            } else {
                const message = `Successfully update request.`;
                this.layoutUtilsService.showActionNotification(message, MessageType.Update, 10000, true, false);
                this.viewRequeryRefund();
            }
        });
    }

    processRenewRefund(_refund: RefundModel, withBack: boolean = false) {
        this.loadingSubject.next(true);
        // Update Product
        let tasks$ = [this.refundService.processRenewRefund(_refund)];

        forkJoin(tasks$).subscribe(res => {
            this.loadingSubject.next(false);
            if (withBack) {
                this.goBack();
            } else {
                const message = `Successfully update request.`;
                this.layoutUtilsService.showActionNotification(message, MessageType.Update, 10000, true, false);
                this.viewNewRefund();
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
    getItemStatusString(status: string): string {
        switch (status) {
            case 'In Process':
                return 'New';
            case 'Requery':
                return 'Requery';
            case 'Approved':
                return 'Approved';
            case 'Completed':
                return 'Completed';
        }
        return '';
    }

    getItemCssClassByStatus(status: string): string {
        switch (status) {
            case 'In Process':
                return 'primary';
            case 'Requery':
                return 'warning';
            case 'Approved':
                return 'success';
            case 'Completed':
                return 'brand';
        }
        return '';
    }

    getTimelineSideByStatus(status: string): string {
        if (status == 'New'){
            return 'left'
        }
        else{
            return 'right'
        }
    }

    getTimelineStateByStatus(status: string): string {
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
        }
        return '';
    }

    onAlertClose($event) {
        this.hasFormErrors = false;
    }
}
