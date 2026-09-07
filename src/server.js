import { WebSocketServer } from "ws";
const wss = new WebSocketServer({ host: "0.0.0.0", port: 8080 });

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

const clients = new Map();

wss.on("connection", function connection(ws) {
	console.log(`Client has connected!`);

	ws.on("message", (data) => {
		const parsed = JSON.parse(data.toString());
		console.log(parsed);

		if (parsed.type === "identify") {
			if (parsed.id === null) {
				count++;
				const newId = letters[count];
				console.log(`Assigned ${newId}`);
				ws.id = newId;
				clients(newId, ws);

				ws.send(
					JSON.stringify({
						type: "userid",
						id: newId,
					}),
				);
			} else {
				const clientId = parsed.id;
				clients.set(clientId, ws);

				ws.send(
					JSON.stringify({
						type: "userid",
						id: clientId,
					}),
				);

				ws.id = clientId;
				console.log(`Client ${clientId} identified`);
			}
			return;
		} else if (parsed.type === "message") {
			const sender = clients.get(parsed.from);
			const recipient = clients.get(parsed.to);

			if (recipient == "B") {
				sender.send(
					JSON.stringify({
						from: ws.id,
						to: parsed.to,
						message: parsed.message,
					}),
				);
				recipient.send(
					JSON.stringify({
						id: ws.id,
						to: parsed.to,
						message: parsed.message,
					}),
				);
			} else if (recipient == "group") {
				wss.clients.forEach(function each(client) {
					if (client.readyState === WebSocket.OPEN) {
						client.send(
							JSON.stringify({
								id: ws.id,
								to: parsed.to,
								message: parsed.message,
							}),
						);
					}
				});
			}
		}
	});

	ws.on("error", (error) => {
		console.log(`Client ${ws.id} error:`, error);
	});

	ws.on("close", () => {
		clients.delete(ws.id);
		console.log(`Client ${ws.id} disconnected`);
	});
});

console.log("WebSocket server running on ws://localhost:8080");
