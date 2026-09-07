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
	// console.log(clients);

	ws.on("message", (data) => {
		const parsed = JSON.parse(data.toString());

		console.log("RECEIVED:", parsed);

		if (parsed.type === "identify") {
			if (parsed.id === null) {
				count++;
				const newId = letters[count];
				console.log(`Assigned ${newId}`);
				ws.id = newId;
				clients.set(newId, ws);

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
			wss.clients.forEach((client) => {
				if (client.readyState === 1) {
					client.send(
						JSON.stringify({
							type: "users",
							users: [...clients.keys()],
						}),
					);
				}
			});
			return;
		} else if (parsed.type === "message") {
			const recipient = clients.get(parsed.to);

			if (parsed.to !== "group") {
				const message = JSON.stringify({
					from: ws.id,
					to: parsed.to,
					message: parsed.message,
				});
				ws.send(message);
				recipient.send(message);
			} else if (parsed.to == "group") {
				wss.clients.forEach(function each(client) {
					if (client.readyState === 1) {
						client.send(
							JSON.stringify({
								from: ws.id,
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
		wss.clients.forEach((client) => {
			if (client.readyState === 1) {
				client.send(
					JSON.stringify({
						type: "users",
						users: [...clients.keys()],
					}),
				);
			}
		});
		console.log(`Client ${ws.id} disconnected`);
	});
});

console.log("WebSocket server running on ws://localhost:8080");
