const db = require("../db")
const conf = {
    minimumBetInside: 1000,  // Minimun Bet for single numbers
    minimumBetOutside: 1000, // Miniumun bet for <even, odd, ...>
    duration: 50, // Duration in seconds of the game
    minTime: 2//Minium time between board-draws
}

const board = require("./board")
let game = require("./game_var")



module.exports = [{
    name: "roulette",
    description: "Start a roulette game",
    async execute(msg, args) {
        if (!game.active.game) {
            game.active = { game: true, betting: true, board: true }
            msg.channel.send("Started a roulette game. Use !bet to place your bets")

            game.time = setTimeout(() => { rollNumber(msg) }, conf.duration * 1000)
            game.info = setInterval(() => { info() }, 1000)
            game.timeLimit = conf.duration
            game.active_channel = msg.channel
            printBoard()
        } else {
            msg.reply("A game is already running. You can bet with !bet")
        }
    }
}, {
    name: 'set-symbol',
    alias: ["ss"],
    description: 'Set you symbol to be used in games. Usage: !symbol <your symbol>',
    async execute(msg, args) {
        if (!args[0]) {
            msg.reply("Please provide a symbol.")
            return
        }

        let symbol = args[0]
        if (symbol.length > 1) {
            msg.reply("Please provide 1 symbol.")
            return
        }
        await db.updateSymbol(msg.author.id, symbol)
        msg.reply(`Updated your symbol to: ${symbol}!`)
    },
}, {
    name: 'finish-roulette',
    alias: ["finish"],
    description: 'Stop the roulette game that is currently running',
    execute(msg, args) {
        if (game.active.game) {
            rollNumber()
            msg.react("👍")
        } else {
            msg.reply("There are no games running currently")
        }
    },
},{
    name: "bet",
    description: "Bet in an active roulette game game. Usage: !bet <amount to bet> <number, red, black, even, odd, 1st, 2nd, 3rd, 1-18,19-36>",
    async execute(msg, args) {
        if (!args[0] || !args[1]) {
            msg.reply("Invalid command. Usage: !bet <amount to bet> <number, red, black, even, odd, 1st, 2nd, 3rd, 1-18,19-36>")
            return
        }
        if (game.active && game.active.betting) {
            // let user = await db.initUser(msg.author.id)
            let amount = 0
            let balanceToCheck = 0
            if (msg.author.id in global.user_cache) {
                if (global.user_cache[msg.author.id].game !== "roulette") {
                    msg.reply("You are already active in another game!")
                    return
                }
                amount = db.processInput(args[0], global.user_cache[msg.author.id].balance)
                if (!amount) {
                    msg.reply("Please enter a valid amount of money")
                    return
                }
                balanceToCheck = global.user_cache[msg.author.id]
            } else {
                let balance = await db.getBalance(msg.author.id)
                amount = db.processInput(args[0], balance)
                if (!amount) {
                    msg.reply("Please enter a valid amount of money")
                    return
                }
                balanceToCheck = balance
                global.user_cache[msg.author.id] = {balance, nickname: game.active_channel.members.get(msg.author.id).nickname, symbol: await db.getSymbol(msg.author.id), game: "roulette"}
            }

            if (db.checkInvalid(amount, [1, balanceToCheck])) {
                msg.reply("You dont have that money in your bank account. Usage: !bet <amount to bet> <number, red, black, even, odd, 1st, 2nd, 3rd, 1-18,19-36>")
                return
            }
            let bet = {
                type: args[1].toLowerCase(),
                amount,
                player: msg.author.id
            };
            if (bet.type == 'red' || bet.type == 'black' || bet.type == 'even' || bet.type == 'odd' || bet.type === '1-18' || bet.type === '19-36' || bet.type == 'top' || bet.type == 'mid' ||
            bet.type == 'bot' || bet.type === '1st' || bet.type === '2nd' || bet.type === '3rd') {
                if (bet.amount < conf.minimumBetOutside) {
                    game.active_channel.send(`${bet.type}/${bet.amount} You have to bet at least $${conf.minimumBetOutside} for bets on groups.`);
                    return
                } else {
                    global.user_cache[msg.author.id].balance -= bet.amount
                    game.bets.push(bet);
                    msg.react("👍")
                    printBoard()
                }
            } else if (/^\d+$/.test(bet.type)) {
                if (parseInt(bet.type) < 37 && parseInt(bet.type) > -1) {
                    if (parseInt(bet.amount) < conf.minimumBetInside) {
                        game.active_channel.send(`${bet.type}/${bet.amount} You have to bet at least $${conf.minimumBetInside} for bets on numbers.`);
                        return
                    } else {
                        global.user_cache[msg.author.id].balance -= bet.amount
                        game.bets.push(bet);
                        msg.react("👍")
                        printBoard()
                    }
                } else {
                    game.active_channel.send(`${bet.type} is not a valid. number(0-36), this bet was not counted.`);
                    return
                }
            } else {
                game.active_channel.send(`${bet.type} is not a valid. bet, this bet was not counted.`);
                return
            }
        } else {
            msg.reply("There is no game active right now. You can start one with !roulette")
        }
    }
}
]

