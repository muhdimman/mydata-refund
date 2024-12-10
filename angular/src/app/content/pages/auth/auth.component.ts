import {
	Component,
	OnInit,
	Input,
	HostBinding,
	OnDestroy,
	Output
} from '@angular/core';
import { LayoutConfigService } from '../../../core/services/layout-config.service';
import { Router, NavigationStart, NavigationEnd } from '@angular/router';
import { LayoutConfig } from '../../../config/layout';
import { Subject } from 'rxjs';
import { AuthNoticeService } from '../../../core/auth/auth-notice.service';
import { TranslationService } from '../../../core/services/translation.service';
// add support whatsapp
declare const supportPhoneList: any;

@Component({
	selector: 'm-auth',
	templateUrl: './auth.component.html',
	styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit, OnDestroy {
	@HostBinding('id') id = 'm_login';
	@HostBinding('class')
	// tslint:disable-next-line:max-line-length
	classses: any = 'm-grid m-grid--hor m-grid--root m-page';

	@Input() action = 'login';
    today: number = Date.now();
    
	constructor(
		private layoutConfigService: LayoutConfigService,
		public authNoticeService: AuthNoticeService,
        private translationService: TranslationService,
	) {}

	ngOnInit(): void {
		// set login layout to blank
		this.layoutConfigService.setModel(new LayoutConfig({ content: { skin: '' } }), true);

		this.translationService.getSelectedLanguage().subscribe(lang => {
			if (lang) {
				setTimeout(() => this.translationService.setLanguage(lang));
			}
		});
	}

	ngOnDestroy(): void {
		// reset back to fluid
		this.layoutConfigService.reloadSavedConfig();
	}

	register() {
		this.action = 'register';
    }
    
    // add support whatsapp
    sendWhatsapp() {
        const randomPhone = supportPhoneList[Math.floor(Math.random() * supportPhoneList.length)];
        window.open('https://api.whatsapp.com/send?phone='+randomPhone, '_blank');
    }
}
