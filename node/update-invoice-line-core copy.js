var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var bodyParser = require('body-parser');
var Client = require('node-rest-client').Client;
var appSetting = require('./../app-setting.json');
var dateFormat = require('dateformat');
var mysql = require('mysql');
var knex = require('knex')({
	client: 'mysql',
	connection: {
		host: "172.19.194.76",
		user: "apiuser",
		database: "mydataapi",
		password: "xs@4pImysql",
		charset: "utf8"
	}
});

var Bookshelf = require('bookshelf')(knex);
Bookshelf.plugin('pagination');
router.use(bodyParser.json());

var Invoice = Bookshelf.Model.extend({
	tableName: 'invoicelines',
	hasTimestamps: true
});
var Product = Bookshelf.Model.extend({
	tableName: 'product',
	hasTimestamps: true
});
var Order = Bookshelf.Model.extend({
	tableName: 'order',
	hasTimestamps: true
});

var con = mysql.createConnection({
		host: "172.19.194.76",
		user: "apiuser",
		database: "mydataapi",
		password: "xs@4pImysql",
  });
var con2 = mysql.createConnection({
	host: "172.19.194.76",
	user: "apiuser",
	database: "mydataapi",
	password: "xs@4pImysql",
  });
  var pool        = mysql.createPool({
    connectionLimit : 10, // default = 10
	host: "172.19.194.76",
	user: "apiuser",
	database: "mydataapi",
	password: "xs@4pImysql",
});

var api_url = appSetting.apiUrl;

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

//#region renew token
router.use(function (req, res, next) {
	// console.log(req.query.token); 

	var token = req.body.token || req.headers['x-access-token'] || req.headers['authorization'];
	next()
});
//#endregion



//#region get user category dropdown
router.get('/getProduct', function (req, res) {

	con.connect(function(err) {
		if (err) throw err;
		/Connect two tables by using one field from each table as the connection point:/
		var sql = "SELECT * from product";
		con.query(sql, function (err, result) {
		  if (err) throw err;
		//   console.log(result);
		  res.status(200).json({ options: result });
		});
	  });

	//   con.end(function(err) {
	// 	if (err) {
	// 	  return console.log('error:' + err.message);
	// 	}
	// 	console.log('Close the database connection.');
	//   });
	  
	// Product.query(function (qb) {
	// 	qb.select('id', 'description','cost','costctc','certificatecost','servicefee');
	// }).fetchAll().then(function (data) {
	// 	res.status(200).json({ options: data.serialize() });
	// });
});
//#endregion

//#region get user category dropdown
router.post('/addInv', function (req, res) {
	console.log("Add invoice item");
	var newInv=[];
	Order.query(function (qb) {
		qb.select('createddate','ordernumber', 'productid','invoiceid')
		qb.where('invoiceid', '=', req.body.invoiceid)
	}).fetchAll().then(function (data) {
		var invDataObj = data.serialize();
		invDataObj.forEach(function (item,index) {
			Invoice.query(function (qb) {
				qb.select('ordernumber', 'productid')
				qb.where('ordernumber', '=', item.ordernumber)
			}).fetch().then(function (inv) {
				if(!inv){
					Invoice.query(function (qb) {
						qb.select(`id`,`productid`, `ssmprice`, `ssmcert`, `ssmtax`, `ssmamt`, `mydcharge`, 
						`mydcert`, `myddisc`, `mydamtnet`, `mydtaxnet`, `totalnet`, `mydamt`, `mydtax`, `totalgross`)
						qb.where('productid', '=', item.productid)
						qb.orderBy('id', 'desc')
						qb.limit(1)
					}).fetch().then(function (product) {

						var newData = {
							invoicedate: item.createddate, 
							ordernumber: item.ordernumber,
							invoiceid: item.invoiceid,
							productid: item.productid,
							ssmprice: product.get('ssmprice'),
							ssmcert: product.get('ssmcert'),
							ssmamt: product.get('ssmamt'),
							mydcharge:  product.get('mydcharge'),
							mydcert: product.get('mydcert'),
							mydamtnet: product.get('mydamtnet'),
							mydtaxnet: product.get('mydtaxnet'),
							totalnet: product.get('totalnet'),
							mydamt: product.get('mydamt'),
							mydtax:  product.get('mydtax'),
							totalgross: product.get('totalgross')
						};
						var values = [
							item.createddate, 
							item.ordernumber,
							item.invoiceid,
							item.productid,
							product.get('ssmprice'),
							product.get('ssmcert'),
							product.get('ssmamt'),
							product.get('mydcharge'),
							product.get('mydcert'),
							product.get('mydamtnet'),
							product.get('mydtaxnet'),
							product.get('totalnet'),
							product.get('mydamt'),
							product.get('mydtax'),
							product.get('totalgross')
								];
						newInv.push(values);
						// console.log(newInv);

						// pool.getConnection(function(err) {
						// 	if (err) throw err;
						// 	console.log("Connected!");
						// 	var sql = "INSERT INTO `mydataapi-stag`.`invoicelines`(`invoicedate`, `ordernumber`, `invoiceid`,`productid`, `ssmprice`, `ssmcert`, `ssmamt`, `mydcharge`, `mydcert`,`mydamtnet`, `mydtaxnet`, `totalnet`, `mydamt`, `mydtax`, `totalgross`) VALUES ?";
						// 	var values = [
						// 		[newData.invoicedate,
						// 			newData.ordernumber,
						// 			newData.invoiceid,
						// 			newData.productid,
						// 			newData.ssmprice,
						// 			newData.ssmcert,
						// 			newData.ssmamt,
						// 			newData.mydcharge,
						// 			newData.mydcert,
						// 			newData.mydamtnet,
						// 			newData.mydtaxnet,
						// 			newData.totalnet,
						// 			newData.mydamt,
						// 			newData.mydtax,
						// 			newData.totalgross]
								
						// 	  ];
						// 	  pool.query(sql, [values], function (err, result) {
						// 		pool.end()
						// 	  if (err) throw err;
						// 	  console.log("1 record inserted");

						// 	});
						// });
						
						// Invoice.forge().save(newData).then(function(data){
							
							// 	finalData.success = true
							// 	res.status(200).json(finalData);
							// })
							
							if (index === invDataObj.length - 1) {
								// console.log(newInv);
								pool.getConnection(function(err) {
									if (err) throw err;
									console.log("Connected!");
									var sql = "INSERT INTO `mydataapi`.`invoicelines`(`invoicedate`, `ordernumber`, `invoiceid`,`productid`, `ssmprice`, `ssmcert`, `ssmamt`, `mydcharge`, `mydcert`,`mydamtnet`, `mydtaxnet`, `totalnet`, `mydamt`, `mydtax`, `totalgross`) VALUES ?";
									var values = newInv;
									pool.query(sql, [values], function (err, result) {
									pool.end()
									  if (err) throw err;
									  console.log(newInv.length + " records inserted");
									  res.status(200).json({ msg: newInv.length +" records inserted" });
									});
								});
							}
					})

				}
			})
			
		})
	});
});
//#endregion


module.exports = router;