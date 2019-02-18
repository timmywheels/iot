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
}