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
const managerToffyHelper = require('./managerToffyHelper.js')
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
var employee = require("./employeeSide.js")
var managerIdInHr = ""
var vacation_type1 = ""
var fromDate = ""
var toDate = "";

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
exports.bot = bot
//*********
var manager_bot = controller.spawn({
  token: process.env.MANAGER_BOT_ACCESS_KEY

}).startRTM();
exports.manager_bot = manager_bot
/***************** */

var hr_bot = controller.spawn({
  token: process.env.HR_BOT_ACCESS_KEY

}).startRTM();
exports.hr_bot = hr_bot
//******************
function sendFeedBackMessage(responseBody) {

  console.log("Arrive sendFeedBackMessage  ")
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
        "text": "The approver has accepted your time off request.Take care.",
      }
      var stringfy = JSON.stringify(text12);
      var obj1 = JSON.parse(stringfy);
      bot.reply(message, obj1);

    }
  });
}

function sendVacationPutRequest(vacationId, approvalId, managerEmail, status) {

  managerToffyHelper.getNewSessionwithCookie(managerEmail, function (remember_me_cookie, session_id) {
    var uri = 'http://' + IP + '/api/v1/vacation/' + vacationId + '/managerApproval/' + approvalId
    console.log("uri::" + uri)
    var approvalBody = {
      "id": approvalId,
      "comments": "From Ibrahim",
      "state": status,
      "type": "MANAGER"

    }
    approvalBody = JSON.stringify(approvalBody)
    request({
      url: uri, //URL to hitDs
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': remember_me_cookie + ";" + session_id
      },
      body: approvalBody
      //Set the body as a stringcc
    }, function (error, response, body) {
      console.log("arrive at get new POST requst " + response.statusCode)

    });
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


      console.log("The employee not found  ")
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
  managerToffyHelper.getRoleByEmail(emailValue, "ADMIN", function (role) {
    if (role == true) {
      storeManagerSlackInformation(emailValue, msg);
      var text = msg.body.event.text;

      let apiaiRequest = apiAiService.textRequest(text,
        {
          sessionId: sessionId
        });

      apiaiRequest.on('response', (response) => {
        let responseText = response.result.fulfillment.speech;
        if (responseText == "showEmployeeInfo") {
          console.log("eresponse:::" + JSON.stringify(response))
          console.log("employeeEmail:  ::" + response.result.parameters.email)
          var employeeEmail = "";
          if (response.result.parameters.any) {
            employeeEmail = response.result.parameters.any + "@exalt.ps"
            employeeEmail = employeeEmail.replace(/ /g, ".");

            if (response.result.parameters.employee_info_types == "stats")
              employee.showEmployeeStats(emailValue, employeeEmail, msg);
            else if (response.result.parameters.employee_info_types == "profile")
              employee.showEmployeeProfile(emailValue, employeeEmail, msg)
            else employee.showEmployeeProfile(emailValue, employeeEmail, msg)



          }
          else if (response.result.parameters.email) {
            if ((response.result.parameters.email).indexOf('mailto') > -1) {
              employeeEmail = response.result.parameters.email
              employeeEmail = employeeEmail.toString().split('|')
              employeeEmail = employeeEmail[1];
              employeeEmail = employeeEmail.replace(/>/g, "");
              console.log("Email after split mail to ")
            }
            else employeeEmail = response.result.parameters.email




            if (response.result.parameters.employee_info_types == "stats")
              employee.showEmployeeStats(emailValue, employeeEmail, msg);
            else if (response.result.parameters.employee_info_types == "profile")
              employee.showEmployeeProfile(emailValue, employeeEmail, msg)
            else employee.showEmployeeProfile(emailValue, employeeEmail, msg)

          } else msg.say("There is an error in user ID ")
        }




        else if (responseText == "vacationWithLeave") {
          var messageText = ""
          var employeeEmail = ""
          managerToffyHelper.getTodayDate(function (today) {
            var time1 = "17:00:00";
            var time = "8:00:00";
            var date = today
            var date1 = today
            var timeOffCase = -1
            if (!(response.result.parameters.email || response.result.parameters.any)) {
              msg.say("please specify the user email with request")
            } else {
              if (response.result.parameters.email) {
                //<mailto:ibrahim.zahra@exalt.ps|ibrahim.zahra@exalt.ps>
                if ((response.result.parameters.email).indexOf('mailto') > -1) {
                  employeeEmail = response.result.parameters.email
                  employeeEmail = employeeEmail.toString().split('|')
                  employeeEmail = employeeEmail[1];
                  employeeEmail = employeeEmail.replace(/>/g, "");
                  console.log("Email after split mail to ")
                }
                else employeeEmail = response.result.parameters.email


              } else {
                employeeEmail = response.result.parameters.any
                employeeEmail = response.result.parameters.any + "@exalt.ps"
                employeeEmail = employeeEmail.replace(/ /g, ".");
              }


              if (response.result.parameters.sick_synonyms) {
                vacation_type1 = "sick"
              }

              if (response.result.parameters.time_off_types && !(response.result.parameters.time) && !(response.result.parameters.time1) && !(response.result.parameters.date) && !(response.result.parameters.date1)) {

                msg.say("Please specify the date and/or time ")



              }
              else if (response.result.parameters.sick_synonyms && !(response.result.parameters.time) && !(response.result.parameters.time1) && !(response.result.parameters.date) && !(response.result.parameters.date1)) {
                msg.say("Please specify the date and/or time ")


                vacation_type1 = "sick"

              }
              else {

                if (response.result.parameters.time && response.result.parameters.time1 && response.result.parameters.date && response.result.parameters.date1) {
                  time = response.result.parameters.time
                  time1 = response.result.parameters.time1
                  date = response.result.parameters.date;
                  date1 = response.result.parameters.date1;

                  timeOffCase = 1

                }
                else if (response.result.parameters.time && response.result.parameters.time1 && response.result.parameters.date1) {
                  time = response.result.parameters.time
                  time1 = response.result.parameters.time1
                  date = response.result.parameters.date1
                  date1 = response.result.parameters.date1

                  timeOffCase = 2

                } else if (response.result.parameters.time && response.result.parameters.time1 && response.result.parameters.date) {
                  time = response.result.parameters.time
                  time1 = response.result.parameters.time1
                  date = response.result.parameters.date
                  date1 = response.result.parameters.date
                  timeOffCase = 3

                }

                else if (response.result.parameters.time && response.result.parameters.date && response.result.parameters.date1) {
                  time = response.result.parameters.time
                  time1 = response.result.parameters.time1
                  date = response.result.parameters.date
                  date1 = response.result.parameters.date1
                  timeOffCase = 4

                } else if (response.result.parameters.time && response.result.parameters.time1) {
                  time = response.result.parameters.time
                  time1 = response.result.parameters.time1
                  timeOffCase = 5

                } else if (response.result.parameters.time && response.result.parameters.date) {
                  time = response.result.parameters.time
                  date = response.result.parameters.date
                  date1 = response.result.parameters.date
                  timeOffCase = 6

                }
                else if (response.result.parameters.time && response.result.parameters.date1) {
                  time = response.result.parameters.time
                  date1 = response.result.parameters.date1
                  timeOffCase = 7

                }
                else if (response.result.parameters.date && response.result.parameters.date1) {
                  date = response.result.parameters.date
                  date1 = response.result.parameters.date1
                  timeOffCase = 8

                }
                else if (response.result.parameters.date) {
                  date = response.result.parameters.date
                  date1 = response.result.parameters.date
                  timeOffCase = 9

                }
                else if (response.result.parameters.time) {
                  time = response.result.parameters.time
                  timeOffCase = 10

                }
                date1 = date1.replace(/-/g, "/")
                date = date.replace(/-/g, "/")


                if (vacation_type1 == "") {
                  vacation_type1 = "personal"
                }
                //get the milliseconds for the  end of the vacation 
                managerToffyHelper.convertTimeFormat(time, function (x, y, convertedTime) {
                  managerToffyHelper.convertTimeFormat(time1, function (x, y, convertedTime1) {

                    var toDate = date1 + " " + convertedTime1
                    var fromDate = date + " " + convertedTime;
                    console.log("toDate::" + toDate);
                    console.log("fromDate::" + fromDate);
                    toDate = new Date(toDate);
                    var dateMilliSeconds = toDate.getTime();


                    var timeMilliseconds = new Date(fromDate);
                    timeMilliseconds = timeMilliseconds.getTime();
                    console.log("timeMilliseconds :::" + timeMilliseconds)
                    managerToffyHelper.sendVacationWithLeaveConfirmation(msg, convertedTime, date, convertedTime1, date1, timeMilliseconds, dateMilliSeconds, emailValue, employeeEmail, vacation_type1, timeOffCase)
                    vacation_type1 = ""
                  })

                })



              }
            }
          })

        }
        else msg.say(responseText);


      });
      apiaiRequest.on('error', (error) => console.error(error));
      apiaiRequest.end();
    }


    else {
      msg.say("Sorry!.You dont have the permession to use this bot.")
    }

  })

}
/** */
function getTodayDate(callback) {
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth() + 1; //January is 0!
  var yyyy = today.getFullYear();

  if (dd < 10) {
    dd = '0' + dd
  }

  if (mm < 10) {
    mm = '0' + mm
  }

  today = yyyy + '/' + mm + '/' + dd;
  callback(today)
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

          sendRequestToApiAi(emailValue, msg);
          break;
        }


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
  managerApproval1(msg, value, "Approved", 0)
})



