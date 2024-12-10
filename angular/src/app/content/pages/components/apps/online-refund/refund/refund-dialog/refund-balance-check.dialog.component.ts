import {Component, Inject, Input, OnInit} from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from 'lodash';

@Component({
	selector: 'm-refund-balance-check-dialog',
	templateUrl: './refund-balance-check.dialog.component.html'
})
export class RefundBalanceCheckDialogComponent implements OnInit {
	
	viewLoading: boolean = false;
	loadingAfterSubmit: boolean = false;
	prepaidBalance: number


	constructor(
		public dialogRef: MatDialogRef<RefundBalanceCheckDialogComponent>,
		private router: Router,
		@Inject(MAT_DIALOG_DATA) public data: any
	) {
		this.prepaidBalance = this.data.prepaidBalance;
	}

	ngOnInit() {
		/* Server loading imitation. Remove this on real code */
		this.viewLoading = true;
		setTimeout(() => {
			this.viewLoading = false;
		}, 500);
	}


	closeDialog() {
		this.dialogRef.close();
		// this.router.navigateByUrl('refund/request');
	}
}
