// tslint:disable-next-line:no-shadowed-variable
import { ConfigModel } from '../core/interfaces/config';

// tslint:disable-next-line:no-shadowed-variable
export class MenuConfig implements ConfigModel {
    public config: any = {};

    constructor() {
        this.config = {
            header: {
                self: {},
                items: []
            },
            aside: {
                self: {},
                items: [
                    {
                        section: 'Refund',
                        role: 'USER'
                    },
                    {
                        title: 'Refund Request',
                        desc: 'Refund Request',
                        root: true,
                        icon: 'flaticon-edit-1',
                        page: '/refund/request',
                        role: 'USER'
                    },
                    {
                        section: 'Refund',
                        role: 'FINANCE_BDW'
                    },
                    {
                        title: 'New Refund',
                        desc: 'New Refund',
                        root: true,
                        icon: 'flaticon-file-1',
                        page: '/refund/new/list',
                        role: 'SUPPORT_BDW'
                    },
                    {
                        title: 'Rejected Refund',
                        desc: 'Rejected Refund',
                        root: true,
                        icon: 'flaticon-edit-1',
                        page: '/refund/reject/list',
                        role: 'SUPPORT_BDW'
                    },
                    {
                        title: 'Processing Refund',
                        desc: 'Processing Refund',
                        root: true,
                        icon: 'flaticon-interface-4',
                        page: '/refund/process/list',
                        role: 'FINANCE_BDW'
                    },
                    {
                        title: 'Requery Refund',
                        desc: 'Requery Refund',
                        root: true,
                        icon: 'flaticon-edit-1',
                        page: '/refund/requery/list',
                        role: 'SUPPORT_BDW'
                    },
                    {
                        title: 'Requery Refund',
                        desc: 'Requery Refund',
                        root: true,
                        icon: 'flaticon-edit-1',
                        page: '/refund/requery/list',
                        role: 'FINANCE_BDW'
                    },
                    {
                        title: 'Approved Refund',
                        desc: 'Approved Refund',
                        root: true,
                        icon: 'flaticon-interface-10',
                        page: '/refund/approved/list',
                        role: 'FINANCE_BDW'
                    },
                    {
                        section: 'Reports',
                        role: 'FINANCE_BDW'
                    },
                    {
                        title: 'Reports',
                        desc: 'Reports',
                        root: true,
                        icon: 'flaticon-diagram',
                        page: '/refund/report',
                        role: 'FINANCE_BDW'
                    },
                    {
                        title: 'Reports',
                        desc: 'Reports',
                        root: true,
                        icon: 'flaticon-diagram',
                        page: '/refund/report',
                        role: 'SUPPORT_BDW'
                    },
                    {
                        section: 'Refund',
                        role: 'ADMIN_BDW'
                    },
                    {
                        title: 'New Refund',
                        desc: 'New Refund',
                        root: true,
                        icon: 'flaticon-file-1',
                        page: '/refund/new/list',
                        role: 'ADMIN_BDW'
                    },
                    {
                        title: 'Processing Refund',
                        desc: 'Processing Refund',
                        root: true,
                        icon: 'flaticon-interface-4',
                        page: '/refund/process/list',
                        role: 'ADMIN_BDW'
                    },
                    {
                        title: 'Requery Refund',
                        desc: 'Requery Refund',
                        root: true,
                        icon: 'flaticon-edit-1',
                        page: '/refund/requery/list',
                        role: 'ADMIN_BDW'
                    },
                    {
                        title: 'Approved Refund',
                        desc: 'Approved Refund',
                        root: true,
                        icon: 'flaticon-interface-10',
                        page: '/refund/approved/list',
                        role: 'ADMIN_BDW'
                    },
                    {
                        section: 'Reports',
                        role: 'ADMIN_BDW'
                    },
                    {
                        title: 'Reports',
                        desc: 'Reports',
                        root: true,
                        icon: 'flaticon-diagram',
                        page: '/refund/report',
                        role: 'ADMIN_BDW'
                    },
                ]
            }
        };
    }
}
