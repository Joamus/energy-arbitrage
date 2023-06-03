module.exports = {
	'env': {
		'browser': false,
		'node': true,
		'es2021': true
	},
	'extends': 'eslint:recommended',
	'parserOptions': {
		'ecmaVersion': 2021,
		'sourceType': 'module'
	},
	'rules': {
		'indent': [
			'error',
			'tab',
			{ 'SwitchCase': 1 }
		],
		'linebreak-style': [
			'error',
			'unix'
		],
		'quotes': [
			'error',
			'single'
		],
		'semi': [
			'error',
			'always'
		],
		'no-var': [
			'error'
		],
		'no-undef': [
			'error'
		]
	}
};