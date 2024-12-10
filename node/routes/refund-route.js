var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var bodyParser = require('body-parser');
var Client = require('node-rest-client').Client;
var async = require('async');
var appSetting = require('./../app-setting.json');
var dateFormat = require('dateformat');
var XLSX = require('xlsx');
var sendEmail = require("./email-route.js");
var sendEmailNotification = require("./email-notification-route.js");

//#region db connection properties - knex
var knex = require('knex')({
    client: 'mysql',
    connection: {
        host: appSetting.dbHost,
        user: appSetting.dbUser,
        database: appSetting.dbName,
        password: appSetting.dbPassword,
        charset: appSetting.dbCharset
    }
});
var Bookshelf = require('bookshelf')(knex);
Bookshelf.plugin('pagination');
var Customer = Bookshelf.Model.extend({
    tableName: 'Customer',
    hasTimestamps: true
});
var Refund = Bookshelf.Model.extend({
    tableName: 'Refund',
    hasTimestamps: true
});
var Revision = Bookshelf.Model.extend({
    tableName: 'Revision',
    hasTimestamps: true
});
var Attachment = Bookshelf.Model.extend({
    tableName: 'Attachment',
    hasTimestamps: true
});
var BankList = Bookshelf.Model.extend({
    tableName: 'BankList',
    hasTimestamps: true
});
var Order = Bookshelf.Model.extend({
    tableName: 'Order',
    hasTimestamps: true
});
//#endregion

//#region mydata-v2 db connection properties - knex
var knexV2 = require('knex')({
    client: 'mysql',
    connection: {
        host: appSetting.dbV2Host,
        user: appSetting.dbV2User,
        database: appSetting.dbV2Name,
        password: appSetting.dbV2Password,
        charset: appSetting.dbV2Charset
    }
});
var bookshelfV2 = require('bookshelf')(knexV2);
var Accountv2 = bookshelfV2.Model.extend({
    tableName: 'account',
    hasTimestamps: true
});
//#endregion

//#region email smtp properties - modemailer 
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var transport = nodemailer.createTransport(smtpTransport({
    host: appSetting.emailSMTP, // hostname
    secureConnection: false, // use SSL
    port: appSetting.emailSMTPPort, // port for secure SMTP
    auth: {
        user: appSetting.emailUser,
        pass: appSetting.emailPass
    },
    tls: {
        rejectUnauthorized: false
    }
}));
//#endregion

router.use(bodyParser.json());

//#region renew token
router.use(function (req, res, next) {

    // console.log(req.headers['x-access-token']);
    
   if (req.headers['x-access-token']) {
    // console.log(req.headers);
        jwt.verify(req.headers['x-access-token'], 'catastrophe', function (err, decoded) {
            console.log(err);
            
            if (err) {
                res.status(401).json({ success: false, message: 'Unsuccessful to authenticate token.' });
            } 
            else {
                req.decoded = {};
                var tokenVal = {userId:decoded.userId};
                var token = jwt.sign(tokenVal, 'catastrophe', {expiresIn:'30m'});
                req.decoded.token = token
                req.decoded.userId = decoded.userId
                // console.log('req.decoded',req.decoded);
                next();
            }
        });

    } 
    else {
        return res.status(401).send({
            success: false,
            message: 'No token provided.'
        });
    }
});
//#endregion

//#region create
router.post('/create', function (req, res) {
    console.log('Create refund request')
    console.log(req.body);
    var finalData = {token: req.decoded.token};
    async.waterfall([
        // check user already request refund
        function(callback) {
            Refund.query(function (qb) {
                qb.select('id');
                qb.where('customerId', req.body.userId);
            }).fetch().then(function (refundExist) {
                if (refundExist){
                    callback(null, true);
                }
                else{
                    callback(null, false);
                }
            })
        },
        // generate token to stub v2 service
        function(refundExist, callback) {
            if (refundExist){
                console.log('Refund request for user('+req.body.userId+') already exist')
                callback(null, null, {});
            }
            else{
                console.log('Refund request for user('+req.body.userId+') available')
                Customer.query(function (qb) {
                    qb.select('mydataUserId as userId', 'mydataAccountId as accountId', 'prepaidBalance');
                    qb.where('id', req.body.userId);
                }).fetch().then(function (result) {
                    if (result){
                        var customer = result.serialize()
                        var tokenVal = {userId:customer.userId, accountId:customer.accountId};
                        var token = jwt.sign(tokenVal, 'ilovemydata', {expiresIn:'15m'});
                        callback(null, token, customer);
                    }
                    else{
                        callback(null, null, {});
                    }
                })
            }
        },
        // stub v2 remove credit service
        function(token, customer, callback) {
            if (token){
                var options = {
                    requestConfig: {timeout:60000, noDelay:true, keepAlive:true, keepAliveDelay:5000},
                    responseConfig: {timeout:60000}
                }
                var client = new Client(options);
                var args = {
                    headers: {"Content-Type":"application/json", "x-access-token":token},
                    data: {
                        "accountId": customer.accountId,
                        "creditBalance": customer.prepaidBalance,
                        "topupAmount": customer.prepaidBalance,
                        "topupDesc": "Refunded Online",
                        "trxType": "Remove Credit"
                    }
                };
                console.log('Stub v2 remove credit service')
                console.log(args.data)
                client.registerMethod("manageCredit", appSetting.loginUrl+"/account/addCreditBalance", "POST");
                client.methods.manageCredit(args, function (result) {
                    if (result.success){
                        console.log('Result --> success:'+result.success)
                        callback(null, true);
                    }
                    else{
                        console.log('Result --> success:'+result.success || false)
                        callback(null, false);
                    }
                }).on('requestTimeout', function (req) {
                    console.log('Request v2 remove credit service has expired');
                    req.abort();
                    callback(null, false);
                }).on('responseTimeout', function (res) {
                    console.log('Response v2 remove credit service has expired');
                    callback(null, false);
                }).on('error', function (err) {
                    console.log('Request v2 remove credit service error', err);
                    callback(null, false);
                });
            }
            else{
                callback(null, false);
            }
        },
        // create refund request
        function(success, callback) {
            if (success){
                Customer.forge({id:req.body.userId}).save({
                    fullName: req.body.fullName,
                    icNo: req.body.icNo,
                    companyName: req.body.companyName,
                    companyNo: req.body.companyNo,
                    email: req.body.email,
                    phone: req.body.phone
                }).then(function(customer){
                    Refund.forge({
                        customerId: customer.get('id'),
                        requestedDate: req.body._createdDate,
                        bankName: req.body.bankName,
                        accountName: req.body.accountName,
                        accountNo: req.body.accountNo,
                        accountRef: req.body.accountRef,
                        reason: req.body.reason,
                        attachmentId: req.body.attachmentId,
                        status: 'New'
                    }).save().then(function(refund){
                        finalData.refundId = refund.get('id')
                        Revision.forge({
                            refundId: refund.get('id'),
                            status: 'New',
                            remark: 'Create Refund Request',
                            revisedBy: req.body._userId,
                            revisedDate: req.body._createdDate,
                            aging: 0
                        }).save().then(function(){
                            console.log('Successfully created refund for user('+req.body.userId+') --> Refund id('+refund.get('id')+')');
                            callback(null, true);
                        });
                    })
                })
            }
            else{
                callback(null, false);
            }
        }
    ], function(err, result) {
        if (err) return callback(err);
        finalData.success = result;
        res.status(200).json(finalData);
    });
});
//#endregion

