import { ConfigModel } from '../interfaces/config';

export interface AclInterface {
	permissions: any;
	currentUserRoles: any;
}

export class AclModel implements AclInterface, ConfigModel {
	public config: any;

	// default permissions
	public permissions: any = {
		ADMIN_BDW: ['canDoAnything'],
		USER: ['canDoAnything'],
		FINANCE_BDW: ['canDoAnything'],
		SUPPORT_BDW: ['canDoAnything'],
	};

	// store an object of current user roles
	public currentUserRoles: any = {};

	constructor() {}
}
