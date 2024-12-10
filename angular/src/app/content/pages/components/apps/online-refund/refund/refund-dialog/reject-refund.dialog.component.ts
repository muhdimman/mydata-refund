import {Component, Inject, Input, OnInit} from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from 'lodash';

@Component({
	selector: 'm-reject-refund-dialog',
	templateUrl: './reject-refund.dialog.component.html'
})
export class RejectRefundDialogComponent implements OnInit {
	
	viewLoading: boolean = false;
	loadingAfterSubmit: boolean = false;
	isSubmited: boolean = false;
	userRole: string
	reason: string = ''


	constructor(
		public dialogRef: MatDialogRef<RejectRefundDialogComponent>,
		private router: Router,
		@Inject(MAT_DIALOG_DATA) public data: any
	) {
		this.userRole = this.data.userRole;
	}

	ngOnInit() {
		/* Server loading imitation. Remove this on real code */
		// this.viewLoading = true;
		// setTimeout(() => {
		// 	this.viewLoading = false;
		// }, 500);
	}


	closeDialog() {
		this.dialogRef.close();
		// console.log(this.reason);
	}
	
	rejectDialog() {
		this.isSubmited = true
		
		if(this.reason=='') return

		this.dialogRef.close(this.reason);
	}
}
