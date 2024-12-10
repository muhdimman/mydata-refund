 'use strict'
 var config = {
   baseUrl: '',
   userName: '',
   password: '',
   headers: { authorization: '', accept: 'application/json' }
 }
 const Jasper = require('jasper-node-client')(config)
 var jasper = new Jasper()
 var reportPath = ''
 var reportName = 'ExampleName'
 var fileFormat = 'pdf'
 var params = {
   fec_ini: '2016-11-01%2000:00:00',
   fec_fin: '2016-11-14%2000:00:00',
   telefono: '0414',
   conditions: '',
   auxiliarconditions: '',
   query: ''
 }
 jasper.requestReport(reportPath, reportName, fileFormat, params, (err, response, headers) => {
   if (err != null) {
     console.log(err)
   } else {
     res.writeHead(200, headers) //res es el objeto response de express
     res.end(response)
   }
 });
