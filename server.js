'use strict'
var APIAI_ACCESS_TOKEN = process.env.APIAI_ACCESS_KEY
const express = require('express')
const Slapp = require('slapp')
const BeepBoopConvoStore = require('slapp-convo-beepboop')
const BeepBoopContext = require('slapp-context-beepboop')
const bodyParser = require('body-parser');
const uuid = require('node-uuid');
const request = require('request');
const JSONbig = require('json-bigint');
const async = require('async');
const apiai = require('apiai');
const APIAI_LANG = 'en';
const apiAiService = apiai(APIAI_ACCESS_TOKEN);
var sessionId = uuid.v1();
var db = require('node-localdb');
var userdb = db('./userDetails1.json')
var APIAI_ACCESS_TOKEN = process.env.APIAI_ACCESS_KEY;
var SLACK_ACCESS_TOKEN = process.env.SLACK_APP_ACCESS_KEY;
var SLACK_BOT_TOKEN = process.env.SLACK_BOT_ACCESS_KEY;
var fs = require('fs');
var Constants = require('./Constants.js');
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
//send the text to api ai 
function sendRequestToApiAi(emailValue, msg) {
  console.log("the received email value is " + emailValue);
  userdb.findOne({ email: emailValue }).then(function (u) {
    if (u == undefined)
      console.log("the not database is defined every where")
    else console.log("defined every where")
  });

  var text = msg.body.event.text;
  let apiaiRequest = apiAiService.textRequest(text + " " + emailValue,
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
//get all information about team users like email ,name ,user id ...etc
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
function sendVacationToManager(managerEmail) {
  var message = {
    'type': 'message',
    'channel': "D3PBGG355",
    user: "U3FNW74JD",
    text: 'what is my name',
    ts: '1482920918.000057',
    team: "T3FN29ZSL",
    event: 'direct_message'
  };
  bot.startConversation(message, function (err, convo) {


    if (!err) {
      var text12 = {
        "attachments": [
          {
            "text": "U receive new Vacation request",
            "callback_id": 'manager_confirm_reject',
            "color": "#3AA3E3",
            "attachment_type": "default",
            "actions": [
              {
                "name": 'confirm',
                "text": "Confirm",
                "type": "button",
                "value": "confirm"
              },
              {
                "name": 'reject',
                "text": "reject",
                "type": "button",
                "value": "reject"
              }
            ]
          }
        ]
      }
      var stringfy = JSON.stringify(text12);
      var obj1 = JSON.parse(stringfy);
      bot.reply(message, obj1);

    }
  });
}

var app = slapp.attachToExpress(express())
slapp.message('(.*)', ['direct_message'], (msg, text, match1) => {
  if (msg.body.event.user == "U3NP5LM6Z") {
    console.log("message from bot ")

  } else {

    var stringfy = JSON.stringify(msg);
    console.log("the message is ");
    console.log(stringfy);
    getMembersList(msg.body.event.user, msg)


  }
})
slapp.action('confirm_reject', 'confirm', (msg, value) => {

  var arr = value.toString().split(",");
  var userEmail = arr[2];
  //get the id of the user based on email to can send Post request
  /*  request({
      //
      url: "http://www.json-generator.com/api/json/get/bUzQoShutK?indent=2",
      json: true
    }, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        var stringfy = JSON.stringify(body);
        var vacationDetails = {
          "id": body.id,
          from: arr[0],
          to: arr[1],
          type: 1,
          comments: "I wnat vacation"
        }
        vacationDetails = Json.stringfy(vacationDetails);
        console.log(stringfy);
        //send Post request
        request.post({
          url: 'Url of Post reuest from backend',
          body: vacationDetails
        }, function (error, response, body) {
          //here we should send notification to manager ,first we should get all managers
          request({
            //
            url: "http://www.json-generator.com/api/json/get/bTUuKhuXZu?indent=2",
            json: true
          }, function (error, response, body) {
            var i = 0;
            while ((body[i] != null) && (body[i] != undefined)) {
              var manager = body[i].username;
              sendVacationToManager(manager);
              i++;
            }
  
          });
  
        });
        //******************************************************************************************************
        //  msg.respond(msg.body.response_url, body.name + " which your id is "+body.id +"  Your  request has been submitted to your managers ")
  
      }
    })*/
  msg.respond(msg.body.response_url, "Your  request has been submitted to your managers ")
  sendVacationToManager("Ibrahim")
})
slapp.action('confirm_reject', 'reject', (msg, value) => {

  var arr = value.toString().split(",");
  msg.respond(msg.body.response_url, "Ok. Operation aborted ")
})
slapp.action('manager_confirm_reject', 'confirm', (msg, value) => {

  var arr = value.toString().split(",");
  msg.respond(msg.body.response_url, "your manager confirm Yourn vacarion  ")
})
slapp.action('manager_confirm_reject', 'reject', (msg, value) => {

  var arr = value.toString().split(",");
  msg.respond(msg.body.response_url, "your manager reject Yourn vacarion ")
})
app.get('/', function (req, res) {
  res.send('Hello')
})

console.log('Listening on :' + process.env.PORT)
app.listen(process.env.PORT)
