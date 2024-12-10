import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { SubheaderService } from '../../../../../../../core/services/layout/subheader.service';

@Component({
	selector: 'm-refund-report',
	templateUrl: './refund-report.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class RefundReportComponent implements OnInit {
	selectedTab: number = 0;

	constructor(private subheaderService: SubheaderService) { }

	/** LOAD DATA */
	ngOnInit() {
		this.selectedTab = 0;
		this.subheaderService.setTitle('Refund');
		this.subheaderService.setBreadcrumbs([
			{ title: 'Refund Report', page: '/refund/report' }
		]);
	}

	getComponentTitle() {
		let result = 'Reports';
		return result;
	}
}
