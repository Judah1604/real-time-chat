import { useEffect, useState } from "react";
import "../styles/interface.css";

function Interface() {
	const [messages, setMessages] = useState([]);
	const [filteredMessages, setFilteredMessages] = useState([]);
	const [ws, setWs] = useState(null);
	const [inputValue, setInputValue] = useState("");
	const [id, setId] = useState("");
	const [recipient, setRecipient] = useState("B");

	useEffect(() => {
		const socket = new WebSocket("ws://192.168.154.148:8080");
		setWs(socket);

		setFilteredMessages(
			messages.filter(
				(message) =>
					(message.from === id && message.to === recipient) ||
					(message.from === recipient && message.to === id),
			),
		);

		socket.onopen = () => {
			const savedId = sessionStorage.getItem("id");

			socket.send(
				JSON.stringify({
					type: "identify",
					id: savedId,
				}),
			);
			console.log("Connected to WebSocket server");
		};

		socket.onmessage = (event) => {
			const data = JSON.parse(event.data);
			if (data.type === "userid") {
				sessionStorage.setItem("id", data.id);
				setId(data.id);
				console.log("ID is: " + data.id);
			} else {
				const id = data.id;
				const message = data.message;
				console.log(id, message);

				setMessages((prevMessages) => [...prevMessages, data]);
			}
		};

		socket.onclose = () => {
			console.log("Disconnected from WebSocket server");
		};

		return () => socket.close();
	}, []);

	function handleDropdownChange(event) {
		setRecipient(event.target.value);
	}

	function sendMessage() {
		if (!inputValue.trim()) return;

		if (ws && ws.readyState == WebSocket.OPEN) {
			ws.send(
				JSON.stringify({
					type: "message",
					from: id,
					to: recipient,
					message: inputValue,
				}),
			);
			setInputValue("");
		}
	}

	function checkIfSender(textID) {
		// console.log(textID);
		if (textID == id) {
			return "message-wrap sender";
		} else {
			return "message-wrap receiver";
		}
	}

	return (
		<div className="interface">
			<h1>Chat Interface</h1>
			<p>Welcome to the server</p>
			<p>Your ID is {id == "" ? "undefined" : id}</p>
			<div className="messages">
				{filteredMessages.map((text, index) => (
					<div key={index} className={checkIfSender(text.id)}>
						<p className="message">
							<span>{text.id}: </span>
							{text.message}
						</p>
					</div>
				))}
			</div>
			<div className="form">
				<input
					type="text"
					value={inputValue}
					onChange={(e) => setInputValue(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							sendMessage();
						}
					}}
				/>
				<select value={recipient} onChange={handleDropdownChange}>
					<option value="B">To B alone</option>
					<option value="group">To the group</option>
				</select>
				<button onClick={sendMessage}>Send</button>
			</div>
		</div>
	);
}

export default Interface;
