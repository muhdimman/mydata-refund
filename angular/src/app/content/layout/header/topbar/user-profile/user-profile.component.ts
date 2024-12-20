import { AuthenticationService } from '../../../../../core/auth/authentication.service';
import { ChangeDetectionStrategy, Component, ElementRef, HostBinding, Input, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';

@Component({
	selector: 'm-user-profile',
	templateUrl: './user-profile.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserProfileComponent implements OnInit {
	@HostBinding('class')
	// tslint:disable-next-line:max-line-length
	classes = 'm-nav__item m-topbar__user-profile m-topbar__user-profile--img m-dropdown m-dropdown--medium m-dropdown--arrow m-dropdown--header-bg-fill m-dropdown--align-right m-dropdown--mobile-full-width m-dropdown--skin-light';

	@HostBinding('attr.m-dropdown-toggle') attrDropdownToggle = 'click';

	@Input() avatar: string = './assets/app/media/img/users/user4.jpg';
	@Input() avatarBg: SafeStyle = '';

	@ViewChild('mProfileDropdown') mProfileDropdown: ElementRef;

	fullname: string;
	// email: string;
	// phone: string;
	// username: string;

	constructor (
		private router: Router,
		private authService: AuthenticationService,
		private sanitizer: DomSanitizer
	) {}

	ngOnInit (): void {
		if (!this.avatarBg) {
			// this.avatarBg = this.sanitizer.bypassSecurityTrustStyle('url(./assets/app/media/img/misc/user_profile_bg.jpg)');
			this.avatarBg = this.sanitizer.bypassSecurityTrustStyle('url(./assets/app/media/img/misc/quick_actions_bg.jpg)');
		}
		this.fullname = localStorage.getItem('fullName');
		// this.username = localStorage.getItem('username') || '';
		// this.email = localStorage.getItem('userEmail') || '';
		// this.phone = localStorage.getItem('userPhone') || '';
	}

	public logout () {
		this.authService.logout(true);
	}
}
