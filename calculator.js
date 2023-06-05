

// Depends on month - MONTHS ARE 0 based
const fs = require('fs').promises;

/**
 * This functions builds the dataset we need, and calculates prices etc.
 * @param {string} csvData CSV data as a string
 * @returns 
 */

class Calculator {
	
	static makeDataSet(config, csvData) {
		const dataSet = {
			map: {},
			list: []
		};
	
		const lines = csvData.split('\n');

		// Remove headers
		lines.splice(0, 1);
	
		for (const line of lines) {
			const data = line.split(';');
			if (!line) {
				continue;
			}
	
			const price = parseFloat(data[0]);

			let splitDate = data[1].split('.');

			let date;
			{
				let day = splitDate[0];
				let month = splitDate[1];
				let year = splitDate[2];

				date = new Date(`${year}-${month}-${day}`);
				date.setHours(0, 0, 0, 0);
			}
	
			const dateString = date.toLocaleDateString();
	
			const hour = parseInt(data[2]);
			const month = date.getMonth();
	
			let buyTarrifForThisHour;

			if (config.BATTERY_SIZE_KWH >= 1000) {
				buyTarrifForThisHour = 17;
			} else {
				const matchingBuyTarrifs = config.BUY_TIME_TARRIFS[config.MONTH_TO_TARRIF_SEASON[config.MONTH_MAP[month]]];
				for (const tarrif of matchingBuyTarrifs) {
					let isBetweenHours = tarrif.minHour <= hour && tarrif.maxHour >= hour;
					if (isBetweenHours) {
						buyTarrifForThisHour = tarrif.fee;
						break;
					}
				}
			}
			
			if (!buyTarrifForThisHour) {
				throw Error(`Could not find price for error - something is wrong: Date ${dateString} with hour ${hour}`);
			}
	
	
			if (!dataSet.map[dateString]) {
				dataSet.map[dateString] = {
					date: date,
					hours: {}
				};
			}
			const dateForThisHour = new Date(date);
			dateForThisHour.setHours(hour);
	
			let obj = {
				// date: date.getDate(),
				// month: date.getMonth(),
				date: dateForThisHour,
				price: price,
				sellPrice: price + config.SELL_TARRIF,
				buyPrice: price + buyTarrifForThisHour
				// hour: hour
			};
	
			dataSet.map[dateString].hours[hour] = obj;
			dataSet.list.push(obj);
		}
	
		return dataSet;
	
	}
	
	static async init(config) {
		const csvFile = await fs.readFile('files/elspriser2023.csv', 'utf-8');
	
		const from = new Date(config.FROM_DATE);
		// from.setHours(0, 0, 0, 0);
		
		const to = new Date(config.TO_DATE);
		// to.setHours(23, 59, 59, 59);
	
		const dataSet = Calculator.makeDataSet(config, csvFile);

		const allBuySellCandidates = Calculator.findAllBuySellCandidates(config, dataSet.list, from, to);
		const allCombinations = Calculator.findAllCombinations(config, [], config.MAX_BUY_SELLS_PER_DAY, [], allBuySellCandidates, 0);

		const sortedBestCombinations = allCombinations.sort((a, b) => b.profit - a.profit);

		let topCombination = sortedBestCombinations[0];
		
		if (topCombination) {
			topCombination.buySells = topCombination.buySells.sort((a, b) => a.buyDate - b.buyDate);
			Calculator.outputSuccess(from, to, config, topCombination);
		} else {
			const errorMessage = 'Ingen kombination fundet';
			if (config.OUTPUT === 'JSON') {
				console.error({ error: 'not_found', message: errorMessage });
			} else {
				console.log(`*** ${errorMessage} - Periode: ${from.toLocaleDateString('da-DK')} - ${to.toLocaleDateString('da-DK')} ***`);
			}
		}
	
	}