function info() {
    if (game.timeLimit % 15 == 0) {
        game.active_channel.send(`${game.timeLimit} seconds remaining! Place your bets!`);
    } else if (game.timeLimit == 20 || game.timeLimit == 10) {
        printBoard();
        game.active_channel.send(`${game.timeLimit} seconds remaining! Place your bets!`);
    }
    game.timeLimit -= 1;
}

const resetRows = () => {
    for (let i = 0; i < game.topRow.length; i++) {
        game.topRow[i].count = 0;
        game.middleRow[i].count = 0;
        game.bottomRow[i].count = 0;
    }
    game.zeroCount.number = 1, game.redCount.number = 24, game.blackCount.number = 34, game.evenCount.number = 14, game.oddCount.number = 44, game.lowCount.number = 4, game.highCount.number = 54, game.topCount.number = 65, game.midCount.number = 65,
        game.botCount.number = 65, game.firstCount.number = 4, game.secondCount.number = 24, game.thirdCount.number = 44;
}

const resetGame = () => {
    game.bets = [];
    game.active = { game: false, betting: false, board: false }
    game.active_channel = null
    clearInterval(game.info)
    clearTimeout(game.time)
    resetRows();
    board.boardRow4 = '|  |    |    |    |    |    |    |    |    |    |    |    |    ||     |\n';
    board.boardRow8 = '|  |    |    |    |    |    |    |    |    |    |    |    |    ||     |\n';
    board.boardRow12 = '|  |    |    |    |    |    |    |    |    |    |    |    |    ||     |\n';
    board.boardRow20 = '   |         |         |         |         |         |         |\n';
    board.boardRow16 = '   |                   |                   |                   |\n';
}