//#region create2
router.post('/new', function (req, res) {
    console.log('Create refund request')
    console.log(req.body);
    var newDate = new Date();
    function getRandom(length) {

        return Math.floor(Math.pow(10, length-1) + Math.random() * 9 * Math.pow(10, length-1));

    }

    var prefixDate = dateFormat(newDate, "yyyymmdd");
    var prefix = 'RFND'
    // BDSB0000081744
    var randomValue = getRandom(10)
    var refundNumber = prefix + randomValue
    var finalData = {token: req.decoded.token};
    async.waterfall([
        // check user already request refund
        function(callback) {

            Customer.query(function(qb){
                qb.select('id')
                qb.where('mydataUserId', req.decoded.userId)
            }).fetch().then(function(customer){
                var custId 
                if (customer){
                    // edit customer
                    Customer.forge({id:customer.get('id')}).save({
                        fullName: req.body.fullName,
                        icNo: req.body.icNo,
                        companyName: req.body.companyName,
                        companyNo: req.body.companyNo,
                        email: req.body.email,
                        phone: req.body.phone
                    }).then(function(customerData){
                        custId = customerData.get('id');
                        callback(null, custId);
                    })
                }else{
                    // create customer
                    Customer.forge({
                        mydataUserId: req.decoded.userId,
                        mydataAccountId: req.body.accountId,
                        username: req.body.username,
                        fullName: req.body.fullName,
                        email: req.body.email,
                        icNo: req.body.icNo,
                        phone: req.body.phone
                    }).save().then(function(customerData){
                        custId = customerData.get('id')
                        callback(null, custId);
                    })
                }
            })
        },
        // create refund request
        function(customerId, callback) {
            Refund.forge({
                refundNumber: refundNumber,
                customerId: customerId,
                requestedDate: req.body._createdDate,
                bankName: req.body.bankName,
                accountName: req.body.accountName,
                accountNo: req.body.accountNo,
                accountRef: req.body.accountRef,
                reason: req.body.reason,
                reasonRemark: req.body.reasonRemark,
                refundAmount: req.body.refundAmount,
                status: 'New'
            }).save().then(function(refund){
                rfndId = refund.get('id')
                finalData.refundId = refund.get('id')
                Revision.forge({
                    refundId: refund.get('id'),
                    status: 'New',
                    remark: 'Create Refund Request',
                    revisedBy: req.body._userId,
                    revisedDate: req.body._createdDate,
                    aging: 0
                }).save().then(function(){
                    console.log('Successfully created refund for user('+req.body._userId+') --> Refund id('+refund.get('id')+')');
                    callback(null, rfndId, refundNumber);
                });
            })
        },
        // save order
        function(refundId,refundNumber, callback) {

            async.eachSeries(req.body.newOrderData, function (item, next) {
                // console.log(item);
                var processDate = dateFormat(item.processDate, "yyyy-mm-dd HH:MM:ss");

                console.log('processDate',processDate);
                
                Order.forge({
                    refundId: refundId,
                    orderId: item.orderId,
                    orderNumber: item.orderNumber,
                    invoiceDate: processDate,
                    invoiceNumber: item.invoiceNumber,
                    description: item.documentType,
                    amount: item.total_doc_price,
                   
                }).save().then(function(refund){

                    var options = {
                        requestConfig: {timeout:60000, noDelay:true, keepAlive:true, keepAliveDelay:5000},
                        responseConfig: {timeout:60000}
                    }
                    var client = new Client(options);
                    var args = {
                        headers: {"Content-Type":"application/json"},
                        data: {
                            "id": item.orderId,
                            "refundNumber": refundNumber,
                        }
                    };
                    console.log('Stub v2 update refund order')
                    console.log(args.data)
                    client.registerMethod("updateOrder", appSetting.loginUrl+"/app/updateOrder", "POST");
                    client.methods.updateOrder(args, function (result) {
                        console.log(result);
                        if (result.success){
                            console.log('Result --> success:'+result.success)
                        }
                        else{
                            console.log('Result --> success:'+result.success || false)
                        }
                        next();
                    }).on('requestTimeout', function (req) {
                        console.log('Request v2 update refund order service has expired');
                        req.abort();
                    }).on('responseTimeout', function (res) {
                        console.log('Response v2 update refund order service has expired');
                    }).on('error', function (err) {
                        console.log('Request v2 update refund order service error', err);
                    });
        
                   
                })
            }, function (err) {
                console.log('Successfully saved order for user('+req.body._userId+') --> Refund id('+refundId+')');
                callback(null, true);
            })

           
        }
    ], function(err, result) {
        if (err) return callback(err);
        finalData.success = result;
        res.status(200).json(finalData);
    });
});
//#endregion

//#region new for counter/express
router.post('/new/form', function (req, res) {
    console.log('Create refund request for counter/express')
    console.log(req.body);
    var newDate = new Date();
    function getRandom(length) {

        return Math.floor(Math.pow(10, length-1) + Math.random() * 9 * Math.pow(10, length-1));

    }

    var prefixDate = dateFormat(newDate, "yyyymmdd");
    var prefix = 'RFND'
    // BDSB0000081744
    var randomValue = getRandom(10)
    var refundNumber = prefix + randomValue
    var requestedDate = dateFormat(newDate, "yyyy-mm-dd HH:MM:ss");
    var finalData = {token: req.decoded.token};

    async.waterfall([
        // check user already request refund
        function(callback) {

            Customer.query(function(qb){
                qb.select('id')
                qb.where('icNo', req.body.icNo)
            }).fetch().then(function(customer){
                var custId 
                if (customer){
                    // edit customer
                    Customer.forge({id:customer.get('id')}).save({
                        fullName: req.body.fullName,
                        icNo: req.body.icNo,
                        companyName: req.body.companyName,
                        companyNo: req.body.companyNo,
                        email: req.body.email,
                        phone: req.body.phone,
                        code: req.body.code,
                        // code: 'MYCT',
                    }).then(function(customerData){
                        custId = customerData.get('id');
                        callback(null, custId);
                    })
                }else{
                    // create customer
                    Customer.forge({
                        fullName: req.body.fullName,
                        companyName: req.body.companyName,
                        companyNo: req.body.companyNo,
                        email: req.body.email,
                        icNo: req.body.icNo,
                        code: req.body.code,
                        phone: req.body.phone
                    }).save().then(function(customerData){
                        custId = customerData.get('id')
                        callback(null, custId);
                    })
                }
            })
        },
        // create refund request
        function(customerId, callback) {
            Refund.forge({
                refundNumber: refundNumber,
                customerId: customerId,
                requestedDate: requestedDate,
                bankName: req.body.bankName,
                accountName: req.body.accountName,
                accountNo: req.body.accountNo,
                accountRef: req.body.accountRef,
                reason: req.body.reason,
                reasonRemark: req.body.reasonRemark,
                refundAmount: req.body.refundAmount,
                status: 'New'
            }).save().then(function(refund){
                rfndId = refund.get('id')
                finalData.refundId = refund.get('id')
                Revision.forge({
                    refundId: refund.get('id'),
                    status: 'New',
                    remark: 'Create Refund Request',
                    // revisedBy: req.body._userId,
                    revisedDate: requestedDate,
                    aging: 0
                }).save().then(function(){
                    console.log('Successfully created refund for user('+req.body.icNo+') --> Refund id('+refund.get('id')+')');
                    callback(null, rfndId, refundNumber);
                });
            })
        },
        // save order
        function(refundId,refundNumber, callback) {

            async.eachSeries(req.body.orderData, function (item, next) {
                console.log(item);
                var processDate = dateFormat(req.body.invoiceDate, "yyyy-mm-dd HH:MM:ss");

                console.log('processDate',processDate);
                Order.forge({
                    refundId: refundId,
                    // orderId: item.orderId,
                    orderNumber: item.orderNumber,
                    invoiceNumber: req.body.invoiceNumber,
                    invoiceDate: processDate,
                    description: item.documentType,
                    amount: item.totalnet,
                   
                }).save().then(function(refund){

                    var options = {
                        requestConfig: {timeout:60000, noDelay:true, keepAlive:true, keepAliveDelay:5000},
                        responseConfig: {timeout:60000}
                    }
                    var client = new Client(options);
                    var args = {
                        headers: {"Content-Type":"application/json"},
                        data: {
                            "id": item.orderId,
                            "refundNumber": refundNumber,
                        }
                    };
                    next();
                    // console.log('Stub v2 update refund order')
                    // console.log(args.data)
                    // client.registerMethod("updateOrder", appSetting.loginUrl+"/app/updateOrder", "POST");
                    // client.methods.updateOrder(args, function (result) {
                    //     if (result.success){
                    //         console.log('Result --> success:'+result.success)
                    //     }
                    //     else{
                    //         console.log('Result --> success:'+result.success || false)
                    //     }
                    //     next();
                    // }).on('requestTimeout', function (req) {
                    //     console.log('Request v2 update refund order service has expired');
                    //     req.abort();
                    // }).on('responseTimeout', function (res) {
                    //     console.log('Response v2 update refund order service has expired');
                    // }).on('error', function (err) {
                    //     console.log('Request v2 update refund order service error', err);
                    // });
                   
                })
            }, function (err) {
                console.log('Successfully saved order for user('+req.body.icNo+') --> Refund id('+refundId+')');
                callback(null, true);
            })

           
        }
    ], function(err, result) {
        if (err) return callback(err);
        console.log(finalData);
        finalData.success = result;
        var tokenVal = {
            id: result.refundId,
        };
        var token = jwt.sign(tokenVal, 'ilovemydata', {
            // expiresIn: '10080m'
        });
        sendEmailNotification.sendEmailNotification(req.body.email,req.body.fullName,'Successfully submit new refund request.','new',refundNumber,token)
        res.status(200).json(finalData);
    });
});
//#endregion

