import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PagesComponent } from './pages.component';
// import { ActionComponent } from './header/action/action.component';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { ProfileComponent } from './header/profile/profile.component';
import { ErrorPageComponent } from './snippets/error-page/error-page.component';

const routes: Routes = [
	{
		path: '',
		component: PagesComponent,
		canActivate: [NgxPermissionsGuard],
		data: {
			permissions: {
				only: ['ADMIN_BDW', 'USER', 'FINANCE_BDW', 'SUPPORT_BDW'],
				except: ['GUEST'],
				redirectTo: '/login'
			}
		},
		children: [
			{
				path: '',
				loadChildren: './components/apps/online-refund/online-refund.module#OnlineRefundModule'
				// loadChildren: './components/dashboard/dashboard.module#DashboardModule'
			},
			// {
			// 	path: 'mail',
			// 	loadChildren: './components/apps/mail/mail.module#MailModule'
			// },
			// {
			// 	path: 'ecommerce',
			// 	loadChildren: './components/apps/e-commerce/e-commerce.module#ECommerceModule'
			// },
			{
				path: 'refund',
				loadChildren: './components/apps/online-refund/online-refund.module#OnlineRefundModule'
			},
			// {
			// 	path: 'ngbootstrap',
			// 	loadChildren: './components/ngbootstrap/ngbootstrap.module#NgbootstrapModule'
			// },
			// {
			// 	path: 'material',
			// 	loadChildren: './components/material/material.module#MaterialModule'
			// },
			// {
			// 	path: 'metronic',
			// 	loadChildren: './components/metronic/metronic.module#MetronicModule'
			// },
			// {
			// 	path: 'user-management',
			// 	loadChildren: './components/user-management/user-management.module#UserManagementModule'
			// },
			// {
			// 	path: 'audit-log',
			// 	loadChildren: './components/apps/audit-log/audit-log.module#AuditLogModule'
			// },
			{
				path: 'builder',
				loadChildren: './builder/builder.module#BuilderModule'
			},
			// {
			// 	path: 'header/actions',
			// 	component: ActionComponent
			// },
			{
				path: 'profile',
				component: ProfileComponent
			}
		]
	},
	{
		path: 'login',
		canActivate: [NgxPermissionsGuard],
		loadChildren: './auth/auth.module#AuthModule',
		data: {
			permissions: {
				except: 'ADMIN_BDW'
			}
		},
	},
	{
		path: '404',
		component: ErrorPageComponent
	},
	{
		path: 'error/:type',
		component: ErrorPageComponent
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class PagesRoutingModule {}
