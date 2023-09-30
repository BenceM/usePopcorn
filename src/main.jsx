import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import StarRating from "./StarRating";

function Test() {
	const [rating, setRating] = useState(0);
	return <StarRating onSetRating={setRating} />;
}

ReactDOM.createRoot(document.getElementById("root")).render(
	<React.StrictMode>
		<App />
		{/* <StarRating maxRating={10} />
		<StarRating className="test" /> */}
	</React.StrictMode>,
);