//#region update
router.put('/update', function (req, res) {
    var finalData = {token: req.decoded.token };
    Refund.forge({id:req.body.id}).save({
        bankName: req.body.bankName,
        accountName: req.body.accountName,
        accountNo: req.body.accountNo,
        accountRef: req.body.accountRef,
        reason: req.body.reason,
        reasonRemark: req.body.reasonRemark,
        remark: 'Update Request',
        amendedDate: req.body._updatedDate,
        status: 'Processing'
    }).then(function(){
        Customer.forge({id:req.body.userId}).save({
            fullName: req.body.fullName,
            icNo: req.body.icNo,
            companyName: req.body.companyName,
            companyNo: req.body.companyNo,
            email: req.body.email,
            phone: req.body.phone
        }).then(function(){
            Revision.query(function(qb){
                qb.select('revisedDate')
                qb.where('refundId', req.body.id)
                qb.orderBy('id', 'desc')
            }).fetch().then(function(revision){
                var nowDate = Date.now();
                var newDate = new Date(revision.get('revisedDate'));
                var revisedDate = newDate.getTime();
                var diffDate = nowDate - revisedDate;
                var aging = Math.floor(diffDate / (1000*60*60*24));
                Revision.forge({
                    refundId: req.body.id,
                    status: 'New',
                    remark: 'Update Refund Request',
                    revisedBy: req.body._userId,
                    revisedDate: req.body._updatedDate,
                    aging: aging
                }).save().then(function(){
                    res.status(200).json(finalData)
                })
            })
        })
    })
});
//#endregion

//#region update
router.put('/update/requery', function (req, res) {
    var finalData = {token: req.decoded.token };
    Refund.forge({id:req.body.id}).save({
        bankName: req.body.bankName,
        accountName: req.body.accountName,
        accountNo: req.body.accountNo,
        accountRef: req.body.accountRef,
        remark: 'Update Request',
        amendedDate: req.body._updatedDate,
        status: 'Processing'
    }).then(function(){
        Revision.query(function(qb){
            qb.select('revisedDate')
            qb.where('refundId', req.body.id)
            qb.orderBy('id', 'desc')
        }).fetch().then(function(revision){
            var nowDate = Date.now();
            var newDate = new Date(revision.get('revisedDate'));
            var revisedDate = newDate.getTime();
            var diffDate = nowDate - revisedDate;
            var aging = Math.floor(diffDate / (1000*60*60*24));
            Revision.forge({
                refundId: req.body.id,
                status: 'Processing',
                remark: 'Process Refund Request',
                revisedBy: req.body._userId,
                revisedDate: req.body._updatedDate,
                aging: aging
            }).save().then(function(){
                res.status(200).json(finalData)
            })
        })
    })
});
//#endregion

//#region user list
router.get('/user/list', function (req, res) {
    console.log('/user/list');
    console.log(req.query);
    var finalData = {token:req.decoded.token};
    var sortField = 'requestedDate'
    var sortOrder = 'desc'
    if (req.query.sortField){
        sortField = req.query.sortField
    }
    if (req.query.sortOrder){
        sortOrder = req.query.sortOrder
    }
    Refund.query(function (qb) {
        qb.select(
            'Refund.id','Refund.refundNumber','Refund.requestedDate','Refund.status','Refund.remark','Refund.refundAmount',
            'Refund.reason','Refund.reasonRemark','Customer.fullName','Customer.icNo','Customer.username'
        );
        qb.innerJoin('Customer', 'Refund.customerId', 'Customer.id');
        if (req.query.filterUserId){
            qb.where('Customer.mydataAccountId', req.query.filterUserId)
        }
        if (req.query.filterStatus && req.query.filterStatus == 'New'){
            qb.whereIn('Refund.status', ['New','To Process'])
        }
        if (req.query.filterStatus && req.query.filterStatus != 'New'){
            qb.where('Refund.status', req.query.filterStatus)
        }
        if (req.query.filterUser){
            var filterUser = '%'+req.query.filterUser+'%'
            qb.where(function () {
                this.where('fullName', 'LIKE', filterUser).orWhere('username', 'LIKE', filterUser)
            });
        }
        qb.orderBy(sortField, sortOrder)
    }).fetchPage({'pageSize':req.query.pageSize, 'page':req.query.pageNumber}).then(function (data) {
        finalData.items = data;
        finalData.totalCount = data.pagination.rowCount;
        res.status(200).json(finalData);
    })
});
//#endregion

//#region list
router.get('/list', function (req, res) {
    console.log(req.query);
    var finalData = {token:req.decoded.token};
    var sortField = 'requestedDate'
    var sortOrder = 'desc'
    if (req.query.sortField){
        sortField = req.query.sortField
    }
    if (req.query.sortOrder){
        sortOrder = req.query.sortOrder
    }
    Refund.query(function (qb) {
        qb.select(
            'Refund.id','Refund.refundNumber','Refund.requestedDate','Refund.status','Refund.remark','Refund.refundAmount',
            'Customer.fullName','Customer.icNo','Customer.username','Customer.prepaidBalance', 'Refund.reason'
        );
        qb.innerJoin('Customer', 'Refund.customerId', 'Customer.id');
        if (req.query.filterUserId){
            qb.where('Customer.id', req.query.filterUserId)
        }
        if (req.query.filterStatus && req.query.filterStatus == 'New'){
            qb.whereIn('Refund.status', ['New','To Process'])
        }
        if (req.query.filterStatus && req.query.filterStatus != 'New'){
            qb.where('Refund.status', req.query.filterStatus)
        }
        if (req.query.filterUser){
            var filterUser = '%'+req.query.filterUser+'%'
            qb.where(function () {
                this.where('fullName', 'LIKE', filterUser).orWhere('username', 'LIKE', filterUser).orWhere('refundNumber', 'LIKE', filterUser)
            });
        }
        qb.orderBy(sortField, sortOrder)
    }).fetchPage({'pageSize':req.query.pageSize, 'page':req.query.pageNumber}).then(function (data) {
        finalData.items = data;
        finalData.totalCount = data.pagination.rowCount;
        res.status(200).json(finalData);
    })
});
//#endregion

