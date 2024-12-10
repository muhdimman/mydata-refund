import {Component, Inject, Input, OnInit} from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from 'lodash';

@Component({
	selector: 'm-user-role-check-dialog',
	templateUrl: './user-role-check.dialog.component.html'
})
export class UserRoleCheckDialogComponent implements OnInit {
	
	viewLoading: boolean = false;
	loadingAfterSubmit: boolean = false;
	userRole: string


	constructor(
		public dialogRef: MatDialogRef<UserRoleCheckDialogComponent>,
		private router: Router,
		@Inject(MAT_DIALOG_DATA) public data: any
	) {
		this.userRole = this.data.userRole;
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
		this.router.navigateByUrl('refund/request');
	}
}
