var express = require('express');
var router = express.Router();
var multer = require('multer');
var path = require('path');
var dateFormat = require('dateformat');
var appSetting = require('./../app-setting.json');
var fs = require('fs');

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
var Attachment = Bookshelf.Model.extend({
    tableName: 'Attachment',
    hasTimestamps: true
});
var Refund = Bookshelf.Model.extend({
    tableName: 'Refund',
    hasTimestamps: true
});
var Order = Bookshelf.Model.extend({
    tableName: 'Order',
    hasTimestamps: true
});

var store = multer.diskStorage({
    destination:function(req,file,cb){
        var dir = './../uploads/'+req.headers.userid
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir);
        }
        cb(null, dir);
    },
    filename:function(req,file,cb){
        // cb(null, dateFormat(Date.now(), "yyyymmdd")+'-'+req.headers.userid+'.'+file.originalname);
        cb(null, file.originalname);
    }
});
var upload = multer({storage:store}).single('file');

router.post('/upload', function(req,res){
    upload(req,res,function(err){
        if(err){
            return res.status(501).json({error:err});
        }
        //do all database record saving activity
        Attachment.forge({
            refundAttachmentId: req.headers.userid,
            fileName: req.file.filename
        }).save().then(function(){
            return res.json({uploadname:req.file.filename});
        })
    });
});

router.get('/download', function(req, res){
    filepath = './../uploads/' + req.query.fileId + '/' + req.query.fileName;
    // filepath = path.join(__dirname,'../uploads/1') +'/'+ 'mydata.png';
    console.log(filepath)
    res.download(filepath);
  })

router.put('/remove', function(req, res){
    var dir = './../uploads/' + req.body.attachmentId
    fs.readdir(dir, (err, files) => {
        if (err){
            res.status(200).json({success:false, error:err});
        };
        for (const file of files) {
            if (file == req.body.fileName){
                fs.unlink(path.join(dir, file), err => {
                    if (err) {
                        res.status(200).json({success:false, error:err});
                    };
                    Attachment.where('id', req.body.fileId).destroy().then(function(){
                        res.status(200).json({success:true});
                    })
                });
            }
        }
    });
});

router.get('/downloadRefund', function (req, res) {
    console.log('getRefundDetail')
    var Jasper = require('jasper-node-client')({
        baseUrl: appSetting.reportUrl,
        userName: 'anonymousUser',
        password: '',
        headers: {authorization:'Basic amFzcGVyYWRtaW46amFzcGVyYWRtaW4=', accept:'application/json'}
    })
    var jasper = new Jasper()
    var reportPath = '/reports/Refund'
    var reportName = '/Refund'
    var fileFormat = 'pdf'
    var params = {refundId: req.query.refundId}
    jasper.requestReport(reportPath, reportName, fileFormat, params, (err, response, headers) => {
        if (err != null) {
            console.log(err)
        } 
        else {
            res.writeHead(200, headers)
            res.end(response)
        }
    });

});

//#region view
router.get('/getRefundDetail', function (req, res) {
    var finalData = {};
    Refund.query(function (qb) {
        qb.select(
            'Refund.id','Refund.requestedDate','Refund.status','Refund.bankName','Refund.accountNo','Refund.accountRef','Refund.reason',
            'Customer.fullName','Customer.icNo','Customer.username','Customer.email','Customer.phone','Customer.companyName','Customer.companyNo',
            'Refund.accountName','Refund.remark','Refund.attachmentId','Customer.prepaidBalance'
        );
        qb.innerJoin('Customer', 'Refund.customerId', 'Customer.id');
        qb.where('Refund.id', req.query.refundId)
    }).fetch().then(function (data) {
        var items = {}
        if (data){
            items = data.serialize();
            items.requestedDate = dateFormat(items.requestedDate, "dd/mm/yyyy HH:MM:ss");
        }
        finalData = items;
        res.status(200).json(finalData);
    })
});
//#endregion

//#region view
router.get('/getRefund', function (req, res) {
    var finalData = {};
    Refund.query(function (qb) {
        qb.select(
            'Refund.id','Refund.requestedDate','Refund.status','Refund.bankName','Refund.accountNo','Refund.accountRef','Refund.reason',
            'Customer.fullName','Customer.icNo','Customer.username','Customer.email','Customer.phone','Customer.companyName','Customer.companyNo',
            'Refund.accountName','Refund.remark','Refund.attachmentId','Customer.prepaidBalance','Refund.refundAmount','Refund.refundNumber'
        );
        qb.innerJoin('Customer', 'Refund.customerId', 'Customer.id');
        qb.where('Refund.id', req.query.refundId)
    }).fetch().then(function (data) {
        var items = {}
        if (data){
            items = data.serialize();
            items.requestedDate = dateFormat(items.requestedDate, "dd/mm/yyyy HH:MM:ss");

            Order.query(function(qb){
                qb.select('invoiceNumber', 'orderNumber', 'amount', 'description')
                qb.where('refundId', req.query.refundId)
            }).fetchAll().then(function(orderData){
                var orderItem = orderData.serialize()
                items.invoiceNumber = orderItem[0].invoiceNumber
                items.orders = orderItem;
                finalData = items;

                res.status(200).json(finalData);
            })

        }
    })
});
//#endregion



module.exports = router;