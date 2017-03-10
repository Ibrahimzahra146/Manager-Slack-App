'use strict'
var APIAI_ACCESS_TOKEN = process.env.APIAI_ACCESS_KEY
var requestIp = require('request-ip')
const express = require('express')
const Slapp = require('slapp')
const BeepBoopConvoStore = require('slapp-convo-beepboop')
const BeepBoopContext = require('slapp-context-beepboop')
const bodyParser = require('body-parser');
const uuid = require('node-uuid');
const request = require('request');
const requestify = require('requestify');
const JSONbig = require('json-bigint');
const async = require('async');
const apiai = require('apiai');
const APIAI_LANG = 'en';
const apiAiService = apiai(APIAI_ACCESS_TOKEN);
var pg = require('pg');
var sessionId = uuid.v1();
var db = require('node-localdb');
var userdb = db('./userDetails1.json')
var APIAI_ACCESS_TOKEN = process.env.APIAI_ACCESS_KEY;
var SLACK_ACCESS_TOKEN = process.env.SLACK_APP_ACCESS_KEY;
var SLACK_BOT_TOKEN = process.env.SLACK_BOT_ACCESS_KEY;
var fs = require('fs');
var userId = ""
var employeeChannel = "";
var IP = process.env.SLACK_IP
var managerChannel = "D3RR2RE68"
var Constants = require('./Constants.js');
pg.defaults.ssl = true;
if (!process.env.PORT) throw Error('PORT missing but required')
var slapp = Slapp({
  convo_store: BeepBoopConvoStore(),
  context: BeepBoopContext()
})
var Botkit = require('./lib/Botkit.js');
var controller = Botkit.slackbot({
  debug: true,
});
console.log("the token is " + APIAI_ACCESS_TOKEN)
var bot = controller.spawn({
  token: SLACK_BOT_TOKEN

}).startRTM();
function sendVacationPutRequest(vacationId, approvalId) {
  request({
    url: 'http://' + IP + '/api/v1/vacation/' + vacationId + '/managerApproval/' + approvalId, //URL to hitDs
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': 'JSESSIONID=24D8D542209A0B2FF91AB2A333C8FA70'
    }
    //Set the body as a stringcc
  }, function (error, response, body) {
    console.log("response.statusCode" + response.statusCode)
    console.log("Put request sent")
  })
}

/*--------------___________________________________________________----------------------
Add manager infromation to database
-------------____________________________________________________---------------------
*/
function storeManagerSlackInformation(email, msg) {
  request({
    url: 'http://' + IP + '/api/v1/toffy/get-record', //URL to hitDs
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': 'JSESSIONID=24D8D542209A0B2FF91AB2A333C8FA70'
    },
    body: email
    //Set the body as a stringcc
  }, function (error, response, body) {

    if (response.statusCode == 404) {


      console.log("the employee not found  ")
      requestify.post('http://' + IP + '/api/v1/toffy', {
        "email": email,
        "hrChannelId": "",
        "managerChannelId": msg.body.event.channel,
        "slackUserId": msg.body.event.user,
        "teamId": msg.body.team_id,
        "userChannelId": ""
      })
        .then(function (response) {
          // Get the response body
          response.getBody();
        });

    }

    /*--------------___________________________________________________----------------------
    check if the record is already exist ,that mean the manager use the system as employee
    -------------____________________________________________________---------------------
    */
    else if (response.statusCode == 200) {

      if (((JSON.parse(body)).managerChannelId) != (msg.body.event.channel)) {
        var userChId = JSON.parse(body).userChannelId;
        var hrChId = JSON.parse(body).hrChannelId;
        request({
          url: "http://" + IP + "/api/v1/toffy/" + JSON.parse(body).id, //URL to hitDs
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': 'JSESSIONID=24D8D542209A0B2FF91AB2A333C8FA70'
          },
          body: email
          //Set the body as a stringcc
        }, function (error, response, body) {
          console.log("DELETEd");

        });
        console.log("=====>arrive3")
        requestify.post('http://' + IP + '/api/v1/toffy', {
          "email": email,
          "hrChannelId": hrChId,
          "managerChannelId": msg.body.event.channel,
          "slackUserId": msg.body.event.user,
          "teamId": msg.body.team_id,
          "userChannelId": userChId
        })
          .then(function (response) {
            console.log("=====>arrive4")

            // Get the response body
            response.getBody();
          });
      }
    }
  });
}
//send the text to api ai 
function sendRequestToApiAi(emailValue, msg) {
  storeManagerSlackInformation(emailValue, msg);
  var text = msg.body.event.text;

  let apiaiRequest = apiAiService.textRequest(text,
    {
      sessionId: sessionId
    });

  apiaiRequest.on('response', (response) => {
    let responseText = response.result.fulfillment.speech;
    msg.say(responseText);


  });
  apiaiRequest.on('error', (error) => console.error(error));
  apiaiRequest.end();
}