//#region new list
router.get('/new/list', function (req, res) {
    var finalData = {token:req.decoded.token};
    async.waterfall([
        // get processed refund list
        function(callback) {
            var sortField = 'Refund.id'
            var sortOrder = 'desc'
            var dateFrom = '1900-01-01 00:00:00'
            var dateTo = '2100-12-31 23:59:59'
            if (req.query.sortField){
                sortField = req.query.sortField
            }
            if (req.query.sortOrder){
                sortOrder = req.query.sortOrder
            }
            if (req.query.filterDateFrom){
                dateFrom = req.query.filterDateFrom + ' 00:00:00';
            }
            if (req.query.filterDateTo){
                dateTo = req.query.filterDateTo + ' 23:59:59';
            }
            Refund.query(function (qb) {
                qb.select(
                    'Refund.id','Refund.refundNumber','Refund.requestedDate','Refund.status','Refund.remark','Refund.reason', 'Refund.refundAmount',
                    'Customer.fullName','Customer.icNo','Customer.username','Customer.prepaidBalance'
                );
                qb.innerJoin('Customer', 'Refund.customerId', 'Customer.id');
                qb.where('Refund.status', 'New')
                qb.where('Refund.requestedDate', '>=', dateFrom);
                qb.where('Refund.requestedDate', '<=', dateTo);
                if (req.query.filterUser){
                    var filterUser = '%'+req.query.filterUser+'%'
                    qb.where(function () {
                        this.where('fullName', 'LIKE', filterUser).orWhere('username', 'LIKE', filterUser).orWhere('refundNumber', 'LIKE', filterUser)
                    });
                }
                qb.orderBy(sortField, sortOrder)
            }).fetchPage({'pageSize':req.query.pageSize, 'page':req.query.pageNumber}).then(function (data) {
                var refundList = [];
                var totalCount = data.pagination.rowCount;
                if (data.length > 0){
                    refundList = data.serialize()
                    refundList.forEach(function(item){
                        var oneDayMS = 1000 * 60 * 60 * 24;
                        var requestDate = new Date(item.requestedDate);
                        var requestDateMS = requestDate.getTime()
                        var nowDate = new Date()
                        var nowDateMS = nowDate.getTime()
                        item.aging = Math.floor((nowDateMS - requestDateMS) / oneDayMS);
                    })
                }
                callback(null, refundList, totalCount);
            })
        },
        // get revision data to calculate aging
        function(refundList, totalCount, callback) {
            if (totalCount > 0){
                Revision.query(function(qb){
                    qb.select('refundId')
                    qb.sum('aging as notAging')
                    qb.where('remark', 'Update Refund Request')
                    qb.groupBy('refundId')
                }).fetchAll().then(function(revision){
                    if (revision.length > 0){
                        refundList.forEach(function(item){
                            revision.serialize().forEach(function(element){
                                if (item.id == element.refundId){
                                    item.aging = item.aging - element.notAging;
                                }
                            })
                        })
                        callback(null, refundList, totalCount);
                    }
                    else{
                        callback(null, refundList, totalCount);
                    }
                })
            }
            else{
                callback(null, refundList, totalCount);
            } 
        }
    ], function(err, refundList, totalCount) {
        if (err) return callback(err);
        finalData.items = refundList;
        finalData.totalCount = totalCount;
        res.status(200).json(finalData);
    });
});
//#endregion

//#region reject list
router.get('/reject/list', function (req, res) {
    var finalData = {token:req.decoded.token};
    async.waterfall([
        // get processed refund list
        function(callback) {
            var sortField = 'Refund.id'
            var sortOrder = 'desc'
            var dateFrom = '1900-01-01 00:00:00'
            var dateTo = '2100-12-31 23:59:59'
            if (req.query.sortField){
                sortField = req.query.sortField
            }
            if (req.query.sortOrder){
                sortOrder = req.query.sortOrder
            }
            if (req.query.filterDateFrom){
                dateFrom = req.query.filterDateFrom + ' 00:00:00';
            }
            if (req.query.filterDateTo){
                dateTo = req.query.filterDateTo + ' 23:59:59';
            }
            Refund.query(function (qb) {
                qb.select(
                    'Refund.id','Refund.refundNumber','Refund.requestedDate','Refund.status','Refund.remark', 'Refund.reason', 'Refund.refundAmount',
                    'Customer.fullName','Customer.icNo','Customer.username','Customer.prepaidBalance'
                );
                qb.innerJoin('Customer', 'Refund.customerId', 'Customer.id');
                qb.where('Refund.status', 'Rejected')
                qb.where('Refund.requestedDate', '>=', dateFrom);
                qb.where('Refund.requestedDate', '<=', dateTo);
                if (req.query.filterUser){
                    var filterUser = '%'+req.query.filterUser+'%'
                    qb.where(function () {
                        this.where('fullName', 'LIKE', filterUser).orWhere('username', 'LIKE', filterUser).orWhere('refundNumber', 'LIKE', filterUser)
                    });
                }
                qb.orderBy(sortField, sortOrder)
            }).fetchPage({'pageSize':req.query.pageSize, 'page':req.query.pageNumber}).then(function (data) {
                var refundList = [];
                var totalCount = data.pagination.rowCount;
                if (data.length > 0){
                    refundList = data.serialize()
                    refundList.forEach(function(item){
                        var oneDayMS = 1000 * 60 * 60 * 24;
                        var requestDate = new Date(item.requestedDate);
                        var requestDateMS = requestDate.getTime()
                        var nowDate = new Date()
                        var nowDateMS = nowDate.getTime()
                        item.aging = Math.floor((nowDateMS - requestDateMS) / oneDayMS);
                    })
                }
                callback(null, refundList, totalCount);
            })
        },
        // get revision data to calculate aging
        function(refundList, totalCount, callback) {
            if (totalCount > 0){
                Revision.query(function(qb){
                    qb.select('refundId')
                    qb.sum('aging as notAging')
                    qb.where('remark', 'Update Refund Request')
                    qb.groupBy('refundId')
                }).fetchAll().then(function(revision){
                    if (revision.length > 0){
                        refundList.forEach(function(item){
                            revision.serialize().forEach(function(element){
                                if (item.id == element.refundId){
                                    item.aging = item.aging - element.notAging;
                                }
                            })
                        })
                        callback(null, refundList, totalCount);
                    }
                    else{
                        callback(null, refundList, totalCount);
                    }
                })
            }
            else{
                callback(null, refundList, totalCount);
            } 
        }
    ], function(err, refundList, totalCount) {
        if (err) return callback(err);
        finalData.items = refundList;
        finalData.totalCount = totalCount;
        res.status(200).json(finalData);
    });
});
//#endregion

//#region processing list
router.get('/process/list', function (req, res) {
    var finalData = {token:req.decoded.token};
    async.waterfall([
        // get processed refund list
        function(callback) {
            var sortField = 'Refund.id'
            var sortOrder = 'desc'
            var dateFrom = '1900-01-01 00:00:00'
            var dateTo = '2100-12-31 23:59:59'
            if (req.query.sortField){
                sortField = req.query.sortField
            }
            if (req.query.sortOrder){
                sortOrder = req.query.sortOrder
            }
            if (req.query.filterDateFrom){
                dateFrom = req.query.filterDateFrom + ' 00:00:00';
            }
            if (req.query.filterDateTo){
                dateTo = req.query.filterDateTo + ' 23:59:59';
            }
            Refund.query(function (qb) {
                qb.select(
                    'Refund.id','Refund.refundNumber','Refund.requestedDate','Refund.processedDate','Refund.status','Refund.remark','Refund.refundAmount',
                    'Customer.fullName','Customer.icNo','Customer.username','Customer.prepaidBalance', 'Refund.reason'
                );
                qb.innerJoin('Customer', 'Refund.customerId', 'Customer.id');
                qb.where('Refund.status', 'Processing')
                qb.where('Refund.processedDate', '>=', dateFrom);
                qb.where('Refund.processedDate', '<=', dateTo);
                if (req.query.filterUser){
                    var filterUser = '%'+req.query.filterUser+'%'
                    qb.where(function () {
                        this.where('fullName', 'LIKE', filterUser).orWhere('username', 'LIKE', filterUser).orWhere('refundNumber', 'LIKE', filterUser)
                    });
                }
                qb.orderBy(sortField, sortOrder)
                // qb.debug(true)
            }).fetchPage({'pageSize':req.query.pageSize, 'page':req.query.pageNumber}).then(function (data) {
                var refundList = [];
                var totalCount = data.pagination.rowCount;
                if (data.length > 0){
                    refundList = data.serialize()
                    refundList.forEach(function(item){
                        var oneDayMS = 1000 * 60 * 60 * 24;
                        var requestDate = new Date(item.requestedDate);
                        var requestDateMS = requestDate.getTime()
                        var nowDate = new Date()
                        var nowDateMS = nowDate.getTime()
                        item.aging = Math.floor((nowDateMS - requestDateMS) / oneDayMS);
                    })
                }
                callback(null, refundList, totalCount);
            })
        },
        // get revision data to calculate aging
        function(refundList, totalCount, callback) {
            if (totalCount > 0){
                Revision.query(function(qb){
                    qb.select('refundId')
                    qb.sum('aging as notAging')
                    qb.where('remark', 'Update Refund Request')
                    qb.groupBy('refundId')
                }).fetchAll().then(function(revision){
                    if (revision.length > 0){
                        refundList.forEach(function(item){
                            revision.serialize().forEach(function(element){
                                if (item.id == element.refundId){
                                    item.aging = item.aging - element.notAging;
                                }
                            })
                        })
                        callback(null, refundList, totalCount);
                    }
                    else{
                        callback(null, refundList, totalCount);
                    }
                })
            }
            else{
                callback(null, refundList, totalCount);
            } 
        }
    ], function(err, refundList, totalCount) {
        if (err) return callback(err);
        finalData.items = refundList;
        finalData.totalCount = totalCount;
        res.status(200).json(finalData);
    });
});
//#endregion