async function printBoard(force = false) {
    if (!force && (new Date() - game.lastDraw) / 1000 < conf.minTime) return
    game.lastDraw = new Date()
    for (let i = 0; i < game.bets.length; i++) {
        let bet = game.bets[i]
        let indexOfTop = game.idMapTop.indexOf(parseInt(bet.type));
        let indexOfMid = game.idMapMid.indexOf(parseInt(bet.type));
        let indexOfBot = game.idMapBot.indexOf(parseInt(bet.type));

        let user = global.user_cache[bet.player]
        let symbolToUse = user.symbol;

        if (bet.type == 'red' && game.redCount.number < 30 && game.redCount.symbols.indexOf(symbolToUse) == -1) {
            game.redCount.number += 1;
            game.redCount.symbols += symbolToUse;
            board.boardRow20 = board.boardRow20.substring(0, game.redCount.number - 1) + symbolToUse + board.boardRow20.substring(game.redCount.number);
        } else if (bet.type == 'black' && game.blackCount.number < 40 && game.blackCount.symbols.indexOf(symbolToUse) == -1) {
            game.blackCount.number += 1;
            game.blackCount.symbols += symbolToUse;
            board.boardRow20 = board.boardRow20.substring(0, game.blackCount.number - 1) + symbolToUse + board.boardRow20.substring(game.blackCount.number);
        } else if (bet.type == 'odd' && game.oddCount.number < 50 && game.oddCount.symbols.indexOf(symbolToUse) == -1) {
            game.oddCount.number += 1;
            game.oddCount.symbols += symbolToUse;
            board.boardRow20 = board.boardRow20.substring(0, game.oddCount.number - 1) + symbolToUse + board.boardRow20.substring(game.oddCount.number);
        } else if (bet.type == 'even' && game.evenCount.number < 20 && game.evenCount.symbols.indexOf(symbolToUse) == -1) {
            game.evenCount.number += 1;
            game.evenCount.symbols += symbolToUse;
            board.boardRow20 = board.boardRow20.substring(0, game.evenCount.number - 1) + symbolToUse + board.boardRow20.substring(game.evenCount.number);
        } else if (bet.type == 'top' && game.topCount.number < 69 && game.topCount.symbols.indexOf(symbolToUse) == -1) {
            game.topCount.number += 1;
            game.topCount.symbols += symbolToUse;
            board.boardRow4 = board.boardRow4.substring(0, game.topCount.number - 1) + symbolToUse + board.boardRow4.substring(game.topCount.number);
        } else if (bet.type == 'mid' && game.midCount.number < 69 && game.midCount.symbols.indexOf(symbolToUse) == -1) {
            game.midCount.number += 1;
            game.midCount.symbols += symbolToUse;
            board.boardRow8 = board.boardRow8.substring(0, game.midCount.number - 1) + symbolToUse + board.boardRow8.substring(game.midCount.number);
        } else if (bet.type == 'bot' && game.botCount.number < 69 && game.botCount.symbols.indexOf(symbolToUse) == -1) {
            game.botCount.number += 1;
            game.botCount.symbols += symbolToUse;
            board.boardRow12 = board.boardRow12.substring(0, game.botCount.number - 1) + symbolToUse + board.boardRow12.substring(game.botCount.number);
        } else if (bet.type === '1st') {
            if (game.firstCount.number < 23 && game.firstCount.symbols.indexOf(symbolToUse) == -1) {
                game.firstCount.number += 1;
                game.firstCount.symbols += symbolToUse;
                board.boardRow16 = board.boardRow16.substring(0, game.firstCount.number - 1) + symbolToUse + board.boardRow16.substring(game.firstCount.number);
            }
        } else if (bet.type === '2nd') {
            if (game.secondCount.number < 43 && game.secondCount.symbols.indexOf(symbolToUse) == -1) {
                game.secondCount.number += 1;
                game.secondCount.symbols += symbolToUse;
                board.boardRow16 = board.boardRow16.substring(0, game.secondCount.number - 1) + symbolToUse + board.boardRow16.substring(game.secondCount.number);
            }
        } else if (bet.type === '3rd') {
            if (game.thirdCount.number < 63 && game.thirdCount.symbols.indexOf(symbolToUse) == -1) {
                game.thirdCount.number += 1;
                game.thirdCount.symbols += symbolToUse;
                board.boardRow16 = board.boardRow16.substring(0, game.thirdCount.number - 1) + symbolToUse + board.boardRow16.substring(game.thirdCount.number);
            }
        } else if (bet.type === '1-18') {
            if (game.lowCount.number < 11 && game.lowCount.symbols.indexOf(symbolToUse) == -1) {
                game.lowCount.number += 1;
                game.lowCount.symbols += symbolToUse;
                board.boardRow20 = board.boardRow20.substring(0, game.lowCount.number - 1) + symbolToUse + board.boardRow20.substring(game.lowCount.number);
            }
        } else if (bet.type === '19-36') {
            if (game.highCount.number < 61 && game.highCount.symbols.indexOf(symbolToUse) == -1) {
                game.highCount.number += 1;
                game.highCount.symbols += symbolToUse;
                board.boardRow20 = board.boardRow20.substring(0, game.highCount.number - 1) + symbolToUse + board.boardRow20.substring(game.highCount.number);
            }
        } else if (indexOfTop > -1 && game.topRow[indexOfTop].count < 4) {
            if (game.topRow[indexOfTop].symbols.indexOf(symbolToUse) == -1) {
                let indexPut = parseInt(bet.type) + game.topRow[indexOfTop].count + ((indexOfTop + 1) * 2) - 1;
                game.topRow[indexOfTop].count += 1;
                game.topRow[indexOfTop].symbols += symbolToUse;
                board.boardRow4 = board.boardRow4.substring(0, indexPut) + symbolToUse + board.boardRow4.substring(indexPut + 1);
            }
        } else if (indexOfMid > -1 && game.middleRow[indexOfMid].count < 4) {
            if (game.middleRow[indexOfMid].symbols.indexOf(symbolToUse) == -1) {
                let indexPut = parseInt(bet.type) + game.middleRow[indexOfMid].count + ((indexOfMid + 1) * 2);
                game.middleRow[indexOfMid].count += 1;
                game.middleRow[indexOfMid].symbols += symbolToUse;
                board.boardRow8 = board.boardRow8.substring(0, indexPut) + symbolToUse + board.boardRow8.substring(indexPut + 1);
            }
        } else if (indexOfBot > -1 && game.bottomRow[indexOfBot].count < 4) {
            if (game.bottomRow[indexOfBot].symbols.indexOf(symbolToUse) == -1) {
                let indexPut = parseInt(bet.type) + game.bottomRow[indexOfBot].count + ((indexOfBot + 1) * 2) + 1;
                game.bottomRow[indexOfBot].count += 1;
                game.bottomRow[indexOfBot].symbols += symbolToUse;
                board.boardRow12 = board.boardRow12.substring(0, indexPut) + symbolToUse + board.boardRow12.substring(indexPut + 1);
            }
        } else if (parseInt(bet.type) === 0 && game.zeroCount.number < 3) {
            if (game.zeroCount.symbols.indexOf(symbolToUse) == -1) {
                game.zeroCount.number += 1;
                game.zeroCount.symbols += symbolToUse;
                board.boardRow8 = board.boardRow8.substring(0, game.zeroCount.number - 1) + symbolToUse + board.boardRow8.substring(game.zeroCount.number);
            }
        }
    }
    game.active_channel.send(board.boardRow + board.boardRow1 + board.boardRow2 + board.boardRow3 + board.boardRow4 + board.boardRow5 + board.boardRow6 + board.boardRow7 + board.boardRow8 + board.boardRow9 + board.boardRow10 + board.boardRow11 + board.boardRow12 + board.boardRow13 + board.boardRow14 + board.boardRow15 +
        board.boardRow16 + board.boardRow17 + board.boardRow18 + board.boardRow19 + board.boardRow20 + board.boardRow21 + board.boardRowFinal).then(message => globalBoardMessage = message).catch(console.error);
}

