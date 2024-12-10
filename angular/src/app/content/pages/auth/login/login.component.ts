import {
	Component,
	OnInit,
	Output,
	Input,
	ViewChild,
	OnDestroy,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	HostBinding
} from '@angular/core';
import { AuthenticationService } from '../../../../core/auth/authentication.service';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { AuthNoticeService } from '../../../../core/auth/auth-notice.service';
import { NgForm } from '@angular/forms';
import * as objectPath from 'object-path';
import { TranslateService } from '@ngx-translate/core';
import { SpinnerButtonOptions } from '../../../partials/content/general/spinner-button/button-options.interface';

@Component({
	selector: 'm-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent implements OnInit, OnDestroy {
	public model: any = {username:'', password:'' };
	@HostBinding('class') classes: string = 'm-login__signin';
	@Output() actionChange = new Subject<string>();
	public loading = false;

	@Input() action: string;

	@ViewChild('f') f: NgForm;
	errors: any = [];

	spinner: SpinnerButtonOptions = {
		active: false,
		spinnerSize: 18,
		raised: true,
		buttonColor: 'primary',
		spinnerColor: 'accent',
		fullWidth: false
	};

	constructor(
		private authService: AuthenticationService,
		private router: Router,
		public authNoticeService: AuthNoticeService,
		private translate: TranslateService,
		private cdr: ChangeDetectorRef
	) {}

	submit() {
		this.spinner.active = true;
		if (this.validate(this.f)) {
			this.authService.login(this.model).subscribe(response => {
				console.log(response);
				
				if (response.success) {
					if (response.roles[0] == 'USER'){
						if (response.refundId){
							this.router.navigate(['/refund/request']);
						}
						else{
							if (response.prepaidBalance >= 1){
								this.router.navigate(['/refund/request']);
							}
							else{
								this.router.navigate(['/refund/new']);
							}
						}
					}
					else if (response.roles[0] == 'SUPPORT_BDW'){
						this.router.navigate(['/refund/new/list']);
					}
					else if (response.roles[0] == 'FINANCE_BDW'){
						this.router.navigate(['/refund/process/list']);
					}
					else if (response.roles[0] == 'ADMIN_BDW'){
						this.router.navigate(['/refund/new/list']);
					}
					else {
						this.router.navigate(['/']);
					}
				} 
				else {
					this.authNoticeService.setNotice(response.message, 'error');
				}
				this.spinner.active = false;
				this.cdr.detectChanges();
			});
		}
	}

	ngOnInit(): void {
		// demo message to show
		// if (!this.authNoticeService.onNoticeChanged$.getValue()) {
		// 	const initialNotice = 
		// 		'<span class="m--font-primary">*This refund application is only applicable for MYDATA Users who still have prepaid/e-wallet balance in the Account.</span>' +
		// 		'<br/><br/>' +
		// 		'Please use <strong>Username</strong> and <strong>Password</strong> registered in MYDATA Portal.';
		// 	this.authNoticeService.setNotice(initialNotice, 'primary');
		// }
	}

	ngOnDestroy(): void {
		this.authNoticeService.setNotice(null);
	}

	validate(f: NgForm) {
		if (f.form.status === 'VALID') {
			return true;
		}

		this.errors = [];
		// if (objectPath.get(f, 'form.controls.email.errors.email')) {
		// 	this.errors.push(this.translate.instant('AUTH.VALIDATION.INVALID', {name: this.translate.instant('AUTH.INPUT.EMAIL')}));
		// }
		// if (objectPath.get(f, 'form.controls.email.errors.required')) {
		// 	this.errors.push(this.translate.instant('AUTH.VALIDATION.REQUIRED', {name: this.translate.instant('AUTH.INPUT.EMAIL')}));
		// }
		if (objectPath.get(f, 'form.controls.username.errors.required')) {
			this.errors.push('Username is required');
		}

		if (objectPath.get(f, 'form.controls.password.errors.required')) {
			this.errors.push('Password is required');
		}
		// if (objectPath.get(f, 'form.controls.password.errors.minlength')) {
		// 	this.errors.push(this.translate.instant('AUTH.VALIDATION.MIN_LENGTH', {name: this.translate.instant('AUTH.INPUT.PASSWORD')}));
		// }

		if (this.errors.length > 0) {
			this.authNoticeService.setNotice(this.errors.join('<br/>'), 'error');
			this.spinner.active = false;
		}

		return false;
	}

	forgotPasswordPage(event: Event) {
		this.action = 'forgot-password';
		this.actionChange.next(this.action);
	}

	register(event: Event) {
		this.action = 'register';
		this.actionChange.next(this.action);
	}
}