//#region requery list
router.get('/requery/list', function (req, res) {
    var finalData = {token:req.decoded.token};
    async.waterfall([
        // get processed refund list
        function(callback) {
            var sortField = 'Refund.id'
            var sortOrder = 'desc'
            var dateFrom = '1900-01-01 00:00:00'
            var dateTo = '2100-12-31 23:59:59'
            if (req.query.sortField){
                sortField = req.query.sortField
            }
            if (req.query.sortOrder){
                sortOrder = req.query.sortOrder
            }
            if (req.query.filterDateFrom){
                dateFrom = req.query.filterDateFrom + ' 00:00:00';
            }
            if (req.query.filterDateTo){
                dateTo = req.query.filterDateTo + ' 23:59:59';
            }
            Refund.query(function (qb) {
                qb.select(
                    'Refund.id','Refund.refundNumber','Refund.requestedDate','Refund.requeryDate','Refund.status','Refund.remark','Refund.refundAmount',
                    'Customer.fullName','Customer.icNo','Customer.username','Customer.prepaidBalance','Refund.reason'
                );
                qb.innerJoin('Customer', 'Refund.customerId', 'Customer.id');
                qb.where('Refund.status', 'Requery')
                qb.where('Refund.requeryDate', '>=', dateFrom);
                qb.where('Refund.requeryDate', '<=', dateTo);
                if (req.query.filterUser){
                    var filterUser = '%'+req.query.filterUser+'%'
                    qb.where(function () {
                        this.where('fullName', 'LIKE', filterUser).orWhere('username', 'LIKE', filterUser).orWhere('refundNumber', 'LIKE', filterUser)
                    });
                }
                qb.orderBy(sortField, sortOrder)
            }).fetchPage({'pageSize':req.query.pageSize, 'page':req.query.pageNumber}).then(function (data) {
                var refundList = [];
                var totalCount = data.pagination.rowCount;
                if (data.length > 0){
                    refundList = data.serialize()
                }
                callback(null, refundList, totalCount);
            })
        },
        // get revision data to calculate aging
        function(refundList, totalCount, callback) {
            if (totalCount > 0){
                Revision.query(function(qb){
                    qb.select('refundId')
                    qb.sum('aging as aging')
                    qb.where('remark', '!=', 'Update Refund Request')
                    qb.groupBy('refundId')
                }).fetchAll().then(function(revision){
                    if (revision.length > 0){
                        refundList.forEach(function(item){
                            revision.serialize().forEach(function(element){
                                if (item.id == element.refundId){
                                    item.aging = element.aging;
                                }
                            })
                        })
                        callback(null, refundList, totalCount);
                    }
                    else{
                        callback(null, refundList, totalCount);
                    }
                })
            }
            else{
                callback(null, refundList, totalCount);
            } 
        }
    ], function(err, refundList, totalCount) {
        if (err) return callback(err);
        finalData.items = refundList;
        finalData.totalCount = totalCount;
        res.status(200).json(finalData);
    });
});
//#endregion

//#region approved list
router.get('/approved/list', function (req, res) {
    var finalData = {token:req.decoded.token};
    async.waterfall([
        // get processed refund list
        function(callback) {
            var sortField = 'Refund.id'
            var sortOrder = 'desc'
            var dateFrom = '1900-01-01 00:00:00'
            var dateTo = '2100-12-31 23:59:59'
            if (req.query.sortField){
                sortField = req.query.sortField
            }
            if (req.query.sortOrder){
                sortOrder = req.query.sortOrder
            }
            if (req.query.filterDateFrom){
                dateFrom = req.query.filterDateFrom + ' 00:00:00';
            }
            if (req.query.filterDateTo){
                dateTo = req.query.filterDateTo + ' 23:59:59';
            }
            Refund.query(function (qb) {
                qb.select(
                    'Refund.id','Refund.refundNumber','Refund.requestedDate','Refund.approvedDate','Refund.status','Refund.remark','Refund.refundAmount',
                    'Customer.fullName','Customer.icNo','Customer.username','Customer.prepaidBalance','Refund.reason'
                );
                qb.innerJoin('Customer', 'Refund.customerId', 'Customer.id');
                qb.where('Refund.status', 'Approved')
                qb.where('Refund.approvedDate', '>=', dateFrom);
                qb.where('Refund.approvedDate', '<=', dateTo);
                if (req.query.filterUser){
                    var filterUser = '%'+req.query.filterUser+'%'
                    qb.where(function () {
                        this.where('fullName', 'LIKE', filterUser).orWhere('username', 'LIKE', filterUser).orWhere('refundNumber', 'LIKE', filterUser)
                    });
                }
                qb.orderBy(sortField, sortOrder)
                // qb.debug(true)
            }).fetchPage({'pageSize':req.query.pageSize, 'page':req.query.pageNumber}).then(function (data) {
                var refundList = [];
                var totalCount = data.pagination.rowCount;
                if (data.length > 0){
                    refundList = data.serialize()
                }
                callback(null, refundList, totalCount);
            })
        },
        // get revision data to calculate aging
        function(refundList, totalCount, callback) {
            if (totalCount > 0){
                Revision.query(function(qb){
                    qb.select('refundId')
                    qb.sum('aging as aging')
                    qb.where('remark', '!=', 'Update Refund Request')
                    qb.groupBy('refundId')
                }).fetchAll().then(function(revision){
                    if (revision.length > 0){
                        refundList.forEach(function(item){
                            revision.serialize().forEach(function(element){
                                if (item.id == element.refundId){
                                    item.aging = element.aging;
                                }
                            })
                        })
                        callback(null, refundList, totalCount);
                    }
                    else{
                        callback(null, refundList, totalCount);
                    }
                })
            }
            else{
                callback(null, refundList, totalCount);
            } 
        }
    ], function(err, refundList, totalCount) {
        if (err) return callback(err);
        finalData.items = refundList;
        finalData.totalCount = totalCount;
        res.status(200).json(finalData);
    });
});
//#endregion

