import { useEffect, useState } from "react";
import "../styles/interface.css";

function Interface() {
	const [messages, setMessages] = useState([]);
	const [filteredMessages, setFilteredMessages] = useState([]);
	const [ws, setWs] = useState(null);
	const [inputValue, setInputValue] = useState("");
	const [id, setId] = useState("");
	const [recipient, setRecipient] = useState("");
	const [users, setUsers] = useState([]);

	const filteredUsers = users.filter((user) => user !== id);

	useEffect(() => {
		const protocol = window.location.protocol === "https:" ? "wss:" : "ws:"; // run npm run dev --host to know the address to input on your other devices to connect
		const socket = new WebSocket(
			`${protocol}//${window.location.hostname}:8080`,
		);
		setWs(socket);

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
			} else if (data.type === "users") {
				setUsers(data.users);
			} else {
				setMessages((prevMessages) => [...prevMessages, data]);
			}
		};

		socket.onclose = () => {
			console.log("Disconnected from WebSocket server");
		};

		return () => socket.close();
	}, []);

	useEffect(() => {
		if (!id) return;

		const nextRecipient = users.find(
			(possibleRecipient) => possibleRecipient !== id,
		);

		setRecipient(nextRecipient);
	}, [id, users]);

	useEffect(() => {
		setFilteredMessages(
			messages.filter((message) =>
				message.to === "group"
					? recipient === "group"
					: (message.from === id && message.to === recipient) ||
						(message.from === recipient && message.to === id),
			),
		);
	}, [messages, recipient, id]);

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
					<div key={index} className={checkIfSender(text.from)}>
						<p className="message">
							<span>{text.from}: </span>
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
				<div className="buttons">
					<select value={recipient} onChange={handleDropdownChange}>
						{filteredUsers.map((user, index) => (
							<option value={user} key={index}>
								To {user} alone
							</option>
						))}
						<option value="group">To the group</option>
					</select>
					<button onClick={sendMessage}>Send</button>
				</div>
			</div>
		</div>
	);
}

export default Interface;
