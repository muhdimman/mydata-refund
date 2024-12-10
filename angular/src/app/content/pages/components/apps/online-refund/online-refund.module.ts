import { NgModule } from '@angular/core';
import { CommonModule,  } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { PartialsModule } from '../../../../partials/partials.module';
import { OnlineRefundComponent } from './online-refund.component';
import { HttpClientInMemoryWebApiModule } from 'angular-in-memory-web-api';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FileUploadModule } from 'ng2-file-upload';
import { NgxDropzoneModule } from 'ngx-dropzone';
// Services
import { RefundService } from './_core/services/index';
import { FileService } from './_core/services/index';
// Core => Utils
import { HttpUtilsService } from './_core/utils/http-utils.service';
import { TypesUtilsService } from './_core/utils/types-utils.service';
import { LayoutUtilsService } from './_core/utils/layout-utils.service';
import { InterceptService } from './_core/utils/intercept.service';
// Shared
import { ActionNotificationComponent } from './_shared/action-natification/action-notification.component';
import { DeleteEntityDialogComponent } from './_shared/delete-entity-dialog/delete-entity-dialog.component';
import { FetchEntityDialogComponent } from './_shared/fetch-entity-dialog/fetch-entity-dialog.component';
import { UpdateStatusDialogComponent } from './_shared/update-status-dialog/update-status-dialog.component';
import { AlertComponent } from './_shared/alert/alert.component';
// Refund
import { RefundRequestListComponent } from './refund/refund-new/refund-request-list.component';
import { RefundNewListComponent } from './refund/refund-list/refund-new-list.component';
import { RefundRejectListComponent } from './refund/refund-list/refund-reject-list.component';
import { RefundProcessListComponent } from './refund/refund-list/refund-process-list.component';
import { RefundRequeryListComponent } from './refund/refund-list/refund-requery-list.component';
import { RefundApprovedListComponent } from './refund/refund-list/refund-approved-list.component';
import { RefundEditComponent } from './refund/refund-edit/refund-edit.component';
import { RefundNewComponent } from './refund/refund-new/refund-new.component';
import { RefundViewComponent } from './refund/refund-new/refund-view.component';
import { RefundReportComponent } from './refund/refund-report/refund-report.component';
import { RefundReportTableComponent } from './refund/refund-report/subs/refund-report-table.component';
import { RefundReportWidgetComponent } from './refund/refund-report/subs/refund-report-widget.component';
import { RefundBalanceCheckDialogComponent } from './refund/refund-dialog/refund-balance-check.dialog.component';
import { UserRoleCheckDialogComponent } from './refund/refund-dialog/user-role-check.dialog.component';
import { RejectRefundDialogComponent } from './refund/refund-dialog/reject-refund.dialog.component';
// Material
import {
	MatInputModule,
	MatPaginatorModule,
	MatProgressSpinnerModule,
	MatSortModule,
	MatTableModule,
	MatSelectModule,
	MatMenuModule,
	MatProgressBarModule,
	MatButtonModule,
	MatCheckboxModule,
	MatDialogModule,
	MatTabsModule,
	MatNativeDateModule,
	MatCardModule,
	MatRadioModule,
	MatIconModule,
	MatDatepickerModule,
	MatAutocompleteModule,
	MAT_DIALOG_DEFAULT_OPTIONS,
	MatSnackBarModule,
	MatTooltipModule
} from '@angular/material';
import { MatExpansionModule} from '@angular/material/expansion';
import { environment } from '../../../../../../environments/environment';

const routes: Routes = [
	{
		path: '',
		component: OnlineRefundComponent,
		children: [
			{
				path: '',
				redirectTo: 'customers',
				pathMatch: 'full'
			},
			{
				path: 'request',
				component: RefundRequestListComponent
			},
			{
				path: 'new/list',
				component: RefundNewListComponent
			},
			{
				path: 'reject/list',
				component: RefundRejectListComponent
			},
			{
				path: 'process/list',
				component: RefundProcessListComponent
			},
			{
				path: 'requery/list',
				component: RefundRequeryListComponent
			},
			{
				path: 'approved/list',
				component: RefundApprovedListComponent
			},
			{
				path: 'new',
				component: RefundNewComponent
			},
			{
				path: 'view',
				component: RefundViewComponent
			},
			{
				path: 'report',
				component: RefundReportComponent
			},
			{
				path: 'edit',
				component: RefundEditComponent
			},
			{
				path: 'edit/:id',
				component: RefundEditComponent
			}
		]
	}
];

@NgModule({
	imports: [
		MatDialogModule,
		CommonModule,
		HttpClientModule,
		NgbModule,
		PartialsModule,
		RouterModule.forChild(routes),
		FormsModule,
		ReactiveFormsModule,
		TranslateModule.forChild(),
		MatButtonModule,
		MatMenuModule,
		MatSelectModule,
        MatInputModule,
		MatTableModule,
		MatAutocompleteModule,
		MatRadioModule,
		MatIconModule,
		MatNativeDateModule,
		MatProgressBarModule,
		MatDatepickerModule,
		MatCardModule,
		MatPaginatorModule,
		MatSortModule,
		MatCheckboxModule,
		MatProgressSpinnerModule,
		MatSnackBarModule,
		MatTabsModule,
		MatTooltipModule,
		NgxDropzoneModule,
		FileUploadModule,
		MatExpansionModule
		// environment.isMockEnabled ? HttpClientInMemoryWebApiModule.forFeature(FakeApiService) : []
	],
	providers: [
		InterceptService,
      	{
        	provide: HTTP_INTERCEPTORS,
       	 	useClass: InterceptService,
        	multi: true
      	},
		{
			provide: MAT_DIALOG_DEFAULT_OPTIONS,
			useValue: {
				hasBackdrop: true,
				panelClass: 'm-mat-dialog-container__wrapper',
				height: 'auto',
				width: '900px'
			}
		},
		HttpUtilsService,
		RefundService,
		FileService,
		TypesUtilsService,
		LayoutUtilsService
	],
	entryComponents: [
		ActionNotificationComponent,
		DeleteEntityDialogComponent,
		FetchEntityDialogComponent,
		UpdateStatusDialogComponent,
		RefundBalanceCheckDialogComponent,
		UserRoleCheckDialogComponent,
		RejectRefundDialogComponent
	],
	declarations: [
		OnlineRefundComponent,
		// Shared
		ActionNotificationComponent,
		DeleteEntityDialogComponent,
		FetchEntityDialogComponent,
		UpdateStatusDialogComponent,
		AlertComponent,
		// Refund
		RefundRequestListComponent,
		RefundNewListComponent,
		RefundRejectListComponent,
		RefundProcessListComponent,
		RefundRequeryListComponent,
		RefundApprovedListComponent,
		RefundEditComponent,
		RefundNewComponent,
		RefundViewComponent,
		RefundReportComponent,
		RefundReportTableComponent,
		RefundReportWidgetComponent,
		RefundBalanceCheckDialogComponent,
		UserRoleCheckDialogComponent,
		RejectRefundDialogComponent
	]
})
export class OnlineRefundModule { }
