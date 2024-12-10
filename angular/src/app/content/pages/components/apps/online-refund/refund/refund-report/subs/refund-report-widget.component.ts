import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, forkJoin, from, of, BehaviorSubject } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { RefundService } from '../../../_core/services/index';
import { RefundModel } from '../../../_core/models/refund.model';
import { TypesUtilsService } from '../../../_core/utils/types-utils.service';
import { SubheaderService } from '../../../../../../../../core/services/layout/subheader.service';
import { LayoutUtilsService, MessageType } from '../../../_core/utils/layout-utils.service';

@Component({
    selector: 'm-refund-report-widget',
    templateUrl: './refund-report-widget.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RefundReportWidgetComponent implements OnInit {
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
    noAttachments: boolean = false;
    widget: any;
    // selectedTab: number = 1;

    constructor(
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private refundService: RefundService,
        private typesUtilsService: TypesUtilsService,
        private refundFB: FormBuilder,
        public dialog: MatDialog,
        private subheaderService: SubheaderService,
        private layoutUtilsService: LayoutUtilsService,
        private changeDetectorRef: ChangeDetectorRef
    ) {}

    ngOnInit() {
        console.log('this.statsdassds')
        // this.selectedTab = 1;
        this.loadingSubject.next(true);
        this.refundService.getRefundReportWidget().subscribe(res => {
            this.widget = res['widget'];
            // this.oldRefund = Object.assign({}, res);
            // this.init();
        });
    }

    // init() {
        // this.createForm();
        // this.loadingSubject.next(false);
        // this.subheaderService.setTitle('Refund');
        // this.subheaderService.setBreadcrumbs([
        //     { title: 'Refund Request', page: '/refund/request' },
        //     { title: 'View', page: '/refund/view' }
        // ]);
        // if (this.refund.status == 'New'){
        //     this.disableForm = true;
        //     this.statusString = 'In Process';
        //     return
        // }
        // if (this.refund.status == 'Processing'){
        //     this.disableForm = true;
        //     this.statusString = 'In Process';
        //     return
        // }
        // if (this.refund.status == 'Requery'){
        //     this.remarkString = this.refund.remark;
        //     this.remarkIndicator = true;
        //     this.statusString = 'Requery';
        //     return
        // }
        // if (this.refund.status == 'To Process'){
        //     this.disableForm = true;
        //     this.statusString = 'In Process';
        //     return
        // }
        // if (this.refund.status == 'Approved'){
        //     this.disableForm = true;
        //     this.statusString = 'Approved';
        //     return
        // }
    // }

    // createForm() {
    //     this.refundForm = this.refundFB.group({
    //         fullName: [this.refund.fullName, Validators.required],
    //         icNo: [this.refund.icNo, Validators.required],
    //         companyName: [this.refund.companyName],
    //         companyNo: [this.refund.companyNo],
    //         username: [this.refund.username],
    //         email: [this.refund.email, [Validators.required, Validators.email]],
    //         phone: [this.refund.phone, Validators.required],
    //         bankName: [this.refund.bankName, Validators.required],
    //         accountName: [this.refund.accountName, Validators.required],
    //         accountNo: [this.refund.accountNo, Validators.required],
    //         accountRef: [this.refund.accountRef],
    //         prepaidBalance: [this.refund.prepaidBalance],
    //         reason: [this.refund.reason, Validators.required],
    //         remark: [this.refund.remark],
    //         status: [this.refund.status],
    //         requestedDate: [this.typesUtilsService.getDateStringFromDate(new Date(this.refund.requestedDate))]
    //     });
    // }

    // goBack() {
	// 	let _backUrl = 'refund/request';
	// 	this.router.navigateByUrl(_backUrl);
    // }
    
    // viewRefund() {
	// 	const _url = '/refund/request';
	// 	this.router.navigateByUrl(_url);
    // }
    
    // refreshRefund() {
	// 	this.refundService.getRefundById(parseInt(localStorage.getItem('refundId'))).subscribe(res => {
    //         this.refund = res['items'];
    //         this.oldRefund = Object.assign({}, res);
    //         this.initRefund();
    //     });
	// }
	
	// prepareRefund(): RefundModel {
	// 	const controls = this.refundForm.controls;
	// 	const _refund = new RefundModel();
	// 	_refund.id = this.refund.id;
	// 	_refund.userId = parseInt(localStorage.getItem('userId'));
	// 	_refund.accountId = parseInt(localStorage.getItem('accountId'));
	// 	_refund.fullName = controls['fullName'].value;
	// 	_refund.icNo = controls['icNo'].value;
	// 	_refund.companyName = controls['companyName'].value;
	// 	_refund.companyNo = controls['companyNo'].value;
	// 	_refund.username = controls['username'].value;
	// 	_refund.email = controls['email'].value;
	// 	_refund.phone = controls['phone'].value;
	// 	_refund.bankName = controls['bankName'].value;
	// 	_refund.accountName = controls['accountName'].value;
	// 	_refund.accountNo = controls['accountNo'].value;
	// 	_refund.accountRef = controls['accountRef'].value;
	// 	_refund.prepaidBalance = +controls['prepaidBalance'].value;
    //     _refund.reason = controls['reason'].value;
    //     _refund.status = 'To Process';
    //     _refund.remark = 'Update Request';
    //     _refund._userId = parseInt(localStorage.getItem('userId'));
    //     _refund._updatedDate = this.typesUtilsService.getDateStringFromDate();
    //     _refund._isUpdated = true;
	// 	return _refund;
	// }

	// updateRefund(_refund: RefundModel, withBack: boolean = false) {
	// 	this.loadingSubject.next(true);
	// 	this.refundService.updateRefund(_refund).subscribe(res => {
	// 		this.loadingSubject.next(false);
	// 		if (withBack) {
	// 			this.goBack();
	// 		} else {
	// 			const message = `Successfully update request.`;
    //             this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, false);
	// 			this.viewRefund();
	// 		}
	// 	});
    // }

    // getComponentTitle() {
    //     if (this.refund){
    //         let result = 'View Request - ' + this.refund.fullName;
    //         return result;
    //     }
    //     else{
    //         let result = 'View Request';
    //         return result;
    //     } 
    // }

    // onAlertClose($event) {
    //     this.hasFormErrors = false;
    // }

}
