import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable()
export class TokenStorage {
	/**
	 * Get access token
	 * @returns {Observable<string>}
	 */
	public getAccessToken(): Observable<string> {
		const token: string = <string>localStorage.getItem('accessToken');
		return of(token);
	}

	/**
	 * Get refresh token
	 * @returns {Observable<string>}
	 */
	public getRefreshToken(): Observable<string> {
		const token: string = <string>localStorage.getItem('refreshToken');
		return of(token);
	}

	/**
	 * Get user roles in JSON string
	 * @returns {Observable<any>}
	 */
	public getUserRoles(): Observable<any> {
		const roles: any = localStorage.getItem('userRoles');
		try {
			return of(JSON.parse(roles));
		} catch (e) {}
	}

	/**
	 * Get user id
	 * @returns {Observable<string>}
	 */
	public getUserId(): Observable<string> {
		const userId: string = <string>localStorage.getItem('userId');
		return of(userId);
	}

	// /**
	//  * Get account id
	//  * @returns {Observable<string>}
	//  */
	// public getAccountId(): Observable<string> {
	// 	const accountId: string = <string>localStorage.getItem('accountId');
	// 	return of(accountId);
	// }

	// /**
	//  * Get user name
	//  * @returns {Observable<string>}
	//  */
	// public getUsername(): Observable<string> {
	// 	const username: string = <string>localStorage.getItem('username');
	// 	return of(username);
	// }

	/**
	 * Get full name
	 * @returns {Observable<string>}
	 */
	public getFullName(): Observable<string> {
		const fullName: string = <string>localStorage.getItem('fullName');
		return of(fullName);
	}

	// /**
	//  * Get user email
	//  * @returns {Observable<string>}
	//  */
	// public getUserEmail(): Observable<string> {
	// 	const email: string = <string>localStorage.getItem('email');
	// 	return of(email);
	// }

	// /**
	//  * Get user phone
	//  * @returns {Observable<string>}
	//  */
	// public getUserPhone(): Observable<string> {
	// 	const phone: string = <string>localStorage.getItem('phone');
	// 	return of(phone);
	// }

	// /**
	//  * Get prepaid balance
	//  * @returns {Observable<string>}
	//  */
	// public getPrepaidBalance(): Observable<string> {
	// 	const balance: string = <string>localStorage.getItem('prepaidBalance');
	// 	return of(balance);
	// }

	/**
	 * Get refund id
	 * @returns {Observable<string>}
	 */
	public getRefundId(): Observable<string> {
		const refundId: string = <string>localStorage.getItem('refundId');
		return of(refundId);
	}

	/**
	 * Set access token
	 * @returns {TokenStorage}
	 */
	public setAccessToken(token: string): TokenStorage {
		localStorage.setItem('accessToken', token);

		return this;
	}

	/**
	 * Set refresh token
	 * @returns {TokenStorage}
	 */
	public setRefreshToken(token: string): TokenStorage {
		localStorage.setItem('refreshToken', token);

		return this;
	}

	/**
	 * Set user roles
	 * @param roles
	 * @returns {TokenStorage}
	 */
	public setUserRoles(roles: any): any {
		if (roles != null) {
			localStorage.setItem('userRoles', JSON.stringify(roles));
		}

		return this;
	}

	/**
	 * Set user id
	 * @returns {TokenStorage}
	 */
	public setUserId(userId: number): TokenStorage {
		localStorage.setItem('userId', JSON.stringify(userId));
		
		return this;
	}

	// /**
	//  * Set account id
	//  * @returns {TokenStorage}
	//  */
	// public setAccountId(accountId: number): TokenStorage {
	// 	localStorage.setItem('accountId', JSON.stringify(accountId));
		
	// 	return this;
	// }

	// /**
	//  * Set username
	//  * @returns {TokenStorage}
	//  */
	// public setUsername(username: string): TokenStorage {
	// 	localStorage.setItem('username', username);
		
	// 	return this;
	// }

	/**
	 * Set full name
	 * @returns {TokenStorage}
	 */
	public setFullName(fullName: string): TokenStorage {
		localStorage.setItem('fullName', fullName);
		
		return this;
	}

	// /**
	//  * Set user email
	//  * @returns {TokenStorage}
	//  */
	// public setUserEmail(email: string): TokenStorage {
	// 	localStorage.setItem('userEmail', email);
		
	// 	return this;
	// }

	// /**
	//  * Set user phone
	//  * @returns {TokenStorage}
	//  */
	// public setUserPhone(phone: string): TokenStorage {
	// 	if (phone != null) {
	// 		localStorage.setItem('userPhone', phone);
	// 	}
	// 	return this;
	// }

	// /**
	//  * Set preaid balance
	//  * @returns {TokenStorage}
	//  */
	// public setPrepaidBalance(prepaidBalance: number): TokenStorage {
	// 	localStorage.setItem('prepaidBalance', JSON.stringify(prepaidBalance));
		
	// 	return this;
	// }

	/**
	 * Set refund id
	 * @param refundId
	 * @returns {TokenStorage}
	 */
	public setRefundId(refundId: number): TokenStorage {
		if (refundId != null) {
			localStorage.setItem('refundId', JSON.stringify(refundId));
		}

		return this;
	}

	/**
	 * Remove tokens
	 */
	public clear() {
		localStorage.removeItem('accessToken');
		localStorage.removeItem('refreshToken');
		localStorage.removeItem('userRoles');
		localStorage.removeItem('userId');
		// localStorage.removeItem('accountId');
		// localStorage.removeItem('username');
		localStorage.removeItem('fullName');
		// localStorage.removeItem('userEmail');
		// localStorage.removeItem('userPhone');
		// localStorage.removeItem('prepaidBalance');
		localStorage.removeItem('refundId');
	}
}
