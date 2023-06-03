

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
	
			const matchingBuyTarrifs = config.BUY_TIME_TARRIFS[config.MONTH_TO_TARRIF_SEASON[config.MONTH_MAP[month]]];
	
			let buyTarrifForThisHour;
	
			for (const tarrif of matchingBuyTarrifs) {
				let isBetweenHours = tarrif.minHour <= hour && tarrif.maxHour >= hour;
				if (isBetweenHours) {
					buyTarrifForThisHour = tarrif.fee;
					break;
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
		const allCombinations = Calculator.findAllCombinations(config, allBuySellCandidates, config.MAX_CHARGES_PER_DAY);

		const sortedBestCombinations = allCombinations.sort((a, b) => b.profit - a.profit);

		let topCombination = sortedBestCombinations[0];

		if (topCombination) {
			console.log(`*** Bedste kombinationer fundet i perioden ${from.toLocaleDateString('da-DK')} - ${to.toLocaleDateString('da-DK')}  ***`);
			for (const buySell of topCombination.buySells) {
				console.log(`Køb: ${buySell.buyDate.toLocaleString('da-DK')} - Sælg: ${buySell.sellDate.toLocaleString('da-DK')} - profit: ${(buySell.profit/100).toFixed(2)} kr. per KW`);
			}
		
			console.log('*** Total Profit ***');
			console.log(`${(topCombination.totalProfit/100).toFixed(2)} kr. - antal kW = ${config.KWH_SOLD_PER_TRANSACTION}`);
		} else {
			console.log('*** Ingen kombination fundet ***');
		}
	
	
	}
	
	/**
	 * @param {object} config Config object, containing tarrifs etc.
	 * @param {any[]} buySellCandidates List of "BuySell"-objects
	 * @param {integer} maxAmountOfTransactionsInACombination Max amount of transactions that can be in one combination
	 * @returns 
	 */
	static findAllCombinations(config, buySellCandidates, maxAmountOfTransactionsInACombination = 1) {
		/** Combination keys  */
		const combinations = [];
	
		/* Our first loop is the "base" transactions, so is included. If we want to do 3 charges per day,
		 * Then we run our main loop, and run the other loop twice.
		*/
	
		for (let i = 0; i < buySellCandidates.length; i++) {
			let candidates = [];
			const mainCandidate = buySellCandidates[i];

			if (maxAmountOfTransactionsInACombination === 1) {
				combinations.push(Calculator.makeCombination(config, [ mainCandidate ]));
				continue;
			}

			candidates.push(mainCandidate);
	
			for (let j = i + 1; j < buySellCandidates.length; j++) {
				
				const candidate = buySellCandidates[j];
	
				const foundOverlappingCandidate = candidates.find(o => Calculator.areBuySellsOverlapping(o, candidate));

				if (!foundOverlappingCandidate) {
					if (candidates.length < maxAmountOfTransactionsInACombination) {
						candidates.push(candidate);
						if (candidates.length === maxAmountOfTransactionsInACombination) {
							combinations.push(Calculator.makeCombination(config, candidates));
							candidates = [];
							candidates.push(mainCandidate);
						}
					}
				}
			}
			if (candidates.length > 0) {
				combinations.push(Calculator.makeCombination(config, candidates));
			}
		}
	
		return combinations;
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