const giveMoney = (winners) => {
    winners.forEach(bet => {
        let amount = bet.amount;
        let type = bet.type;

        if (type == 'red' || type == 'black' || type == 'odd' || type == 'even' || type == '1-18' || type == '19-36') {
           global.user_cache[bet.player].balance += amount * 2;
        } else if (type == 'top' || type == 'mid' || type == 'bot' || type == '1st' || type == '2nd' || type == '3rd') {
           global.user_cache[bet.player].balance += amount * 3;
        } else {
           global.user_cache[bet.player].balance += amount * 36;
        }
    });
}


const payoutWinners = () => {
    let winners;
    if (game.pickedNum.type == 'red') {
        winners = grabWinners('red');
        giveMoney(winners);
    } else
        if (game.pickedNum.type == 'black') {
            winners = grabWinners('black');
            giveMoney(winners);
        }

    if (parseInt(game.pickedNum.number) % 2 === 0) {
        winners = grabWinners('even');
        giveMoney(winners);
    } else {
        winners = grabWinners('odd');
        giveMoney(winners);
    }

    if (game.idMapTop.indexOf(parseInt(game.pickedNum.number)) > -1) {
        winners = grabWinners('top');
        giveMoney(winners);
    } else if (game.idMapMid.indexOf(parseInt(game.pickedNum.number)) > -1) {
        winners = grabWinners('mid');
        giveMoney(winners);
    } else if (game.idMapBot.indexOf(parseInt(game.pickedNum.number)) > -1) {
        winners = grabWinners('bot');
        giveMoney(winners);
    }
    /** ***
    IMPLEMENT THE 1-18, 19-35 && 1st,2nd,3rd
    */
    if (game.pickedNum.number < 19 && game.pickedNum.number > 0) {
        winners = grabWinners('1-18');
        giveMoney(winners);
    } else if (game.pickedNum.number > 18) {
        winners = grabWinners('19-36');
        giveMoney(winners);
    }

    // 1st/2nd/3rd
    if (game.pickedNum.number < 13 && game.pickedNum.number > 0) {
        winners = grabWinners('1st');
        giveMoney(winners);
    } else if (game.pickedNum.
        number < 25 && game.pickedNum.number > 12) {
        winners = grabWinners('2nd');
        giveMoney(winners);
    } else if (game.pickedNum.number > 24) {
        winners = grabWinners('3rd');
        giveMoney(winners);
    }

    // Pay out all Number game.bets
    winners = grabWinners(game.pickedNum.number);
    giveMoney(winners);

}

