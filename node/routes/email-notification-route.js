const AWS = require('aws-sdk');
const awsConfig = require('../config/aws');
var appSetting = require('../app-setting.json');

const AWS_SES = new AWS.SES( {
  accessKeyId: awsConfig.env.accessKeyId,
  secretAccessKey: awsConfig.env.secretAccessKey,
  region: awsConfig.env.region,
});


let sendEmailNotification = (email, name, subject, type, refundNo,token) => {
  // console.log(data);
  let data = ''
  if(type=='requery'){
    data = 'Dear ' + name +'<br/><br/>' +
    'We unable to proceed your request for further action due to incomplete or wrong information provided.<br/><br/>' +
    'Please click <a href="'+ appSetting.loginUrl + '/view/refund?token='+token+'">MYDATA Refund</a> to update your refund application form.<br/><br/>' +
    'For further assistance, please email us at support@mydata-ssm.com.my.<br/><br/>' +
    'Best Regards,<br/>' +
    '<i>Mydata Admin</i><br/><br/><br/>' +
    'This is a system generated email. Please do not reply.'
  } else if(type=='new'){
    data = 'Dear ' + name +'<br/><br/>' +
    'Your refund request has been submited.<br/><br/>' +
    // 'Please login to <a href="'+ appSetting.loginUrl + '">MYDATA</a> to view your refund application form.<br/><br/>' +
    'For further assistance, please email us at support@mydata-ssm.com.my.<br/><br/>' +
    'Best Regards,<br/>' +
    '<i>Mydata Admin</i><br/><br/><br/>' +
    'This is a system generated email. Please do not reply.'
  } else if(type=='process'){
    data = 'Dear ' + name +'<br/><br/>' +
    'Your refund request has been process.<br/><br/>' +
    'Please click  <a href="'+ appSetting.loginUrl + '/view/refund?token='+token+'">MYDATA Refund</a> to view your refund application form.<br/><br/>' +
    'For further assistance, please email us at support@mydata-ssm.com.my.<br/><br/>' +
    'Best Regards,<br/>' +
    '<i>Mydata Admin</i><br/><br/><br/>' +
    'This is a system generated email. Please do not reply.'
  } else if(type=='reject'){
    data = 'Dear ' + name +'<br/><br/>' +
    'Your refund request has been rejected.<br/><br/>' +
    'Please click  <a href="'+ appSetting.loginUrl + '/view/refund?token='+token+'">MYDATA Refund</a> to view your refund application form.<br/><br/>' +
    'For further assistance, please email us at support@mydata-ssm.com.my.<br/><br/>' +
    'Best Regards,<br/>' +
    '<i>Mydata Admin</i><br/><br/><br/>' +
    'This is a system generated email. Please do not reply.'
  }else{
    data = 'Dear ' + name +'<br/><br/>' +
    'We are glad to inform you that your refund request has been successfully approved.<br/><br/>' +
    'For further assistance, please email us at support@mydata-ssm.com.my.<br/><br/>' +
    'Best Regards,<br/>' +
    '<i>Mydata Admin</i><br/><br/><br/>' +
    'This is a system generated email. Please do not reply.'

  }
  let params = {
    Source: awsConfig.env.refundEmailFrom,
    Destination: {
      ToAddresses: [
        email
      ],
    },
    ReplyToAddresses: [],
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
            Data: data
        },
        Text: {
          Charset: "UTF-8",
          Data: 'MyData Refund - '+ subject 
        }
      },
      Subject: {
        Charset: "UTF-8",
        Data: 'MyData Refund - '+ subject +' ('+refundNo+')'
      }
    },
  };
    AWS_SES.sendEmail(params, (err, res) =>  {
      if (err) console.log(email, err, err.stack); // an error occurred
      else     console.log(email, res);           // successful response
    });
};

module.exports.sendEmailNotification = sendEmailNotification;