//#region export
router.get('/list/export', function (req, res) {
    var sortField = 'Refund.id';
    var sortOrder = 'desc';
    var dateFrom = '1900-01-01 00:00:00';
    var dateTo = '2100-12-31 23:59:59';
    if (req.query.sortField){
        sortField = req.query.sortField
    }
    if (req.query.sortOrder){
        sortOrder = req.query.sortOrder
    }
    if (req.query.filterDateFrom){
        dateFrom = req.query.filterDateFrom + ' 00:00:00';
    }
    if (req.query.filterDateTo){
        dateTo = req.query.filterDateTo + ' 23:59:59';
    }
    Refund.query(function (qb) {
        if (req.query.filterStatus == 'New'){
            qb.select('Refund.requestedDate as Requested Date');
        }
        if (req.query.filterStatus == 'Processing'){
            qb.select('Refund.processedDate as Processed Date');
        }
        if (req.query.filterStatus == 'Requery'){
            qb.select('Refund.requeryDate as Requery Date');
        }
        if (req.query.filterStatus == 'Approved'){
            qb.select('Refund.approvedDate as Approved Date');
        }
        qb.select(
            'Customer.fullName as Full Name',
            'Customer.icNo as IC No',
            'Customer.companyName as Company/Business Name',
            'Customer.companyNo as Company/Business No',
            'Customer.email as Email',
            'Customer.phone as Contact No',
            'Customer.username as Username',
            'Customer.prepaidBalance as Prepaid Balance (RM)',
            'Refund.refundAmount as Refund Amount (RM)',
            'Refund.refundNumber as Refund Number',
            'Refund.reason as Reason',
            'Refund.status as Status',
            'Refund.bankName as Bank Name',
            'Refund.accountName as Account Name',
            'Refund.accountNo as Account No',
            'Refund.accountRef as IC No/Company OR Business Reg No (BRN)'
        );
        qb.innerJoin('Customer', 'Refund.customerId', 'Customer.id');
        qb.where('Refund.status', 'LIKE', req.query.filterStatus)
        if (req.query.filterStatus == 'New'){
            qb.where('Refund.requestedDate', '>=', dateFrom);
            qb.where('Refund.requestedDate', '<=', dateTo);
        }
        if (req.query.filterStatus == 'Processing'){
            qb.where('Refund.processedDate', '>=', dateFrom);
            qb.where('Refund.processedDate', '<=', dateTo);
        }
        if (req.query.filterStatus == 'Requery'){
            qb.where('Refund.requeryDate', '>=', dateFrom);
            qb.where('Refund.requeryDate', '<=', dateTo);
        }
        if (req.query.filterStatus == 'Approved'){
            qb.where('Refund.approvedDate', '>=', dateFrom);
            qb.where('Refund.approvedDate', '<=', dateTo);
        }
        if (req.query.filterUser){
            var filterUser = '%'+req.query.filterUser+'%'
            qb.where(function () {
                this.where('fullName', 'LIKE', filterUser).orWhere('username', 'LIKE', filterUser).orWhere('refundNumber', 'LIKE', filterUser)
            });
        }
        qb.orderBy(sortField, sortOrder)
    }).fetchAll().then(function(data){
        var items = data.serialize();
        items.forEach(function (item) {
            if (item['Status'] == 'New'){
                item['Requested Date'] = dateFormat(item['Requested Date'], "dd/mm/yyyy HH:MM:ss")
            }
            if (item['Status'] == 'Processing'){
                item['Processed Date'] = dateFormat(item['Processed Date'], "dd/mm/yyyy HH:MM:ss")
            }
            if (item['Status'] == 'Requery'){
                item['Requery Date'] = dateFormat(item['Requery Date'], "dd/mm/yyyy HH:MM:ss")
            }
            if (item['Status'] == 'Approved'){
                item['Approved Date'] = dateFormat(item['Approved Date'], "dd/mm/yyyy HH:MM:ss")
            }
        })
        const worksheet = XLSX.utils.json_to_sheet(items)
        const workbook = { Sheets: { 'RefundList': worksheet }, SheetNames: ['RefundList'] }
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' })
        res.status(200).end(excelBuffer)
    })
});
//#endregion

//#region report
router.get('/report', function (req, res) {
    var finalData = {token:req.decoded.token};
    var sortField = 'Refund.id'
    var sortOrder = 'desc'
    if (req.query.sortField){
        sortField = req.query.sortField
    }
    if (req.query.sortOrder){
        sortOrder = req.query.sortOrder
    }
    Refund.query(function (qb) {
        qb.select(
            'Refund.id','Refund.refundNumber','Refund.requestedDate','Refund.processedDate','Refund.status','Refund.remark','Refund.refundAmount',
            'Customer.fullName','Customer.icNo','Customer.username','Customer.prepaidBalance','Refund.reason'
        );
        qb.innerJoin('Customer', 'Refund.customerId', 'Customer.id');
        if (req.query.filterStatus){
            qb.where('Refund.status', req.query.filterStatus)
        }
        if (req.query.filterUser){
            var filterUser = '%'+req.query.filterUser+'%'
            qb.where(function () {
                this.where('fullName', 'LIKE', filterUser).orWhere('username', 'LIKE', filterUser).orWhere('refundNumber', 'LIKE', filterUser)
            });
        }
        qb.orderBy(sortField, sortOrder)
    }).fetchPage({'pageSize':req.query.pageSize, 'page':req.query.pageNumber}).then(function (data) {
        var refundList = [];
        if (data.length > 0){
            refundList = data.serialize();
        }
        Revision.query(function(qb){
            qb.select('refundId','remark','aging')
            // qb.sum('aging as aging')
            qb.where('remark', '!=', 'Update Refund Request')
        }).fetchAll().then(function(revision){
            if (revision.length > 0){
                refundList.forEach(function(item){
                    if (item.status == 'New'){
                        var oneDayMS = 1000 * 60 * 60 * 24;
                        var requestedDate = new Date(item.requestedDate);
                        var requestedDateMS = requestedDate.getTime()
                        var nowDate = new Date()
                        var nowDateMS = nowDate.getTime()
                        item.aging = Math.floor((nowDateMS - requestedDateMS) / oneDayMS);
                    }
                    else if (item.status == 'Processing'){
                        var oneDayMS = 1000 * 60 * 60 * 24;
                        var processedDate = new Date(item.processedDate);
                        var processedDateMS = processedDate.getTime()
                        var nowDate = new Date()
                        var nowDateMS = nowDate.getTime()
                        item.aging = Math.floor((nowDateMS - processedDateMS) / oneDayMS);
                    }
                    else{
                        item.aging = 0;
                    }
                    revision.serialize().forEach(function(element){
                        if (item.id == element.refundId){
                            item.aging += element.aging;
                        }
                    })
                })
            }
            finalData.items = refundList;
            finalData.totalCount = data.pagination.rowCount;
            Refund.query(function(qb){
                qb.sum('Refund.refundAmount as total')
                qb.count('Refund.id as count')
                qb.innerJoin('Customer', 'Refund.customerId', 'Customer.id');
                if (req.query.filterStatus){
                    qb.where('Refund.status', req.query.filterStatus)
                }
                if (req.query.filterUser){
                    var filterUser = '%'+req.query.filterUser+'%'
                    qb.where(function () {
                        this.where('fullName', 'LIKE', filterUser).orWhere('username', 'LIKE', filterUser)
                    });
                }
            }).fetch().then(function (sumRefund) {
                finalData.summary = sumRefund;
                res.status(200).json(finalData);
            })
        })
    })
});
//#endregion

//#region report widget
router.get('/report/widget', function (req, res) {
    var finalData = {token:req.decoded.token};
    Refund.query(function (qb) {
        qb.select('Refund.status','Refund.refundAmount as prepaidBalance');
        qb.innerJoin('Customer', 'Refund.customerId', 'Customer.id');
    }).fetchAll().then(function (refund) {
        var widget = {};
        var totalAll = 0;
        var totalNew = 0;
        var totalProcessing = 0;
        var totalRequery = 0;
        var totalApproved = 0;
        var percentNew = 0;
        var percentProcessing = 0;
        var percentRequery = 0;
        var percentApproved = 0;
        if (refund.length > 0){
            refund.serialize().forEach(function(item){
                totalAll += item.prepaidBalance;
                widget.all = {total: totalAll};
                if (item.status == 'New'){
                    totalNew += item.prepaidBalance;
                }
                if (item.status == 'Processing'){
                    totalProcessing += item.prepaidBalance;
                }
                if (item.status == 'Requery' || item.status == 'To Process'){
                    totalRequery += item.prepaidBalance;
                }
                if (item.status == 'Approved'){
                    totalApproved += item.prepaidBalance;
                }
            })
            if (totalNew > 0){
                var calcPercent = (totalNew * 100) / totalAll
                percentNew = Math.round(calcPercent * 100) / 100; 
            }
            if (totalProcessing > 0){
                var calcPercent = (totalProcessing * 100) / totalAll
                percentProcessing = Math.round(calcPercent * 100) / 100; 
            }
            if (totalRequery > 0){
                var calcPercent = (totalRequery * 100) / totalAll
                percentRequery = Math.round(calcPercent * 100) / 100; 
            }
            if (totalApproved > 0){
                var calcPercent = (totalApproved * 100) / totalAll
                percentApproved = Math.round(calcPercent * 100) / 100; 
            }
        }
        widget.all = {total:totalAll}
        widget.new = {total:totalNew, percent:percentNew}
        widget.processing = {total:totalProcessing, percent:percentProcessing}
        widget.requery = {total:totalRequery, percent:percentRequery}
        widget.approved = {total:totalApproved, percent:percentApproved}
        finalData.widget = widget;
        res.status(200).json(finalData);
    })
});
//#endregion

