module.exports.prepareTextForApiAi = function prepareTextForApiAi(text, callback) {
    if ((text).indexOf('mailto') > -1) {
        console.log("text" + text)
        var arr = text.toString().split('<')
        var first_part = arr[0]
        console.log("first_part" + first_part)
        arr = text.toString().split('>')
        var last_part = arr[1]
        console.log("last_part" + last_part)
        var mailPart = arr[0]
        console.log("mailPart" + mailPart)

        mailPart = mailPart.toString().split('|')
        mailPart = mailPart[1];
        mailPart = mailPart.replace(/@exalt.ps/g, "");
        mailPart = mailPart.replace(/>/g, "");
        console.log("mailPart" + mailPart)
        text = first_part + "" + mailPart + "" + last_part

        callback(text)
    } else callback(text)
}