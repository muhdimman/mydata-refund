
# Jasper Node Client

A module providing a simple Jasper Server Client

___
# Install

```bash
  npm install jasper-node-client --save
```

# Configuration

An object with the following structure is require (you can put it in your application config file):
```javascript
    jasperRestService: {
        /**
         * Base Url of your JasperServer 
         * @type {String}
         */
        baseUrl: '',
        /**
         * User Name
         * @type {String}
         */
        userName: '',
        /**
         * User passworj
         * @type {String}
         */
        password: '',
        /**
         * Request headers
         * @type {Object}
         */
        headers: { authorization: '', accept: 'application/json' }
    }
```
 

__

# Example 


```javascript
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
     res.writeHead(200, headers) //res is express response object
     res.end(response) //response (this is Jasper Client response object passed to the callback) contains the buffer returned by Jasper Server.
     //I used res.end because the response has already been sent by using writeHead method
   }
 });
```
A way to force the file download without page reloading (Asuming you got a webservice that uses jasper-node-client):

```html
<script>
window.location.href = "[web service url]"
</script>
```