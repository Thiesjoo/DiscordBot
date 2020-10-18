const board = require("./board") //The board as a big object with strings
const conf = require("../../../config").roulette //Config for this game

const db = require("../../../config/db"); //Database
const gambleHelper = require("../gambleHelper"); //Helper functions for checking balance and stuff
const { amountInBoundary } = require("../gambleHelper");




class Game {
    constructor(channel, finalCallback) {
        this.board = { ...board }
        this.bets = [];

        // Place Holders to check if a number is green/red/black
        this.reds = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
        this.blacks = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35];
        // Arrays for Each 2 to 1 & for Printing
        this.topRow = [{ number: 3, count: 0, symbols: '' }, { number: 6, count: 0, symbols: '' }, { number: 9, count: 0, symbols: '' }, { number: 12, count: 0, symbols: '' }, { number: 15, count: 0, symbols: '' }, { number: 18, count: 0, symbols: '' }, { number: 21, count: 0, symbols: '' }, { number: 24, count: 0, symbols: '' }, { number: 27, count: 0, symbols: '' },
        { number: 30, count: 0, symbols: '' }, { number: 33, count: 0, symbols: '' }, { number: 36, count: 0, symbols: '' }];
        this.middleRow = [{ number: 2, count: 0, symbols: '' }, { number: 5, count: 0, symbols: '' }, { number: 8, count: 0, symbols: '' }, { number: 11, count: 0, symbols: '' }, { number: 14, count: 0, symbols: '' }, { number: 17, count: 0, symbols: '' }, { number: 20, count: 0, symbols: '' }, { number: 23, count: 0, symbols: '' }, { number: 26, count: 0, symbols: '' },
        { number: 29, count: 0, symbols: '' }, { number: 32, count: 0, symbols: '' }, { number: 35, count: 0, symbols: '' }];
        this.bottomRow = [{ number: 1, count: 0, symbols: '' }, { number: 4, count: 0, symbols: '' }, { number: 7, count: 0, symbols: '' }, { number: 10, count: 0, symbols: '' }, { number: 13, count: 0, symbols: '' }, { number: 16, count: 0, symbols: '' }, { number: 19, count: 0, symbols: '' }, { number: 22, count: 0, symbols: '' }, { number: 25, count: 0, symbols: '' },
        { number: 28, count: 0, symbols: '' }, { number: 31, count: 0, symbols: '' }, { number: 34, count: 0, symbols: '' }];

        // Counters used to iterate the position that the board places the users symbol
        this.zeroCount = { number: 1, symbols: '' };
        this.redCount = { number: 24, symbols: '' };
        this.blackCount = { number: 34, symbols: '' };
        this.evenCount = { number: 14, symbols: '' };
        this.oddCount = { number: 44, symbols: '' };
        this.lowCount = { number: 4, symbols: '' };
        this.highCount = { number: 54, symbols: '' };
        this.topCount = { number: 65, symbols: '' };
        this.midCount = { number: 65, symbols: '' };
        this.botCount = { number: 65, symbols: '' };
        this.firstCount = { number: 4, symbols: '' };
        this.secondCount = { number: 24, symbols: '' };
        this.thirdCount = { number: 44, symbols: '' };

        this.active = { game: false, betting: false, board: false }
        this.active_channel = channel
        this.lastDraw = new Date("0")
        this.usersToUpdate = {}
        this.timeTimer = setTimeout(() => { this.rollNumber() }, conf.duration * 1000)
        this.infoTimer = setInterval(() => { this.info() }, 1000)
        this.timeLimit = conf.duration //How many seconds remain in this game


        // These are used to map the positions for calculation when inserting into the board
        this.idMapTop = this.topRow.map(x => x.number);
        this.idMapMid = this.middleRow.map(x => x.number);
        this.idMapBot = this.bottomRow.map(x => x.number);


        this.finalCallback = finalCallback
        this.localCache = {};

