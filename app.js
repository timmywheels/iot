const accessToken = "649b7d6e28503d8beb5db37f9a7147d3";

const fahrenheitApiUrl = `https://us.wio.seeed.io/v1/node/GroveTempHumD0/temperature_f?access_token=${accessToken}`;
const celsiusApiUrl = `https://us.wio.seeed.io/v1/node/GroveTempHumD0/temperature?access_token=${accessToken}`;

const buttonStatusApiUrl = `https://us.wio.seeed.io/v1/node/GroveButtonD1/pressed?access_token=${accessToken}`;



// const ledColorAndCountApiUrl = `https://us.wio.seeed.io/v1/node/GroveLedWs2812D2/clear/${totalLedCount}/${rgbHexString}?access_token=${accessToken}`;
const ledForm = document.getElementById('ledForm');

ledForm.addEventListener('submit', (e) => {
	e.preventDefault();
});

const setLedCountAndColor = (_totalLedCount, _rgbHexString) => {



	let totalLedCount = parseInt(_totalLedCount);

	console.log("totalLedCount:", totalLedCount);

	let rgbHexString = _rgbHexString;

	console.log("rgbHexString:", rgbHexString);

	const ledColorAndCountApiUrl = `https://us.wio.seeed.io/v1/node/GroveLedWs2812D2/clear/${totalLedCount}/${rgbHexString}?access_token=${accessToken}`;

	const xhr = new XMLHttpRequest();

	xhr.open("POST", ledColorAndCountApiUrl, true);

	xhr.onload = function() {
		
		const data = JSON.parse(this.response);

		console.log(data);
	}

	xhr.send();

}

const checkButtonStatus = () => {

	const xhr = new XMLHttpRequest();

	xhr.open("GET", buttonStatusApiUrl, true);

	xhr.onload = function() {
		const data = JSON.parse(this.response);

		let buttonIsPressed = data.pressed == '1' ? true : false;

		if (buttonIsPressed) {
			alert("Button pressed")
		} else {
			alert("Button not pressed")
		}
	}

	xhr.send();
}

let temperatureApiUrl;
let currentTempDiv = document.getElementById('currentTemp');

var ws = new WebSocket('wss://us.wio.seeed.io/v1/node/event');

ws.onopen = () => {
	ws.send("649b7d6e28503d8beb5db37f9a7147d3");
};

ws.onmessage = (event) => {
	displayData(event);

}

const displayData = (event) => {
	let dataList = document.getElementById('dataList');
	let li = document.createElement('li');
	li.innerText = event.data;
	dataList.appendChild(li);
	getTemperature("f");
}


const getTemperature = (scale) => {

	if (scale.toLowerCase() == "f") {
		temperatureApiUrl = fahrenheitApiUrl;
	}
	if (scale.toLowerCase() == "c") {
		temperatureApiUrl = celsiusApiUrl;
	}

	const xhr = new XMLHttpRequest();

	xhr.open("GET", temperatureApiUrl, true);

	xhr.onload = function() {
		const data = JSON.parse(this.response);

		console.log(data);
		console.log(data.fahrenheit_degree);
		let tempScale = scale == "f" ? data.fahrenheit_degree : data.celsius_degree;
		currentTempDiv.innerText = tempScale + '°';
	}

	xhr.send();

}