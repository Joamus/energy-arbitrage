const assert = require('assert');
const Calculator = require('../calculator');
const config = require('./config');


// eslint-disable-next-line no-undef
describe('#areBuySellsOverlapping', () => {
	// eslint-disable-next-line no-undef
	const baseDate = new Date('2023-06-03');
	baseDate.setHours(0, 0, 0, 0);

	{
		const aBuyDate = new Date(baseDate);
		aBuyDate.setHours(0);
	
		const aSellDate = new Date(baseDate);
		aSellDate.setHours(3);
	
		const bBuyDate = new Date(baseDate);
		bBuyDate.setHours(4);
	
		const bSellDate = new Date(baseDate);
		bSellDate.setHours(7);
	
		const a = {
			buyDate: aBuyDate,
			sellDate: aSellDate
		};
		const b = {
			buyDate: bBuyDate,
			sellDate: bSellDate
		};
		// eslint-disable-next-line no-undef
		it(`Should not overlap - Buy-Sell A (${a.buyDate.toLocaleDateString()} ${a.buyDate.getHours()} - ${a.sellDate.getHours(0)}) and Buy-Sell B (${b.buyDate.toLocaleDateString()} ${b.buyDate.getHours()} - ${b.sellDate.getHours(0)}) `, () => {
			assert.strictEqual(Calculator.areBuySellsOverlapping(a, b), false);
		});
	}

	{
		const aBuyDate = new Date(baseDate);
		aBuyDate.setHours(0);
	
		const aSellDate = new Date(baseDate);
		aSellDate.setHours(3);
	
		baseDate.setDate(baseDate.getDate() + 1);

		const bBuyDate = new Date(baseDate);
		bBuyDate.setHours(0);
	
		const bSellDate = new Date(baseDate);
		bSellDate.setHours(2);
	
		const a = {
			buyDate: aBuyDate,
			sellDate: aSellDate
		};
		const b = {
			buyDate: bBuyDate,
			sellDate: bSellDate
		};
		// eslint-disable-next-line no-undef
		it(`Should not overlap - Buy-Sell A (${a.buyDate.toLocaleDateString()} ${a.buyDate.getHours()} - ${a.sellDate.getHours(0)}) and Buy-Sell B (${b.buyDate.toLocaleDateString()} ${b.buyDate.getHours()} - ${b.sellDate.getHours(0)}) `, () => {
			assert.strictEqual(Calculator.areBuySellsOverlapping(a, b), false);
		});
	}

	{
		const aBuyDate = new Date(baseDate);
		aBuyDate.setHours(0);
	
		const aSellDate = new Date(baseDate);
		aSellDate.setHours(4);
	
		const bBuyDate = new Date(baseDate);
		bBuyDate.setHours(4);
	
		const bSellDate = new Date(baseDate);
		bSellDate.setHours(7);
	
		const a = {
			buyDate: aBuyDate,
			sellDate: aSellDate
		};
		const b = {
			buyDate: bBuyDate,
			sellDate: bSellDate
		};
		// eslint-disable-next-line no-undef
		it(`Should overlap - Buy-Sell A (${a.buyDate.toLocaleDateString()} ${a.buyDate.getHours()} - ${a.sellDate.getHours(0)}) and Buy-Sell B (${b.buyDate.toLocaleDateString()} ${b.buyDate.getHours()} - ${b.sellDate.getHours(0)}) `, () => {
			assert.strictEqual(Calculator.areBuySellsOverlapping(a, b), true);
		});
	}

	{
		const aBuyDate = new Date(baseDate);
		aBuyDate.setHours(2);
	
		const aSellDate = new Date(baseDate);
		aSellDate.setHours(4);
	
		const bBuyDate = new Date(baseDate);
		bBuyDate.setHours(2);
	
		const bSellDate = new Date(baseDate);
		bSellDate.setHours(7);
	
		const a = {
			buyDate: aBuyDate,
			sellDate: aSellDate
		};
		const b = {
			buyDate: bBuyDate,
			sellDate: bSellDate
		};
		// eslint-disable-next-line no-undef
		it(`Should overlap - Buy-Sell A (${a.buyDate.toLocaleDateString()} ${a.buyDate.getHours()} - ${a.sellDate.getHours(0)}) and Buy-Sell B (${b.buyDate.toLocaleDateString()} ${b.buyDate.getHours()} - ${b.sellDate.getHours(0)}) `, () => {
			assert.strictEqual(Calculator.areBuySellsOverlapping(a, b), true);
		});
	}

	{
		const aBuyDate = new Date(baseDate);
		aBuyDate.setHours(1);
	
		const aSellDate = new Date(baseDate);
		aSellDate.setHours(8);
	
		const bBuyDate = new Date(baseDate);
		bBuyDate.setHours(2);
	
		const bSellDate = new Date(baseDate);
		bSellDate.setHours(7);
	
		const a = {
			buyDate: aBuyDate,
			sellDate: aSellDate
		};
		const b = {
			buyDate: bBuyDate,
			sellDate: bSellDate
		};
		// eslint-disable-next-line no-undef
		it(`Should overlap - Buy-Sell A (${a.buyDate.toLocaleDateString()} ${a.buyDate.getHours()} - ${a.sellDate.getHours(0)}) and Buy-Sell B (${b.buyDate.toLocaleDateString()} ${b.buyDate.getHours()} - ${b.sellDate.getHours(0)}) `, () => {
			assert.strictEqual(Calculator.areBuySellsOverlapping(a, b), true);
		});
	}

	

});


// eslint-disable-next-line no-undef
it('#findAllCombinations', () => {
	{
		const aBuySell = {};

		const bBuySell = {};



	}


});