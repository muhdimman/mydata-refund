import { BaseModel } from './_base.model';
// import { ProductSpecificationModel } from './product-specification.model';
// import { ProductRemarkModel } from './product-remark.model';

export class RefundModel extends BaseModel {
	id: number;
	userId: number;
	accountId: number;
	fullName: string;
	icNo: string;
	companyName: string;
	companyNo: string;
	username: string;
	email: string;
	phone: string;
	bankName: string;
	accountName: string;
	accountNo: string;
	accountRef: string;
	prepaidBalance: number;
	refundAmount: number;
	reason: string;
	refundNumber: string;
	remarkDesc: string;
	remark: string;
	attachmentId: number;
	files: any;
	status: string;
	requestedDate: string;

	// _specs: ProductSpecificationModel[];
	// _remarks: ProductRemarkModel[];

	clear() {
		this.fullName = '';
		this.icNo = '';
		this.companyName = '';
		this.companyNo = '';
		this.username = '';
		this.email = '';
		this.phone = '';
		this.bankName = '';
		this.accountName = '';
		this.accountNo = '';
		this.accountRef = '';
		this.requestedDate = '';
		this.reason = '';
		this.remark = '';
		this.status = '';
	}
}
