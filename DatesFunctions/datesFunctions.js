
module.exports.getPreviousDate = function getPreviousDate(date, numberOfDaysToAddOrDelete, callback) {
    console.log("Getting previos date")
    var someDate = new Date(date);
    someDate.setDate(someDate.getDate() + numberOfDaysToAddOrDelete);

    var dd = someDate.getDate();
    var mm = someDate.getMonth() + 1;
    var y = someDate.getFullYear();

    date = y + '-' + mm + '-' + dd;
    console.log("previous date:" + date)
    callback(date)
}