	static outputSuccess(from, to, config, topCombination) {
		switch (config.OUTPUT) {
			case 'DEFAULT': {
				console.log(`*** Bedste kombinationer fundet - Periode: ${from.toLocaleDateString('da-DK')} - ${to.toLocaleDateString('da-DK')} ***`);
				for (const buySell of topCombination.buySells) {
					console.log(`Køb: ${buySell.buyDate.toLocaleString('da-DK')} - Sælg: ${buySell.sellDate.toLocaleString('da-DK')} - profit: ${(buySell.profit/100).toFixed(2)} kr. per KW`);
				}
			
				console.log('*** Total Profit ***');
				console.log(`${(topCombination.totalProfit/100).toFixed(2)} kr. - antal kW = ${config.KWH_SOLD_PER_TRANSACTION} batteristørrelse = ${config.BATTERY_SIZE_KWH}kw`);
				break;
			}
			case 'JSON': {
				console.log(JSON.stringify(topCombination));
				break;
			}

		}
	}

	static findAllCombinations(config, combinationList, amountOfCombinations, previousBuySells = [], allBuySells, index) {
		if (amountOfCombinations == 0) {
			return;
		}
	
		for (let i = index; i < allBuySells.length; i++) {
			const currentBuySell = allBuySells[i];
			if (i > 0) {
				const previousBuySell = previousBuySells[previousBuySells.length - 1];
				/* If the current and previous buy sell are overlapping, there is no reason to go further ahead with buy sells
				 * because if a + b is an invalid combination, then a + b + c/d/e will always be invalid as well.
				*/
				if (previousBuySell && Calculator.areBuySellsOverlapping(previousBuySell, currentBuySell)) {
					continue;
				}
			}

			const newBuySells = [];

			for (const buySell of previousBuySells) {
				newBuySells.push(buySell);
			}
			newBuySells.push(currentBuySell);

			const thisCombination = this.makeCombination(config, newBuySells);
			
			// let thisCombination = combinationCopy + buySells[i];
			combinationList.push(thisCombination);
			Calculator.findAllCombinations(config, combinationList, amountOfCombinations - 1, newBuySells, allBuySells, i + 1);
		}

		return combinationList;
	}


	static makeCombination(config, buySells) {
		let profit = 0;
		for (const candidate of buySells)  {
			profit += candidate.profit;
		}

		return {
			profit: profit,
			totalProfit: profit * config.KWH_SOLD_PER_TRANSACTION,
			buySells: buySells
		};
	}

	
	static areBuySellsOverlapping(a, b) {
		return a.buyDate >= b.buyDate && a.buyDate <= b.sellDate ||
			b.buyDate >= a.buyDate && b.buyDate <= a.sellDate ||
			a.sellDate >= b.buyDate && a.sellDate <= b.sellDate ||
			b.sellDate >= a.buyDate && b.sellDate <= a.sellDate;	
	}
	
	
	/**
	 * 
	 * @param {any[]} list List of all data of energy prices, with calculated buy/sell prices, including tarrifs
	 * @param {*} start Minimum start date, that the buy transaction has to be equal or higher to
	 * @param {*} to Maximum end date, that the sell transaction has to be lower or equal to.
	 * @returns {any[]} List of "BuySell"-object
	 */
	static findAllBuySellCandidates(config, list, start, to) {
		let buySells = [];
		for (let i = 0; i < list.length; i++) {
			let buyTransaction = list[i];
			if (buyTransaction.date < start) {
				continue;
			}
			if (buyTransaction.date >= to) {
				return buySells; // No reason to keep looping, if we are already above the to. They are sorted in time order.
			}

			for (let j = i + 1; j < list.length; j++) {
				let sellTransaction = list[j];
				if (sellTransaction.date >= to) {
					break; // No reason to keep looping, if we are already above the to. They are sorted in time order.
				}
				const profit =  sellTransaction.sellPrice - buyTransaction.buyPrice;
				if (profit >= config.MIN_PROFIT_PER_KW) {
					buySells.push({
						buyDate: buyTransaction.date,
						buyPrice: buyTransaction.buyPrice,
						sellDate: sellTransaction.date,
						sellPrice: sellTransaction.sellPrice,
						profit: profit
					});
				}
			}
		}
		return buySells;
	}

}

module.exports = exports = Calculator;
