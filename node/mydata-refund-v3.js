var express = require('express');
var cors = require('cors');
var app = express();
var server = require('http').Server(app);
var jwt = require('jsonwebtoken');
var bodyParser = require('body-parser');
var Client = require('node-rest-client').Client;
var appSetting = require('./app-setting.json');
var path = require('path');

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

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.set('superSecret', 'catastrophe');

app.use('/refund-service', require('./routes/refund-route'));
app.use('/file', require('./routes/file-route'));

var Bookshelf = require('bookshelf')(knex);
// var BookshelfLogin = require('bookshelf')(knexLogin);
Bookshelf.plugin('pagination');
var User = Bookshelf.Model.extend({
    tableName: 'User',
    hasTimestamps: true
});
var Refund = Bookshelf.Model.extend({
    tableName: 'Refund',
    hasTimestamps: true
});
var Customer = Bookshelf.Model.extend({
    tableName: 'Customer',
    hasTimestamps: true
});

// change for deployment
// app.use(express.static(path.join(__dirname, 'dist')));
// app.get('*', (req, res) => {
// 	res.sendFile(path.join(__dirname, './dist/index.html'));
// });


//#region login user
app.post('/login', function (req, res) {
    console.log(req.body);
    User.query(function(qb){
        qb.select('id','password','status','role','fullName','username','email')
        qb.where('username', req.body.username)
    }).fetch().then(function (user) {
        if (!user) {
            var options = {
                requestConfig: { timeout: 5000, noDelay: true, keepAlive: true, keepAliveDelay: 5000 },
                responseConfig: { timeout: 5000 }
            }
            var client = new Client(options);
            var args = {
                headers: {"Content-Type":"application/json"},
                data: {"userName":req.body.username, "password":req.body.password}
            };
            console.log('Stub login service --> '+appSetting.loginUrl+'/loginBypass')
            client.registerMethod("login", appSetting.loginUrl+"/auth/loginBypass", "POST");
            client.methods.login(args, function (result, response, error) {
                console.log('Resp --> '+response.statusCode)
                console.log(result)
                if (response.statusCode == 200) {
                    var tokenVal = {userId: result.userId};
                    var token = jwt.sign(tokenVal, app.get('superSecret'), {
                        expiresIn: '30m'
                    });
                    var finalData = {
                        success: true,
                        message: 'Successfully Login.',
                        fullName: result.fullName,
                        prepaidBalance: result.creditBalance,
                        accessToken: token,
                        roles: ['USER']
                    }
                    Refund.query(function(qb){
                        qb.select('Refund.id as refundId', 'Customer.id as userId')
                        qb.innerJoin('Customer','Refund.customerId','Customer.id')
                        qb.where('mydataUserId',result.userId)
                        qb.where('mydataAccountId', result.accountId)
                    }).fetch().then(function(refund){
                        if (refund){
                            finalData.refundId = refund.get('refundId')
                            finalData.userId = refund.get('userId')
                            res.status(200).json(finalData)
                        }
                        else{
                            finalData.refundId = null
                            Customer.query(function(qb){
                                qb.select('id')
                                qb.where('mydataUserId', result.userId)
                                qb.where('mydataAccountId', result.accountId)
                            }).fetch().then(function(customer){
                                if (customer){
                                    // edit customer
                                    finalData.userId = customer.get('id')
                                    Customer.forge({id:customer.get('id')}).save({
                                        username: result.usersName,
                                        fullName: result.fullName,
                                        role: result.role,
                                        email: result.email,
                                        phone: result.phoneNo,
                                        prepaidBalance: result.creditBalance
                                    }).then(function(){
                                        res.status(200).json(finalData)
                                    })
                                }
                                else{
                                    // create customer
                                    Customer.forge({
                                        mydataUserId: result.userId,
                                        mydataAccountId: result.accountId,
                                        username: result.usersName,
                                        fullName: result.fullName,
                                        email: result.email,
                                        phone: result.phoneNo,
                                        prepaidBalance: result.creditBalance
                                    }).save().then(function(customer){
                                        finalData.userId = customer.get('id')
                                        res.status(200).json(finalData)
                                    })
                                }
                            })
                        }
                    })
                }
                else {
                    res.status(200).json({success:false, message:result.message});
                }
            })
        }
        else {
            console.log('ahsahdsahdh')
            if (user.get('password') == req.body.password && (user.get('status') == 'Approve')) {
                var tokenVal = {userId: user.get('id')};
                var token = jwt.sign(tokenVal, app.get('superSecret'), {
                    expiresIn: '30m'
                });
                var userRole = []
                userRole.push(user.get('role'))
                console.log(userRole)
                res.status(200).json({
                    success: true,
                    message: 'Successfully Login.',
                    userId: user.get('id'),
                    refundId: null,
                    fullName: user.get('fullName'),
                    prepaidBalance: 0,
                    accessToken: token,
                    roles: userRole
                });
            }
            else if (user.get('password') != req.body.password) {
                res.status(200).json({ success: false, message: 'Authentication failed. Wrong password.' });
            }
            else if (user.get('status') == 'Pending') {
                res.status(200).json({ success: false, message: 'Your account still pending for approval.' });
            }
            else if (user.get('status') == 'Block') {
                res.status(200).json({ success: false, message: 'Your account have been blocked by administrator.' });
            }
        }
    });
});
//#endregion

server.listen(appSetting.port, function () {
    console.log('Server is listening on localhost:' + appSetting.port);
});
