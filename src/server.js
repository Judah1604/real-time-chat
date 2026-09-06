import { WebSocketServer } from "ws";
const wss = new WebSocketServer({ port: 8080 });

const letters = [
	"0",
	"A",
	"B",
	"C",
	"D",
	"E",
	"F",
	"G",
	"H",
	"I",
	"J",
	"K",
	"L",
	"M",
	"N",
	"O",
	"P",
	"Q",
	"R",
	"S",
	"T",
	"U",
	"V",
	"W",
	"X",
	"Y",
	"Z",
];

let count = 0;

wss.on("connection", function connection(ws) {
	count++;
	const id = letters[count];
	console.log(`Client ${id} has connected!`);

	ws.send("userid" + id);

	ws.on("message", (data) => {
		wss.clients.forEach(function each(client) {
			// if (client !== ws && client.readyState === WebSocket.OPEN) {
			if (client.readyState === WebSocket.OPEN) {
				const message = data.toString();
				client.send(JSON.stringify({ id: id, message: message }));
			}
		});
	});

	ws.on("close", () => {
		console.log("Client disconnected");
	});
});

console.log("WebSocket server running on ws://localhost:8080");
