const dateHelper = require('.././DatesFunctions/datesFunctions.js')
//getting date after a specific date 

module.exports.getPreviousDate = function getPreviousDate(date, numberOfDaysToAddOrDelete, callback) {
    var someDate = new Date(date);
    someDate.setDate(someDate.getDate() + numberOfDaysToAddOrDelete);

    var dd = someDate.getDate();
    var mm = someDate.getMonth() + 1;
    var y = someDate.getFullYear();

    date = y + '-' + mm + '-' + dd;
    console.log("previous date:" + date)
    callback(date)
}
//convert Date to word 
module.exports.converDateToWords = function converDateToWords(fromDate, toDate, callback) {

    var wordFromDate = new Date(fromDate).toDateString()
    var arr = wordFromDate.toString().split(" ")
    wordFromDate = arr[0] + ", " + arr[1] + " " + arr[2]

    var hours = new Date(fromDate).getHours() + 3

    var minutes = new Date(fromDate).getMinutes()
    if (minutes == 0)
        minutes = "00"

    dateHelper.convertTimeFormat(hours + ":" + minutes, function (formattedTime, midday, TimeforMilliseconds) {
        var wordToDate = new Date(toDate).toDateString()
        var arr = wordToDate.toString().split(" ")
        wordToDate = arr[0] + ", " + arr[1] + " " + arr[2]
        hours = new Date(toDate).getHours() + 3
        minutes = new Date(toDate).getMinutes()
        if (minutes == 0)
            minutes = "00"



        dateHelper.convertTimeFormat(hours + ":" + minutes, function (formattedTime1, midday1, TimeforMilliseconds1) {
            wordFromDate = wordFromDate + " at " + formattedTime + " " + midday;

            //toDateho


            wordToDate = wordToDate + " at " + formattedTime1 + " " + midday1;
            callback(wordFromDate, wordToDate)
        })

    })

}
module.exports.convertTimeFormat = function convertTimeFormat(time, callback) {
    console.log("The Time is =" + time)
    var arr = time.toString().split(":")
    var formattedTime = ""
    var midday = "pm";
    var TimeforMilliseconds = ""
    var n = arr[1].length;
    if (n == 1) {
        arr[1] = "0" + arr[1]
    }

    if (arr[0] == "13" || arr[0] == "01" || arr[0] == "1") {
        formattedTime = "01:" + arr[1];
        TimeforMilliseconds = "13:" + arr[1]
    }
    else if (arr[0] == "14" || arr[0] == "02" || arr[0] == "2") {
        formattedTime = "02:" + arr[1];
        TimeforMilliseconds = "14:" + arr[1]
    }
    else if (arr[0] == "15" || arr[0] == "03" || arr[0] == "3") {
        formattedTime = "03:" + arr[1];
        TimeforMilliseconds = "15:" + arr[1]
    }
    else if (arr[0] == "16" || arr[0] == "04" || arr[0] == "4") {
        formattedTime = "04:" + arr[1];
        TimeforMilliseconds = "16:" + arr[1]
    }
    else if (arr[0] == "05" || arr[0] == "17") {
        formattedTime = "05:" + arr[1];
        TimeforMilliseconds = "17:" + arr[1]
    }
    else if (arr[0] == "17") {
        formattedTime = "05:" + arr[1];
        TimeforMilliseconds = "17:" + arr[1]
    }

    else if (arr[0] == "20" || arr[0] == "08" || arr[0] == "8") {
        formattedTime = "08:" + arr[1];
        midday = "am"
        TimeforMilliseconds = "8:" + arr[1]

    }
    else if (arr[0] == "21" || arr[0] == "09" || arr[0] == "9") {
        formattedTime = "09:" + arr[1];
        midday = "am"
        TimeforMilliseconds = "21:" + arr[1]
    }
    else if (arr[0] == "22" || arr[0] == "10") {
        formattedTime = "10:" + arr[1];
        midday = "am"
        TimeforMilliseconds = "10:" + arr[1]
    }
    else if (arr[0] == "23" || arr[0] == "11") {
        formattedTime = "11:" + arr[1];
        midday = "am"
        TimeforMilliseconds = "11:" + arr[1]
    }
    else if (arr[0] == "00" || arr[0] == "12") {
        formattedTime = "12:" + arr[1];
        midday = "am"
        TimeforMilliseconds = "12:" + arr[1]
    }

    else {
        formattedTime = arr[0] + ":" + arr[1];
        midday = "am";
    }
    console.log("TimeforMilliseconds" + TimeforMilliseconds)
    callback(formattedTime, midday, TimeforMilliseconds)
}