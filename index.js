const rp = require('request-promise');
const querystring = require('querystring');
const cred = require('./cred.js');
const moment = require('moment');

const USERNAME = 'aguy';

var sessionID; 
var retData;   //data to return after all calls made
var user;
var punch_id;
var punch;

var postToAPI = function (spec) {
  
  var query = {
     'Class': spec.class
     ,'Method': spec.method
  };
  if (sessionID){query.SessionID = sessionID;}

  var uri = cred.api_url + '?' + querystring.stringify(query);
  var data = JSON.stringify(spec.data);
  //console.log("URI: " , uri);
  //console.log("DATA: " , data);

  return rp({
      method: 'POST',
      uri: uri,
      form: {
	json: data	
      }
      ,json:true
  });

}

postToAPI({
	'class':'APIAuthentication', 
	'method':'Login', 
	'data': cred.cred
})
.then(function(json){
	sessionID = json;
	console.log("session id " + sessionID);
  	return postToAPI({
	  'class':'APIUser','method': 'getUser' 
	  ,'data': [{"filter_data":{"user_name":USERNAME}}]
	  //'class':'APITest','method': 'HelloWorld' ,'data': {"test":"value"}
  	});
}).then(function(data){
	user = data.find(function(user){return user.user_name === USERNAME;});    //filter might return more than one user
	console.log("User ID is ", user.id);
	return postToAPI({
		'class':'APIPunch',
		'method':'setPunch',
		'data': [{
			'type_id': 10,
			'status_id': 10,    // 10 in 20 out
			'user_id': user.id,
			'note': '',
			'time_stamp': 'now',
			'station_id': 0
		}]
	});
	
}).then(function(data){
	punch_id = data;
	console.log('Punch ID ', punch_id);

	return postToAPI({
                'class':'APIPunch',
                'method':'getPunch',
                'data': [{
                        'filter_data': {'id': punch_id}
                }]
        });

}).then(function(data){
	punch = data[0];
	console.log(punch);	

	return postToAPI({
                'class':'APIPunch',
                'method':'getPunch',
                'data': [{
                        'filter_data': {'id': punch_id}
                }]
        });
})
.catch(function(err){
	console.log("error!!!");
	console.error(JSON.stringify(err,null,2));
});


