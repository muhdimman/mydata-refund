var express = require('express');
// var cors = require('cors');
var app = express();
var server = require('http').Server(app);
// var jwt = require('jsonwebtoken');
// var bodyParser = require('body-parser');
// var Client = require('node-rest-client').Client;
// var appSetting = require('./app-setting.json');
// var path = require('path');
var mysql = require('mysql');
var con = mysql.createConnection({
    // connectionLimit: 10,
    host: "172.19.194.76",
    user: "apiuser",
    database: "mydataapi",
    password: "xs@4pImysql",
});

app.get('/viewProductList', function (req, res) {
    console.log('View product list.')
    con.connect(function(err) {
        if (err) throw err;
        con.query("SELECT id, description FROM product", function (err, result) {
          if (err) throw err;
          console.log(result);
          res.status(200).json(result);
        });
    });
});

app.post('/updateInvoiceLine', function (req, res) {
    console.log('Update invoice '+req.body.invoiceid+' line.')
    con.connect(function (err) {
        if (err) throw err;
        console.log("Database connected!");
        // var sql = "INSERT INTO `mydataapi`.`invoicelines`(`invoicedate`, `ordernumber`, `invoiceid`, `productid`, `ssmprice`, `ssmcert`, `ssmtax`, `ssmamt`, `mydcharge`, `mydcert`, `myddisc`, `mydamtnet`, `mydtaxnet`, `totalnet`, `mydamt`, `mydtax`, `totalgross`) VALUES ('2019-10-30 16:49:00', 'MYDL2019103001545', 1061774, 1, 10.00, 0.00, 0.00, 10.00, 5.00, 0.00, 0.00, 5.00, 0.30, 15.30, 5.00, 0.30, 15.30)";
        if (req.body.productid == 1 || req.body.productid == 2 || req.body.productid == 27 || req.body.productid == 37){
            var sql = "INSERT INTO `mydataapi`.`invoicelines`(`invoicedate`, `ordernumber`, `invoiceid`, `productid`, `ssmprice`, `ssmcert`, `ssmtax`, `ssmamt`, `mydcharge`, `mydcert`, `myddisc`, `mydamtnet`, `mydtaxnet`, `totalnet`, `mydamt`, `mydtax`, `totalgross`) VALUES ('"+req.body.invoicedate+"', '"+req.body.ordernumber+"', "+req.body.invoiceid+", "+req.body.productid+", 10.00, 0.00, 0.00, 10.00, 5.00, 0.00, 0.00, 5.00, 0.30, 15.30, 5.00, 0.30, 15.30)";
        }
        else if (req.body.productid == 3 || req.body.productid == 7 || req.body.productid == 9 || req.body.productid == 15 || req.body.productid == 30 || req.body.productid == 32 || req.body.productid == 34 || req.body.productid == 39){
            var sql = "INSERT INTO `mydataapi`.`invoicelines`(`invoicedate`, `ordernumber`, `invoiceid`, `productid`, `ssmprice`, `ssmcert`, `ssmtax`, `ssmamt`, `mydcharge`, `mydcert`, `myddisc`, `mydamtnet`, `mydtaxnet`, `totalnet`, `mydamt`, `mydtax`, `totalgross`) VALUES ('"+req.body.invoicedate+"', '"+req.body.ordernumber+"', "+req.body.invoiceid+", "+req.body.productid+", 20.00, 0.00, 0.00, 20.00, 5.00, 0.00, 0.00, 5.00, 0.30, 25.30, 5.00, 0.30, 25.30)";
        }
        else if (req.body.productid == 4){
            var sql = "INSERT INTO `mydataapi`.`invoicelines`(`invoicedate`, `ordernumber`, `invoiceid`, `productid`, `ssmprice`, `ssmcert`, `ssmtax`, `ssmamt`, `mydcharge`, `mydcert`, `myddisc`, `mydamtnet`, `mydtaxnet`, `totalnet`, `mydamt`, `mydtax`, `totalgross`) VALUES ('"+req.body.invoicedate+"', '"+req.body.ordernumber+"', "+req.body.invoiceid+", "+req.body.productid+", 10.00, 10.00, 0.00, 20.00, 5.00, 5.00, 0.00, 10.00, 0.60, 30.60, 10.00, 0.60, 30.60)";
        }
        else if (req.body.productid == 5 || req.body.productid == 8 || req.body.productid == 10 || req.body.productid == 31 || req.body.productid == 33 || req.body.productid == 35 || req.body.productid == 36 || req.body.productid == 38 || req.body.productid == 40){
            var sql = "INSERT INTO `mydataapi`.`invoicelines`(`invoicedate`, `ordernumber`, `invoiceid`, `productid`, `ssmprice`, `ssmcert`, `ssmtax`, `ssmamt`, `mydcharge`, `mydcert`, `myddisc`, `mydamtnet`, `mydtaxnet`, `totalnet`, `mydamt`, `mydtax`, `totalgross`) VALUES ('"+req.body.invoicedate+"', '"+req.body.ordernumber+"', "+req.body.invoiceid+", "+req.body.productid+", 20.00, 10.00, 0.00, 30.00, 5.00, 5.00, 0.00, 10.00, 0.60, 40.60, 10.00, 0.60, 40.60)";
        }
        else if (req.body.productid == 6){
            var sql = "INSERT INTO `mydataapi`.`invoicelines`(`invoicedate`, `ordernumber`, `invoiceid`, `productid`, `ssmprice`, `ssmcert`, `ssmtax`, `ssmamt`, `mydcharge`, `mydcert`, `myddisc`, `mydamtnet`, `mydtaxnet`, `totalnet`, `mydamt`, `mydtax`, `totalgross`) VALUES ('"+req.body.invoicedate+"', '"+req.body.ordernumber+"', "+req.body.invoiceid+", "+req.body.productid+", 10.00, 5.00, 0.00, 15.00, 5.00, 5.00, 0.00, 10.00, 0.60, 25.60, 10.00, 0.60, 25.60)";
        }
        else if (req.body.productid == 13){
            var sql = "INSERT INTO `mydataapi`.`invoicelines`(`invoicedate`, `ordernumber`, `invoiceid`, `productid`, `ssmprice`, `ssmcert`, `ssmtax`, `ssmamt`, `mydcharge`, `mydcert`, `myddisc`, `mydamtnet`, `mydtaxnet`, `totalnet`, `mydamt`, `mydtax`, `totalgross`) VALUES ('"+req.body.invoicedate+"', '"+req.body.ordernumber+"', "+req.body.invoiceid+", "+req.body.productid+", 10.00, 0.00, 0.00, 10.00, 5.00, 5.00, 0.00, 10.00, 0.60, 20.60, 10.00, 0.60, 20.60)";
        }
        else if (req.body.productid == 22){
            var sql = "INSERT INTO `mydataapi`.`invoicelines`(`invoicedate`, `ordernumber`, `invoiceid`, `productid`, `ssmprice`, `ssmcert`, `ssmtax`, `ssmamt`, `mydcharge`, `mydcert`, `myddisc`, `mydamtnet`, `mydtaxnet`, `totalnet`, `mydamt`, `mydtax`, `totalgross`) VALUES ('"+req.body.invoicedate+"', '"+req.body.ordernumber+"', "+req.body.invoiceid+", "+req.body.productid+", 10.00, 0.00, 0.00, 10.00, 5.00, 0.00, 0.00, 5.00, 0.30, 15.30, 5.00, 0.30, 15.30)";
        }
        else if (req.body.productid == 23){
            var sql = "INSERT INTO `mydataapi`.`invoicelines`(`invoicedate`, `ordernumber`, `invoiceid`, `productid`, `ssmprice`, `ssmcert`, `ssmtax`, `ssmamt`, `mydcharge`, `mydcert`, `myddisc`, `mydamtnet`, `mydtaxnet`, `totalnet`, `mydamt`, `mydtax`, `totalgross`) VALUES ('"+req.body.invoicedate+"', '"+req.body.ordernumber+"', "+req.body.invoiceid+", "+req.body.productid+", 10.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 10.00)";
        }
        else if (req.body.productid == 24){
            var sql = "INSERT INTO `mydataapi`.`invoicelines`(`invoicedate`, `ordernumber`, `invoiceid`, `productid`, `ssmprice`, `ssmcert`, `ssmtax`, `ssmamt`, `mydcharge`, `mydcert`, `myddisc`, `mydamtnet`, `mydtaxnet`, `totalnet`, `mydamt`, `mydtax`, `totalgross`) VALUES ('"+req.body.invoicedate+"', '"+req.body.ordernumber+"', "+req.body.invoiceid+", "+req.body.productid+", 10.00, 10.00, 0.00, 20.00, 0.00, 5.00, 0.00, 5.00, 0.30, 25.30, 5.00, 0.30, 25.30)";
        }
        else if (req.body.productid == 25){
            var sql = "INSERT INTO `mydataapi`.`invoicelines`(`invoicedate`, `ordernumber`, `invoiceid`, `productid`, `ssmprice`, `ssmcert`, `ssmtax`, `ssmamt`, `mydcharge`, `mydcert`, `myddisc`, `mydamtnet`, `mydtaxnet`, `totalnet`, `mydamt`, `mydtax`, `totalgross`) VALUES ('"+req.body.invoicedate+"', '"+req.body.ordernumber+"', "+req.body.invoiceid+", "+req.body.productid+", 0.00, 0.00, 0.00, 0.00, 5.00, 0.00, 0.00, 5.00, 0.30, 5.30, 5.00, 0.30, 5.30)";
        }
        else{
            var sql = "INSERT INTO `mydataapi`.`invoicelines`(`invoicedate`, `ordernumber`, `invoiceid`, `productid`, `ssmprice`, `ssmcert`, `ssmtax`, `ssmamt`, `mydcharge`, `mydcert`, `myddisc`, `mydamtnet`, `mydtaxnet`, `totalnet`, `mydamt`, `mydtax`, `totalgross`) VALUES ('"+req.body.invoicedate+"', '"+req.body.ordernumber+"', "+req.body.invoiceid+", "+req.body.productid+", 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00)";
        }        
        con.query(sql, function (err, result) {
            con.end();
            if (err) {
                // throw err;
                console.log(err);
                res.status(400).json({status:'Failed', message:err});
            }
            console.log(result);
            console.log('Order number '+req.body.ordernumber+' added!');
            res.status(200).json({status:'Success', message:'Invoice line added'});
        });
    });
});

app.get('/viewInvoiceLine', function (req, res) {
    console.log('View invoice line.');
    console.log(req.query.invoiceid);
    con.connect(function(err) {
        if (err) throw err;
        con.query("SELECT * FROM invoicelines WHERE invoiceid = "+req.query.invoiceid, function (err, result) {
            if (err) throw err;
            console.log(result);
            con.end();
            res.status(200).json(result);
        });
    });
});

server.listen(88, function () {
    console.log('Server is listening on localhost:88');
});