const grabWinners = type => {
    return game.bets.filter(bet => bet.type == type);
}

async function rollNumber() {
    game.active.betting = false
    await game.active_channel.send("Final board! No more bets")
    await printBoard(true)
    await game.active_channel.send("Rolling a number now!")
    // await takeMoney()
    let tempNum = Math.floor(Math.random() * 36);
    if (tempNum === 0) {
        game.pickedNum = {
            type: 'green',
            number: 0
        };

        game.active_channel.send('0 - Green');
    } else if (game.reds.indexOf(tempNum) > -1) {
        game.pickedNum = {
            type: 'red',
            number: tempNum
        };
        game.active_channel.send(`${tempNum} - Red`);
    } else if (game.blacks.indexOf(tempNum) > -1) {
        game.pickedNum = {
            type: 'black',
            number: tempNum
        };
        game.active_channel.send(`${tempNum} - Black`);
    }

    payoutWinners()



    let send = '```\nPlayer       | Balance   | Profit\n====================================\n';
	let toSend;
	let playersFromHand = [];
	game.bets.forEach(bet => {
		playersFromHand.push(bet.player);
	});
    playersFromHand = playersFromHand.filter((x, i, a) => a.indexOf(x) == i); //Strip all duplicated players. Get a array of all players that competed

    //Alphabetically sort the players
    playersFromHand.sort(function(a, b){
        let chatPlayer_a = game.active_channel.members.get(a)
        let chatPlayer_b = game.active_channel.members.get(b)

        if(chatPlayer_a.nickname < chatPlayer_b.nickname) { return -1; }
        if(chatPlayer_a.nickname > chatPlayer_b.nickname) { return 1; }
        return 0;
    })


	for (let i = 0; i < playersFromHand.length; i++) {
        let player = playersFromHand[i]
        let dbPlayer = await db.initUser(player)
        let tempPlayer = global.user_cache[player]

        let profit = tempPlayer.balance - dbPlayer.balance
        db.addBalance(player,profit)

        if (profit > 0) {
            db.addWin(player)
        } else {
            db.addLoss(player)
        }

		toSend = `${tempPlayer.nickname}(${tempPlayer.symbol})`
		while(toSend.length < 13) {
			toSend += ' ';
		}
		toSend += `|$${tempPlayer.balance}`;
		while(toSend.length < 25) {
			toSend += ' ';
		}
		toSend += `|$${profit}\n`;
        send += toSend;
        
        delete global.user_cache[player]
	}
	game.active_channel.send(`${send}\`\`\``);


    // //Apply all actions to database
    // let tempArray = Object.entries(global.user_cache)
    // for (let i = 0; i < tempArray.length; i++) {
    //     let user = tempArray[i]
    //     if (user[1].game === "roulette") {
    //         await 
    //     }
    //     user[1].balance = user[1].balance < 0 ? 0 : parseInt(user[1].balance)
    //     await db.updateUser(user[0], user[1])
    // }
    await resetGame()
}