/*--------------___________________________________________________----------------------
get all information about team users like email ,name ,user id ...etc
-------------____________________________________________________---------------------
*/
function getMembersList(Id, msg) {
  var emailValue = "";
  request({
    url: Constants.SLACK_MEMBERS_LIST_URL + "" + SLACK_ACCESS_TOKEN,
    json: true
  }, function (error, response, body) {

    if (!error && response.statusCode === 200) {
      var i = 0;
      while ((body.members[i] != null) && (body.members[i] != undefined)) {

        if (body.members[i]["id"] == Id) {
          console.log(body.members[i]["profile"].email);
          emailValue = body.members[i]["profile"].email;
          userdb.findOne({ email: emailValue }).then(function (u) {
            if (u == undefined) {
              console.log("New user request the service");
              userdb.insert({ email: emailValue, channel: msg.body.event.channel }).then(function (u) {
              });
            }
            else console.log("the user already exist")
          });
          sendRequestToApiAi(emailValue, msg);
          break;
        }
        console.log("the email:");
        console.log(body.members[i]["profile"].email);

        i++;
      }
    }
  });
}

/*--------------___________________________________________________----------------------
listen for user messages
-------------____________________________________________________---------------------
*/
var app = slapp.attachToExpress(express())
slapp.message('(.*)', ['direct_message'], (msg, text, match1) => {
  if (msg.body.event.user == "U3R213B2L") {
    console.log("message from bot")

  } else {


    var stringfy = JSON.stringify(msg);
    console.log("the message is ");
    console.log(stringfy);
    getMembersList(msg.body.event.user, msg)
  }
})
slapp.action('manager_confirm_reject', 'confirm', (msg, value) => {
  console.log("Manager accepted the vacaction")
  var arr = value.toString().split(";")
  var userEmail = arr[0];
  var vacationId = arr[1];
  var approvalId = arr[2]
  console.log("vacation id-====-===>>>>" + vacationId)
  sendVacationPutRequest(vacationId, approvalId)

  request({
    url: 'http://' + IP + '/api/v1/toffy/get-record', //URL to hitDs
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': 'JSESSIONID=24D8D542209A0B2FF91AB2A333C8FA70'
    },
    body: userEmail
    //Set the body as a stringcc
  }, function (error, response, body) {
    var responseBody = JSON.parse(body);

    msg.say("You have accepted the time off request.")
    var message = {
      'type': 'message',
      'channel': responseBody.userChannelId,
      user: responseBody.slackUserId,
      text: 'what is my name',
      ts: '1482920918.000057',
      team: responseBody.teamId,
      event: 'direct_message'
    };
    bot.startConversation(message, function (err, convo) {


      if (!err) {
        var text12 = {
          "text": "Manager @name has accepted your time off request.Take care.",
        }
        var stringfy = JSON.stringify(text12);
        var obj1 = JSON.parse(stringfy);
        bot.reply(message, obj1);

      }
    });
  });
})
slapp.action('manager_confirm_reject', 'reject', (msg, value) => {

  msg.say("you have rejected the time off request")
  request({
    url: 'http://' + IP + '/api/v1/toffy/get-record', //URL to hitDs
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': 'JSESSIONID=24D8D542209A0B2FF91AB2A333C8FA70'
    },
    body: value
    //Set the body as a stringcc
  }, function (error, response, body) {
    var responseBody = JSON.parse(body);
    var message = {
      'type': 'message',
      'channel': responseBody.userChannelId,
      user: responseBody.slackUserId,
      text: 'what is my name',
      ts: '1482920918.000057',
      team: responseBody.teamId,
      event: 'direct_message'
    };
    bot.startConversation(message, function (err, convo) {


      if (!err) {
        var text12 = {
          "text": "Manager @name has rejected your time off request.Sorry! ",
        }
        var stringfy = JSON.stringify(text12);
        var obj1 = JSON.parse(stringfy);
        bot.reply(message, obj1);

      }
    });
  });
})
app.get('/', function (req, res) {
  var clientIp = requestIp.getClientIp(req);
  console.log("new request ");
  console.log(clientIp)
  res.send('Hello1')
})


console.log('Listening on :' + process.env.PORT)
app.listen(process.env.PORT)
