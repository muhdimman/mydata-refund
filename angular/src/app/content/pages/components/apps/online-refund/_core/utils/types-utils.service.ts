import { Injectable } from '@angular/core';


@Injectable()
export class TypesUtilsService {
	padNumber(value: number) {
		if (this.isNumber(value)) {
			return `0${value}`.slice(-2);
		} else {
			return '';
		}
	}

	isNumber(value: any): boolean {
		return !isNaN(this.toInteger(value));
	}

	toInteger(value: any): number {
		return parseInt(`${value}`, 10);
	}

	dateFormat(date: Date): string {
		const month = date.getMonth() + 1;
		const day = date.getDate();
		const year = date.getFullYear();
		if (date) {
			// return `${month}/${day}/${year}`;
			return `${day}/${month}/${year}`;
		}

		return '';
	}

	dateCustomFormat(date: any): string {
		let stringDate: string = '';
		if (date) {
			stringDate += this.isNumber(date.month) ? this.padNumber(date.month) + '/' : '';
            stringDate += this.isNumber(date.day) ? this.padNumber(date.day) + '/' : '';

			stringDate += date.year;
        }
        return stringDate;
	}

	getDateFormatterFromString(dateInStr: string): any {
		if (dateInStr && dateInStr.length > 0) {
			const dateParts = dateInStr.trim().split('/');
			return [
				{
					year: this.toInteger(dateParts[2]),
					month: this.toInteger(dateParts[0]),
					day: this.toInteger(dateParts[1])
				}
			];
		}

		const _date = new Date();
		return [
			{
				year: _date.getFullYear(),
				month: _date.getMonth() + 1,
				day: _date.getDay()
			}
		];
	}

	getDateFromString(dateInStr: string = ''): Date {
		if (dateInStr && dateInStr.length > 0) {
			const dateParts = dateInStr.trim().split('/');
			const year = this.toInteger(dateParts[2]);
			const month = this.toInteger(dateParts[0]);
			const day = this.toInteger(dateParts[1]);
			// tslint:disable-next-line:prefer-const
			let result = new Date();
			result.setDate(day);
			result.setMonth(month - 1);
			result.setFullYear(year);
			return result;
		}

		return new Date();
	}

	getDateStringFromString(dateInStr: string = ''): string {
		if (dateInStr && dateInStr.length > 0) {
			const dateParts = dateInStr.trim().split('/');
			const year = dateParts[2];
			const month = ('0' + dateParts[1]).slice(-2);
			const day = ('0' + dateParts[0]).slice(-2);
			return `${year}-${month}-${day}`;
		}
		else{
			return '';
		}
	}

	getDateStringFromDate(_date: Date = new Date()): string {
		const _month = _date.getMonth() + 1;
		const month = ('0' + _month).slice(-2);
		const year = _date.getFullYear();
		const _day = _date.getDate();
		const day = ('0' + _day).slice(-2);
		const hour = _date.getHours();
		const minute = _date.getMinutes();
		const second = _date.getSeconds();
		return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
	}

	getStringFromDate(_date: Date = new Date()): string {
		const _month = _date.getMonth() + 1;
		const month = ('0' + _month).slice(-2);
		const year = _date.getFullYear();
		const _day = _date.getDate();
		const day = ('0' + _day).slice(-2);
		const hour = _date.getHours();
		const minute = _date.getMinutes();
		const second = _date.getSeconds();
		return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
	}

	getDateStringDate(_date: Date = new Date()): string {
		const _month = _date.getMonth() + 1;
		const month = ('0' + _month).slice(-2);
		const year = _date.getFullYear();
		const _day = _date.getDate();
		const day = ('0' + _day).slice(-2);
		const hour = _date.getHours();
		const minute = _date.getMinutes();
		const second = _date.getSeconds();
		return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
	}
}
