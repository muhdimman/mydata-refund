import { Injectable } from '@angular/core';
import {
	HttpEvent,
	HttpInterceptor,
	HttpHandler,
	HttpRequest,
	HttpResponse
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { AuthenticationService } from '../../../../../../../core/auth/authentication.service';

@Injectable()
export class InterceptService implements HttpInterceptor {

	constructor (
		private authService: AuthenticationService,
	) {}

	// intercept request and add token
	intercept(
		request: HttpRequest<any>,
		next: HttpHandler
	): Observable<HttpEvent<any>> {
		// modify request
		request = request.clone({
			setHeaders: {
				// tslint:disable-next-line: max-line-length
				// 'x-access-token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTU2NDEzMTIwMiwiZXhwIjoxNTczMTMxMjAyfQ.5X1mDURvCvR7DcpXLUkJt9vBNgwFm_ub5vTfWoFFhTE'
				'x-access-token': localStorage.getItem('accessToken')
			}
		});
		// console.log('----request----');
		console.log(request);
		// console.log('--- end of request---');

		return next.handle(request).pipe(
			tap(
				event => {
					if (event instanceof HttpResponse) {
						// console.log('all looks good');
						// http response status code
						console.log(event.status);
					}
				},
				error => {
					// http response status code
					// console.log('----response----');
					// console.error('status code:')
					console.error(error.status);
					console.error(error.message);
					// console.log('--- end of response---');
					if (error.status == 401){
						this.authService.logout(true);
					}
				}
			)
		);
	}
}