//#region view
router.get('/view', function (req, res) {
    var finalData = {token:req.decoded.token};
    Refund.query(function (qb) {
        qb.select(
            'Refund.id','Refund.refundNumber','Refund.requestedDate','Refund.status','Refund.bankName','Refund.accountNo','Refund.accountRef','Refund.reason',
            'Refund.reasonRemark', 'Refund.refundAmount',
            'Customer.fullName','Customer.icNo','Customer.username','Customer.email','Customer.phone','Customer.companyName','Customer.companyNo',
            'Refund.accountName','Refund.remark','Refund.attachmentId','Customer.prepaidBalance','Customer.id as userId'
        );
        qb.innerJoin('Customer', 'Refund.customerId', 'Customer.id');
        qb.where('Refund.id', req.query.refundId)
    }).fetch().then(function (data) {
        finalData.items = data.serialize();
        Order.query(function(qb){
            qb.select('id','orderNumber','invoiceNumber','description','amount')
            qb.where('refundId', req.query.refundId)
        }).fetchAll().then(function(orderItem){
            var orders = [];
            if (orderItem.length > 0){
                var orders = orderItem.serialize()
                
            }
            finalData.orderItem = orders;

            Revision.query(function(qb){
                qb.select('reference as remarkList', 'referenceDesc as remarkDesc')
                qb.where('refundId', data.get('id'))
                qb.where('status', data.get('status'))
                qb.orderBy('id', 'desc')
            }).fetch().then(function(remark){
                var remarkList = null;
                var remarkDesc = null;
                if (remark){
                    remarkList = remark.get('remarkList');
                    remarkDesc = remark.get('remarkDesc');
                }
                finalData.items.remarkList = remarkList;
                finalData.items.remarkDesc = remarkDesc;
                Revision.query(function(qb){
                    qb.select('Revision.status','Revision.remark','Revision.reference','Revision.referenceDesc','Revision.revisedDate','Customer.fullName')
                    qb.innerJoin('Customer','Customer.id','Revision.revisedBy')
                    qb.where('refundId', data.get('id'))
                }).fetchAll().then(function(timeline){
                    var timeline = timeline.serialize()
                    finalData.timeline = timeline
                    res.status(200).json(finalData);
                })
            })
        })
    })
});
//#endregion

//#region view user refund
router.get('/user/view', function (req, res) {
    var finalData = {token:req.decoded.token};
    console.log(req.query);
    Refund.query(function (qb) {
        qb.select(
            'Refund.id','Refund.refundNumber','Refund.requestedDate','Refund.status','Refund.bankName','Refund.accountNo','Refund.accountRef','Refund.reason',
            'Refund.reasonRemark','Refund.refundAmount',
            'Customer.fullName','Customer.icNo','Customer.username','Customer.email','Customer.phone','Customer.companyName','Customer.companyNo',
            'Refund.accountName','Refund.remark','Refund.attachmentId','Customer.prepaidBalance','Customer.id as userId'
        );
        qb.innerJoin('Customer', 'Refund.customerId', 'Customer.id');
        qb.innerJoin('Order', 'Refund.id', 'Order.refundId');
        qb.where(function () {
            if (req.query.userId) {
                this.
                    where('Customer.mydataUserId', '=', req.query.userId);
            }
        });
        qb.where('Refund.id', req.query.refundId)
        // qb.debug(true)
    }).fetch().then(function (data) {
        var newDate = new Date();
        var requestedDate = dateFormat(newDate, "dd-mm-yyyy HH:MM:ss");
        finalData.requestDate = requestedDate;
        finalData.items = data.serialize();

        Revision.query(function(qb){
            qb.select('reference as remarkList', 'referenceDesc as remarkDesc')
            qb.where('refundId', data.get('id'))
            qb.where('status', data.get('status'))
            qb.orderBy('id', 'desc')
        }).fetch().then(function(remark){
            var remarkList = null;
            var remarkDesc = null;
            if (remark){
                remarkList = remark.get('remarkList');
                remarkDesc = remark.get('remarkDesc');
            }
            finalData.items.remarkList = remarkList;
            finalData.items.remarkDesc = remarkDesc;
            Revision.query(function(qb){
                qb.select('Revision.status','Revision.remark','Revision.reference','Revision.referenceDesc','Revision.revisedDate','Customer.fullName')
                qb.innerJoin('Customer','Customer.id','Revision.revisedBy')
                qb.where('refundId', data.get('id'))
            }).fetchAll().then(function(timeline){
                var timeline = timeline.serialize()
                finalData.timeline = timeline

                Order.query(function(qb){
                    qb.select('invoiceNumber', 'orderNumber', 'amount', 'description')
                    qb.where('refundId', data.get('id'))
                }).fetchAll().then(function(orderData){
                    var orderData = orderData.serialize()
                    finalData.orderData = orderData
                    res.status(200).json(finalData);
                })
            })
        })
    })
});
//#endregion

//#region get new customer details
router.get('/customer', function (req, res) {
    var finalData = {token:req.decoded.token};
    console.log('customer');
    console.log(req.query.userId);
    Customer.query(function (qb) {
        qb.select('id as userId', 'fullName', 'username', 'role', 'email', 'phone', 'prepaidBalance', 'mydataAccountId as accountId');
        qb.where('id', req.query.userId)
    }).fetch().then(function (data) {
        finalData.items = data.serialize();
        res.status(200).json(finalData);
    })
});
//#endregion

//#region get new customer details
router.get('/customer/mydata', function (req, res) {
    var finalData = {token:req.decoded.token};
    console.log('customer/mydata');
    console.log(req.query.userId);
    Customer.query(function (qb) {
        qb.select('id as userId', 'fullName', 'username', 'role', 'email', 'phone', 'prepaidBalance', 'mydataAccountId as accountId');
        qb.where('mydataUserId', req.query.userId)
    }).fetch().then(function (data) {
        finalData.items = data.serialize();
        res.status(200).json(finalData);
    })
});
//#endregion

//#region process
router.put('/process', function (req, res) {
    console.log(req.body)
    var finalData = {token: req.decoded.token };
    Refund.forge({id:req.body.id}).save({
        status:'Processing',
        processedDate: req.body._updatedDate, 
        remark:null
    }).then(function(){
        Revision.query(function(qb){
            qb.select('revisedDate')
            qb.where('refundId', req.body.id)
            qb.orderBy('id', 'desc')
        }).fetch().then(function(revision){
            var nowDate = Date.now();
            var newDate = new Date(revision.get('revisedDate'));
            var revisedDate = newDate.getTime();
            var diffDate = nowDate - revisedDate;
            var aging = Math.floor(diffDate / (1000*60*60*24));
            Revision.forge({
                refundId: req.body.id,
                status: 'Processing',
                remark: 'Process Refund Request',
                revisedBy: req.body._userId,
                revisedDate: req.body._updatedDate,
                aging: aging
            }).save().then(function(){
                Customer.query(function(qb){
                    qb.select('Customer.fullName', 'Customer.email', 'Customer.code','Refund.refundNumber')
                    qb.innerJoin('Refund', 'Refund.customerId', 'Customer.id')
                    qb.where('Refund.id', req.body.id)
                }).fetch().then(function(customer){
                    
                    if(customer.get('code')=='MYEX' || customer.get('code')=='MYCT'){
                        var tokenVal = {
                            id: req.body.id,
                        };
                        var token = jwt.sign(tokenVal, 'ilovemydata', {
                            // expiresIn: '10080m'
                        });
                        sendEmailNotification.sendEmailNotification(customer.get('email'),customer.get('fullName'),'Your refund request has been process.','process',customer.get('refundNumber'),token)
                    }
                    // else{
                    //     sendEmail.sendEmail(customer.get('email'),customer.get('fullName'),'Your refund request has been rejected.','reject',req.body.refundNumber)
                    // }
    
                    res.status(200).json(finalData)
                  
                })
            })
        })
    })
});
//#endregion

