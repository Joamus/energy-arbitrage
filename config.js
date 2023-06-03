module.exports = {
	GOVERNMENT_TARRIF: 0,
	SELL_TARRIF: 1,
	MAX_CHARGES_PER_DAY: 2,
	MIN_PROFIT_PER_KW: 50,
	KWH_SOLD_PER_TRANSACTION: 12,
	MONTH_MAP: {
		0: 'JANUARY',
		1: 'FEBRURARY',
		2: 'MARCH',
		3: 'APRIL',
		4: 'MAY',
		5: 'JUNE',
		6: 'JULY',
		7: 'AUGUST',
		8: 'SEPTEMBER',
		9: 'OCTOBER',
		10: 'NOVEMBER',
		11: 'DECEMBER'
	},
	MONTH_TO_TARRIF_SEASON: {
		APRIL: 'SUMMER',
		MAY: 'SUMMER',
		JUNE: 'SUMMER',
		JULY: 'SUMMER',
		AUGUST: 'SUMMER',
		SEPTEMBER: 'SUMMER',
		OCTOBER: 'WINTER',
		NOVEMBER: 'WINTER',
		DECEMBER: 'WINTER',
		JANUARY: 'WINTER',
		FEBRURARY: 'WINTER',
		MARCH: 'WINTER'
	},
	BUY_TIME_TARRIFS: {
		SUMMER: [
			{
				minHour: 0,
				maxHour: 5,
				fee: 18.86
			},
			{
				minHour: 6,
				maxHour: 16,
				fee: 28.30
			},
			{
				minHour: 17,
				maxHour: 20,
				fee: 73.59
			},
			{
				minHour: 21,
				maxHour: 23,
				fee: 28.30
			}
		],
		WINTER: [
			{
				minHour: 0,
				maxHour: 5,
				fee: 18.86
			},
			{
				minHour: 6,
				maxHour: 16,
				fee: 56.60
			},
			{
				minHour: 17,
				maxHour: 20,
				fee: 169.80
			},
			{
				minHour: 21,
				maxHour: 23,
				fee: 28.30
			}
		]
	}
};