slapp.action('manager_confirm_reject', 'reject', (msg, value) => {
  managerApproval1(msg, value, "Rejected", 0)
})


slapp.action('manager_confirm_reject', 'dont_detuct', (msg, value) => {

  managerApproval1(msg, value, "ApprovedWithoutDeduction", 0)

})
function managerAction(msg, value, typeOfaction) {
  var arr = ""
  var type = ""
  var managerEmail = ""
  var fromDateInMilliseconds = ""
  var toDateInMilliseconds = ""
  var workingDays = ""

  var employeeEmail = ""
  var managerId = ""
  getTodayDate(function (todayDate) {
    var fromDate = ""
    var toDate = ""
    arr = value.toString().split(",");
    type = arr[5]
    managerEmail = arr[2];
    fromDateInMilliseconds = arr[3];
    toDateInMilliseconds = arr[4]
    workingDays = arr[6]
    fromDate = arr[7]
    toDate = arr[8]
    employeeEmail = arr[9]
    managerId = arr[10]
    managerToffyHelper.sendVacationPostRequest(/*from  */fromDateInMilliseconds, toDateInMilliseconds, managerToffyHelper.userIdInHr, employeeEmail, type, function (vacationId, managerApproval) {

      managerToffyHelper.convertTimeFormat(arr[0], function (formattedTime, midday) {

        managerToffyHelper.convertTimeFormat(arr[1], function (formattedTime1, midday1) {

          if (arr[0] && (arr[0] != undefined)) {
            fromDate = fromDate + " T " + formattedTime + " " + midday
          } else fromDate = fromDate + " T 08:00 am ";

          if (arr[1] && (arr[1] != undefined)) {
            toDate = toDate + " T " + formattedTime1 + " " + midday1
          } else toDate = toDate + " T 05:00 pm ";


          if (!managerApproval[0]) {
            msg.say("You dont have any manager right now ");
          } else {
            console.log("fromDate:::-->" + fromDate)
            console.log("toDate:::-->" + toDate)
            managerToffyHelper.sendVacationToManager(fromDate, toDate, managerEmail, type, vacationId, managerApproval, "Manager", workingDays)

            if (type == "sick") {
              console.log("Managers approvals sick vacation is ::" + JSON.stringify(managerApproval))
              msg.respond(msg.body.response_url, "Your request has been submitted . ")

            }
            else
              msg.respond(msg.body.response_url, "Your request has been submitted.")

          }
        });

      });

      //get The id of the manager inorder to get approval id and vacation ID
      var i = 0
      while (managerApproval[i]) {
        if (managerApproval[i].manager == managerId) {
          var value = employeeEmail + ";" + vacationId + ";" + managerApproval[i].id + ";" + managerEmail
          console.log("value: :" + value)
          managerApproval1(msg, value, "Approved", 1)
          break;
        }
        i++;
      }

    });
  })

  fromDate = "";
  toDate = "";

}
function managerApproval1(msg, value, approvalType, fromManager) {
  var managerFeedbackmessage = ""
  var userFeedbackmessage = ""
  var arr = value.toString().split(";")
  var userEmail = arr[0];
  var vacationId = arr[1];
  var approvalId = arr[2]
  var managerEmail = arr[3]
  var fromWho = arr[4];
  var fromDate = arr[5];
  var toDate = arr[6];

  console.log("userEmail ::" + userEmail)
  console.log("managerEmail::" + managerEmail)
  sendVacationPutRequest(vacationId, approvalId, managerEmail, approvalType)
  if (fromManager != 1) {
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
      if (approvalType == "ApprovedWithoutDeduction") {
        userFeedbackmessage = "The approver " + managerEmail + " has accepted your time off request without detuction ( " + fromDate + " - " + toDate + " ). Enjoy! "
        managerFeedbackmessage = "You have accepted the time off request but without detuction"
        msg.say(managerFeedbackmessage)
      } else if (approvalType == "Approved") {

        userFeedbackmessage = "The approver " + managerEmail + " has accepted your time off request ( " + fromDate + " - " + toDate + " ).Take care."
        managerFeedbackmessage = "You have accepted the time off."
        msg.say(managerFeedbackmessage)


      } else if (approvalType == "Regected") {
        userFeedbackmessage = "The approver " + managerEmail + " has regected your time off request ( " + fromDate + " - " + toDate + " )."
        managerFeedbackmessage = "You have regected the time off."
        msg.say(managerFeedbackmessage)

      }
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
            "text": userFeedbackmessage,
          }
          var stringfy = JSON.stringify(text12);
          var obj1 = JSON.parse(stringfy);
          bot.reply(message, obj1);

        }
      });
    });
  }
}





slapp.action('leave_with_vacation_confirm_reject', 'confirm', (msg, value) => {
  managerAction(msg, value, "Approved")
})
slapp.action('leave_with_vacation_confirm_reject', 'confirm_without_detuction', (msg, value) => {
  managerAction(msg, value, "ApprovedWithoutDeduction")
})
slapp.action('leave_with_vacation_confirm_reject', 'reject', (msg, value) => {
  msg.say("Ok, operation aborted.")
  fromDate = "";
  toDate = "";
})
app.get('/', function (req, res) {
  var clientIp = requestIp.getClientIp(req);
  console.log("new request ");
  console.log(clientIp)
  res.send('Hello1')
})


console.log('Listening on :' + process.env.PORT)
app.listen(process.env.PORT)