//#region approve
router.put('/reject', function (req, res) {
    console.log(req.body);
    console.log(req.bodyvvvvvv);
    var finalData = {token: req.decoded.token };
    Refund.forge({id:req.body.id}).save({
        status:'Rejected',
        rejectedDate: req.body._updatedDate, 
        remark:req.body.remark
    }).then(function(){
        Revision.query(function(qb){
            qb.select('id','revisedDate')
            qb.where('refundId', req.body.id)
            qb.orderBy('id', 'desc')
        }).fetch().then(function(revision){
            var nowDate = Date.now();
            var newDate = new Date(revision.get('revisedDate'));
            var revisedDate = newDate.getTime();
            var diffDate = nowDate - revisedDate;
            var aging = Math.floor(diffDate / (1000*60*60*24));
            Revision.forge({id:revision.get('id')}).save({
                refundId: req.body.id,
                status: 'Rejected',
                remark: req.body.remark,
                revisedBy: req.body._userId,
                revisedDate: req.body._updatedDate,
                aging: aging
            }).then(function(){
                Customer.query(function(qb){
                    qb.select('Customer.fullName', 'Customer.email', 'Customer.code')
                    qb.innerJoin('Refund', 'Refund.customerId ', 'Customer.id')
                    qb.where('Refund.id', req.body.id)
                }).fetch().then(function(customer){
                    if(customer.get('code')=='MYEX' || customer.get('code')=='MYCT'){
                        var tokenVal = {
                            id: req.body.id,
                        };
                        var token = jwt.sign(tokenVal, 'ilovemydata', {
                            // expiresIn: '10080m'
                        });
                        sendEmailNotification.sendEmailNotification(customer.get('email'),customer.get('fullName'),'Your refund request has been rejected.','reject',req.body.refundNumber,token)
                    }else{
                        sendEmail.sendEmail(customer.get('email'),customer.get('fullName'),'Your refund request has been rejected.','reject',req.body.refundNumber)
                    }
    
                    res.status(200).json(finalData)
                  
                })
            })
        })
    })
});
//#endregion

//#region approve
router.put('/approve', function (req, res) {
    var finalData = {token: req.decoded.token };
    Refund.forge({id:req.body.id}).save({
        status:'Approved',
        approvedDate: req.body._updatedDate, 
        remark:'Successfully refund'
    }).then(function(){
        Revision.query(function(qb){
            qb.select('revisedDate')
            qb.where('refundId', req.body.id)
            qb.orderBy('id', 'desc')
        }).fetch().then(function(revision){
            var nowDate = Date.now();
            var newDate = new Date(revision.get('revisedDate'));
            var revisedDate = newDate.getTime();
            var diffDate = nowDate - revisedDate;
            var aging = Math.floor(diffDate / (1000*60*60*24));
            Revision.forge({
                refundId: req.body.id,
                status: 'Approved',
                remark: 'Successfully refund prepaid balance to customer',
                revisedBy: req.body._userId,
                revisedDate: req.body._updatedDate,
                aging: aging
            }).save().then(function(){ 
                Customer.query(function(qb){
                    qb.select('Customer.fullName', 'Customer.email', 'Customer.code')
                    qb.innerJoin('Refund', 'Refund.customerId ', 'Customer.id')
                    qb.where('Refund.id', req.body.id)
                }).fetch().then(function(customer){
                    if(customer.get('code')=='MYEX' || customer.get('code')=='MYCT'){
                        var tokenVal = {
                            id: req.body.id,
                        };
                        var token = jwt.sign(tokenVal, 'ilovemydata', {
                            // expiresIn: '10080m'
                        });
                        sendEmailNotification.sendEmailNotification(customer.get('email'),customer.get('fullName'),'Your refund request has been approved.','approve',req.body.refundNumber,token)
                    }else{
                        sendEmail.sendEmail(customer.get('email'),customer.get('fullName'),'Your refund request has been approved.','approve',req.body.refundNumber)
                    }
    
                    res.status(200).json(finalData)
                  
                })
            })
        })
    })
});
//#endregion

//#region requery
router.put('/requery', function (req, res) {
    console.log(req.body)
    var finalData = {token: req.decoded.token };
    Refund.forge({id:req.body.id}).save({
        status:'Requery', 
        requeryDate: req.body._updatedDate,
        remark:'Incomplete Request'
    }).then(function(){
        Revision.query(function(qb){
            qb.select('revisedDate')
            qb.where('refundId', req.body.id)
            qb.orderBy('id', 'desc')
        }).fetch().then(function(revision){
            var nowDate = Date.now();
            var newDate = new Date(revision.get('revisedDate'));
            var revisedDate = newDate.getTime();
            var diffDate = nowDate - revisedDate;
            var aging = Math.floor(diffDate / (1000*60*60*24));
            Revision.forge({
                refundId: req.body.id,
                status: 'Requery',
                remark: 'Requery Refund Request',
                reference: req.body.remark,
                referenceDesc: req.body.remarkDesc,
                revisedBy: req.body._userId,
                revisedDate: req.body._updatedDate,
                aging: aging
            }).save().then(function(){
                Customer.query(function(qb){
                    qb.select('Customer.fullName', 'Customer.email', 'Customer.code')
                    qb.innerJoin('Refund', 'Refund.customerId ', 'Customer.id')
                    qb.where('Refund.id', req.body.id)
                }).fetch().then(function(customer){
                    if(customer.get('code')=='MYEX' || customer.get('code')=='MYCT'){
                        var tokenVal = {
                            id: req.body.id,
                        };
                        var token = jwt.sign(tokenVal, 'ilovemydata', {
                            // expiresIn: '10080m'
                        });
                        sendEmailNotification.sendEmailNotification(customer.get('email'),customer.get('fullName'),'Incomplete or wrong information provided.','requery',req.body.refundNumber,token)
                    }else{
                        sendEmail.sendEmail(customer.get('email'),customer.get('fullName'),'Incomplete or wrong information provided.','requery',req.body.refundNumber)
                    }
    
                    res.status(200).json(finalData)
                  
                })
            })
        })
    })
});
//#endregion

//#region renew
router.put('/renew', function (req, res) {
    var finalData = {token: req.decoded.token };
    Refund.forge({id:req.body.id}).save({status:'New', remark:null}).then(function(){
        Revision.query(function(qb){
            qb.select('revisedDate')
            qb.where('refundId', req.body.id)
            qb.orderBy('id', 'desc')
        }).fetch().then(function(revision){
            var nowDate = Date.now();
            var newDate = new Date(revision.get('revisedDate'));
            var revisedDate = newDate.getTime();
            var diffDate = nowDate - revisedDate;
            var aging = Math.floor(diffDate / (1000*60*60*24));
            Revision.forge({
                refundId: req.body.id,
                status: 'New',
                remark: 'Reset Refund Request',
                revisedBy: req.body._userId,
                revisedDate: req.body._updatedDate,
                aging: aging
            }).save().then(function(){ 
                res.status(200).json(finalData)
            })
        })
    })
});
//#endregion

//#region bank list
router.get('/getBankList', function (req, res) {
    console.log('/getBankList');
    
    var finalData = {token:req.decoded.token};
    BankList.query(function (qb) {
        qb.select('name');
        qb.orderBy('name', 'asc')
    }).fetchAll().then(function (data) {
        finalData.items = data;
        res.status(200).json(finalData);
    })
});
//#endregion

module.exports = router;