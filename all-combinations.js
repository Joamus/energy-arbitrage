const list = ['a', 'b', 'c', 'd'];
const amountOfCombinations = 3;

const combinationList = [];


makeCandidates(combinationList, amountOfCombinations, '', list, 0);
console.log(combinationList);
console.log(combinationList.length);


function makeCandidates(combinationList, amountOfCombinations, combination, list, index) {
	let combinationCopy = combination;

	if (amountOfCombinations == 0) {
		return;
	}

	for (let i = index; i < list.length; i++) {
		let thisCombination = combinationCopy + list[i];
		combinationList.push(thisCombination);
		makeCandidates(combinationList, amountOfCombinations - 1, thisCombination, list, i + 1);
	}
}