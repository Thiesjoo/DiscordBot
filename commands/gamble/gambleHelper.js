const { isNum } = require("../../messages/helper")

const outcomeMap = { true: "win! :smiley:", false: "lose! :sob:" }

async function processResult(id, result, channel, db) {
    //result : {delta: 100, gameType: "Coinflip", bet: 1000}
    console.log(id,result)
    let user = await db.addBalance(id, result.delta)
    if (result.delta > 0) {
        await db.addWin(id)
    } else {
        await db.addLoss(id)
    }
    return channel.send({
        embed: {
            color: result.delta > 0 ? [107, 235, 52] : [235, 52, 67],
            title: result.gameType,
            description: "You " + outcomeMap[result.delta > 0],
            fields: [
                {
                    name: `You ${result.delta > 0 ? "gained" : "lost"}`,
                    value: "$" + Math.abs(result.delta)
                },
                {
                    name: "New balance",
                    value: "$" + user.balance
                }
            ]
        }
    })
}

//input to number. Check for percentages and "all"
function inputToNumber(input, balance) {
    if (isNum(input)) {
        let amt = parseInt(input)
        return amt
    } else {
        if (input.includes("%")) {
            let float = parseFloat(input.slice(0, -1) / 100)
            if (float < 0 || float > 100) return 0
            return Math.round(float * balance)
        } else if (input == "all") {
            return balance
        }
    }
}

//Check if number is between boundaries
function amountInBoundary(amt, boundaries) {
    if (!amt) return true
    if (amt <= boundaries[0]) return true
    if (amt >= boundaries[1]) return true
    return false
}

module.exports = {
    amountInBoundary, inputToNumber, processResult
}