        this.printBoard()
    }


    async bet(id, amountTemp, type, msg) {
        try {
           

            if (!(id in this.localCache)) {
                const user = await db.getUser(id)
                if (user.balance == 0) throw new Error("No money!")
                this.localCache[id] = user.balance
            }

            let amount = gambleHelper.inputToNumber(amountTemp, this.localCache[id])

            let bet = {
                player: id,
                type: type.toLowerCase(),
                amount,
            };

            //TODO: Maybe mention user
            if (!amountInBoundary(amount, [0, this.localCache[id]])) throw new Error("You do not have enough money for this transaction")


            if (bet.type == 'red' || bet.type == 'black' || bet.type == 'even' || bet.type == 'odd' || bet.type === '1-18' || bet.type === '19-36' || bet.type == 'top' || bet.type == 'mid' ||
                bet.type == 'bot' || bet.type === '1st' || bet.type === '2nd' || bet.type === '3rd') {
                if (bet.amount <= conf.minimumBetOutside) throw new Error(`${bet.type}/${bet.amount} You have to bet at least $${conf.minimumBetOutside} for bets on groups.`)
               
               
                this.localCache[id] -= amount

                this.bets.push(bet);
                msg.react("👍")
                this.printBoard()

            } else if (/^\d+$/.test(bet.type)) { //Match all numbers

                //Too high of a number
                if (!(parseInt(bet.type) < 37 && parseInt(bet.type) > -1)) throw new Error(`${bet.type} is not a valid. number(0-36), this bet was not counted.`);

                if (parseInt(bet.amount) < conf.minimumBetInside)
                    throw new Error(`${bet.type}/${bet.amount} You have to bet at least $${conf.minimumBetInside} for bets on numbers.`);

                this.localCache[id] -= amount

                this.bets.push(bet);
                msg.react("👍")
                this.printBoard()
            } else {
                throw new Error(`${bet.type} is not a valid. bet, this bet was not counted.`);
            }

        } catch (err) {
            console.error(err)
            this.active_channel.send(err.message)
        }
    }


    async info() {
        if (this.timeLimit % 15 == 0) {
            this.active_channel.send(`${this.timeLimit} seconds remaining! Place your bets!`);
        } else if (this.timeLimit == 20 || this.timeLimit == 10) {
            await this.printBoard();
            this.active_channel.send(`${this.timeLimit} seconds remaining! Place your bets!`);
        }
        this.timeLimit -= 1;
    }

    async printBoard(force = false) {
        if (!force && (new Date() - this.lastDraw) / 1000 < conf.minTime) return
        this.lastDraw = new Date()

        for (let i = 0; i < this.bets.length; i++) {
            let bet = this.bets[i]
            let indexOfTop = this.idMapTop.indexOf(parseInt(bet.type));
            let indexOfMid = this.idMapMid.indexOf(parseInt(bet.type));
            let indexOfBot = this.idMapBot.indexOf(parseInt(bet.type));

            let user = await db.getUser(bet.player)
            let symbolToUse = user.symbol;

            if (bet.type == 'red' && this.redCount.number < 30 && this.redCount.symbols.indexOf(symbolToUse) == -1) {
                this.redCount.number += 1;
                this.redCount.symbols += symbolToUse;
                board.boardRow20 = board.boardRow20.substring(0, this.redCount.number - 1) + symbolToUse + board.boardRow20.substring(this.redCount.number);
            } else if (bet.type == 'black' && this.blackCount.number < 40 && this.blackCount.symbols.indexOf(symbolToUse) == -1) {
                this.blackCount.number += 1;
                this.blackCount.symbols += symbolToUse;
                board.boardRow20 = board.boardRow20.substring(0, this.blackCount.number - 1) + symbolToUse + board.boardRow20.substring(this.blackCount.number);
            } else if (bet.type == 'odd' && this.oddCount.number < 50 && this.oddCount.symbols.indexOf(symbolToUse) == -1) {
                this.oddCount.number += 1;
                this.oddCount.symbols += symbolToUse;
                board.boardRow20 = board.boardRow20.substring(0, this.oddCount.number - 1) + symbolToUse + board.boardRow20.substring(this.oddCount.number);
            } else if (bet.type == 'even' && this.evenCount.number < 20 && this.evenCount.symbols.indexOf(symbolToUse) == -1) {
                this.evenCount.number += 1;
                this.evenCount.symbols += symbolToUse;
                board.boardRow20 = board.boardRow20.substring(0, this.evenCount.number - 1) + symbolToUse + board.boardRow20.substring(this.evenCount.number);
            } else if (bet.type == 'top' && this.topCount.number < 69 && this.topCount.symbols.indexOf(symbolToUse) == -1) {
                this.topCount.number += 1;
                this.topCount.symbols += symbolToUse;
                board.boardRow4 = board.boardRow4.substring(0, this.topCount.number - 1) + symbolToUse + board.boardRow4.substring(this.topCount.number);
            } else if (bet.type == 'mid' && this.midCount.number < 69 && this.midCount.symbols.indexOf(symbolToUse) == -1) {
                this.midCount.number += 1;
                this.midCount.symbols += symbolToUse;
                board.boardRow8 = board.boardRow8.substring(0, this.midCount.number - 1) + symbolToUse + board.boardRow8.substring(this.midCount.number);
            } else if (bet.type == 'bot' && this.botCount.number < 69 && this.botCount.symbols.indexOf(symbolToUse) == -1) {
                this.botCount.number += 1;
                this.botCount.symbols += symbolToUse;
                board.boardRow12 = board.boardRow12.substring(0, this.botCount.number - 1) + symbolToUse + board.boardRow12.substring(this.botCount.number);
            } else if (bet.type === '1st') {
                if (this.firstCount.number < 23 && this.firstCount.symbols.indexOf(symbolToUse) == -1) {
                    this.firstCount.number += 1;
                    this.firstCount.symbols += symbolToUse;
                    board.boardRow16 = board.boardRow16.substring(0, this.firstCount.number - 1) + symbolToUse + board.boardRow16.substring(this.firstCount.number);
                }
            } else if (bet.type === '2nd') {
                if (this.secondCount.number < 43 && this.secondCount.symbols.indexOf(symbolToUse) == -1) {
                    this.secondCount.number += 1;
                    this.secondCount.symbols += symbolToUse;
                    board.boardRow16 = board.boardRow16.substring(0, this.secondCount.number - 1) + symbolToUse + board.boardRow16.substring(this.secondCount.number);
                }
            } else if (bet.type === '3rd') {
                if (this.thirdCount.number < 63 && this.thirdCount.symbols.indexOf(symbolToUse) == -1) {
                    this.thirdCount.number += 1;
                    this.thirdCount.symbols += symbolToUse;
                    board.boardRow16 = board.boardRow16.substring(0, this.thirdCount.number - 1) + symbolToUse + board.boardRow16.substring(this.thirdCount.number);
                }
            } else if (bet.type === '1-18') {
                if (this.lowCount.number < 11 && this.lowCount.symbols.indexOf(symbolToUse) == -1) {
                    this.lowCount.number += 1;
                    this.lowCount.symbols += symbolToUse;
                    board.boardRow20 = board.boardRow20.substring(0, this.lowCount.number - 1) + symbolToUse + board.boardRow20.substring(this.lowCount.number);
                }
            } else if (bet.type === '19-36') {
                if (this.highCount.number < 61 && this.highCount.symbols.indexOf(symbolToUse) == -1) {
                    this.highCount.number += 1;
                    this.highCount.symbols += symbolToUse;
                    board.boardRow20 = board.boardRow20.substring(0, this.highCount.number - 1) + symbolToUse + board.boardRow20.substring(this.highCount.number);
                }
            } else if (indexOfTop > -1 && this.topRow[indexOfTop].count < 4) {
                if (this.topRow[indexOfTop].symbols.indexOf(symbolToUse) == -1) {
                    let indexPut = parseInt(bet.type) + this.topRow[indexOfTop].count + ((indexOfTop + 1) * 2) - 1;
                    this.topRow[indexOfTop].count += 1;
                    this.topRow[indexOfTop].symbols += symbolToUse;
                    board.boardRow4 = board.boardRow4.substring(0, indexPut) + symbolToUse + board.boardRow4.substring(indexPut + 1);
                }
            } else if (indexOfMid > -1 && this.middleRow[indexOfMid].count < 4) {
                if (this.middleRow[indexOfMid].symbols.indexOf(symbolToUse) == -1) {
                    let indexPut = parseInt(bet.type) + this.middleRow[indexOfMid].count + ((indexOfMid + 1) * 2);
                    this.middleRow[indexOfMid].count += 1;
                    this.middleRow[indexOfMid].symbols += symbolToUse;
                    board.boardRow8 = board.boardRow8.substring(0, indexPut) + symbolToUse + board.boardRow8.substring(indexPut + 1);
                }
            } else if (indexOfBot > -1 && this.bottomRow[indexOfBot].count < 4) {
                if (this.bottomRow[indexOfBot].symbols.indexOf(symbolToUse) == -1) {
                    let indexPut = parseInt(bet.type) + this.bottomRow[indexOfBot].count + ((indexOfBot + 1) * 2) + 1;
                    this.bottomRow[indexOfBot].count += 1;
                    this.bottomRow[indexOfBot].symbols += symbolToUse;
                    board.boardRow12 = board.boardRow12.substring(0, indexPut) + symbolToUse + board.boardRow12.substring(indexPut + 1);
                }
            } else if (parseInt(bet.type) === 0 && this.zeroCount.number < 3) {
                if (this.zeroCount.symbols.indexOf(symbolToUse) == -1) {
                    this.zeroCount.number += 1;
                    this.zeroCount.symbols += symbolToUse;
                    board.boardRow8 = board.boardRow8.substring(0, this.zeroCount.number - 1) + symbolToUse + board.boardRow8.substring(this.zeroCount.number);
                }
            }
        }
        this.active_channel.send(board.boardRow + board.boardRow1 + board.boardRow2 + board.boardRow3 + board.boardRow4 + board.boardRow5 + board.boardRow6 + board.boardRow7 + board.boardRow8 + board.boardRow9 + board.boardRow10 + board.boardRow11 + board.boardRow12 + board.boardRow13 + board.boardRow14 + board.boardRow15 +
            board.boardRow16 + board.boardRow17 + board.boardRow18 + board.boardRow19 + board.boardRow20 + board.boardRow21 + board.boardRowFinal)
    }

    async rollNumber() {
        try {
            this.active.betting = false
            await this.active_channel.send("Final board! No more bets")
            await this.printBoard(true)
            await this.active_channel.send("Rolling a number now!")


            let tempNum = Math.floor(Math.random() * 36);
            if (tempNum === 0) {
                this.pickedNum = {
                    type: 'green',
                    number: 0
                };
                this.active_channel.send('0 - Green');
            } else if (this.reds.indexOf(tempNum) > -1) {
                this.pickedNum = {
                    type: 'red',
                    number: tempNum
                };
                this.active_channel.send(`${tempNum} - Red`);
            } else if (this.blacks.indexOf(tempNum) > -1) {
                this.pickedNum = {
                    type: 'black',
                    number: tempNum
                };
                this.active_channel.send(`${tempNum} - Black`);
            }

            this.payoutWinners() //id: winnings    

            let send = '```\nPlayer       | Balance   | Profit\n====================================\n';
            let toSend;
            let playersFromHand = [];
            this.bets.forEach(bet => {
                playersFromHand.push(bet.player);
            });
            playersFromHand = playersFromHand.filter((x, i, arr) => arr.indexOf(x) == i); //Strip all duplicated players. Get a array of all players that competed

            playersFromHand = await Promise.all(playersFromHand.map(async (x) => {
                return db.getUser(x);
            }));


            //Alphabetically sort the players
            playersFromHand.sort(function (a, b) {
                if (a.name < b.name) { return -1; }
                if (a.name > b.name) { return 1; }
                return 0;
            })

            let pending = []

            for (let i = 0; i < playersFromHand.length; i++) {
                let player = playersFromHand[i]


                let profit = this.localCache[player.id] - player.balance

                toSend = `${player.name}(${player.symbol})`
                while (toSend.length < 13) {
                    toSend += ' ';
                }
                toSend += `|$${player.balance + profit}`;
                while (toSend.length < 25) {
                    toSend += ' ';
                }
                toSend += `|$${profit}\n`;
                send += toSend;

                pending.push(db.addBalance(player.id, profit))

                if (profit > 0) {
                    pending.push(db.addWin(player.id))
                } else {
                    pending.push(db.addLoss(player.id))
                }


                pending.push(db.setStatus(player.id, ""))
            }

            let start = Date.now()
            console.log("Beginning to wait for promises")
            await Promise.all(pending);
            console.log("Waiting took:", Date.now() - start, "ms")


            this.active_channel.send(`${send}\`\`\``);
        } catch (err) {
            console.error(err)
            this.active_channel.send("Something went wrong!")
        } finally {
            this.destroy()
        }
    }

    destroy() {
        clearInterval(this.infoTimer)
        clearTimeout(this.timeTimer)
        this.finalCallback()
    }

    payoutWinners = () => {
        let winners;
        if (this.pickedNum.type == 'red') {
            winners = this.grabWinners('red');
            this.giveMoney(winners);
        } else if (this.pickedNum.type == 'black') {
            winners = this.grabWinners('black');
            this.giveMoney(winners);
        }

        if (parseInt(this.pickedNum.number) % 2 === 0) {
            winners = this.grabWinners('even');
            this.giveMoney(winners);
        } else {
            winners = this.grabWinners('odd');
            this.giveMoney(winners);
        }

        if (this.idMapTop.indexOf(parseInt(this.pickedNum.number)) > -1) {
            winners = this.grabWinners('top');
            this.giveMoney(winners);
        } else if (this.idMapMid.indexOf(parseInt(this.pickedNum.number)) > -1) {
            winners = this.grabWinners('mid');
            this.giveMoney(winners);
        } else if (this.idMapBot.indexOf(parseInt(this.pickedNum.number)) > -1) {
            winners = this.grabWinners('bot');
            this.giveMoney(winners);
        }
        /** ***
        IMPLEMENT THE 1-18, 19-35 && 1st,2nd,3rd
        */
        if (this.pickedNum.number < 19 && this.pickedNum.number > 0) {
            winners = this.grabWinners('1-18');
            this.giveMoney(winners);
        } else if (this.pickedNum.number > 18) {
            winners = this.grabWinners('19-36');
            this.giveMoney(winners);
        }

        // 1st/2nd/3rd
        if (this.pickedNum.number < 13 && this.pickedNum.number > 0) {
            winners = this.grabWinners('1st');
            this.giveMoney(winners);
        } else if (this.pickedNum.
            number < 25 && this.pickedNum.number > 12) {
            winners = this.grabWinners('2nd');
            this.giveMoney(winners);
        } else if (this.pickedNum.number > 24) {
            winners = this.grabWinners('3rd');
            this.giveMoney(winners);
        }

        winners = this.grabWinners(this.pickedNum.number);
        this.giveMoney(winners);
    }

    grabWinners(type) {
        return this.bets.filter(bet => bet.type == type);
    }

    giveMoney(winners) {
        winners.forEach(bet => {
            let amount = bet.amount;
            let type = bet.type;

            let tempProfit = 0
            if (type == 'red' || type == 'black' || type == 'odd' || type == 'even' || type == '1-18' || type == '19-36') {
                tempProfit = amount * 2;
            } else if (type == 'top' || type == 'mid' || type == 'bot' || type == '1st' || type == '2nd' || type == '3rd') {
                tempProfit = amount * 3;
            } else {
                tempProfit = amount * 36;
            }

            this.localCache[bet.player] += tempProfit
        });
    }

}

module.exports = Game