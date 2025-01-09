import { useState, useEffect } from "react";

export const useMovies = (query) => {
	const [movies, setMovies] = useState([]);

	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	useEffect(
		function () {
			//callback?.();
			const controller = new AbortController();

			async function fetchMovies() {
				try {
					setIsLoading(true);
					setError(null);
					const res = await fetch(
						`https://www.omdbapi.com/?apikey=${
							import.meta.env.VITE_OMDB_KEY
						}&s=${query}`,
						{ signal: controller.signal },
					);
					if (!res.ok) throw new Error("something went wrong ");
					const data = await res.json();
					if (data.Response === "False") throw new Error("Movie not found");
					setMovies(data.Search);
				} catch (err) {
					console.error(err.message);
					if (err.name !== "AbortError") setError(err.message);
				} finally {
					setIsLoading(false);
				}
			}

			if (query.length < 3) {
				setMovies([]);
				setError("");
				return;
			}

			//handleCloseMovie();
			fetchMovies();

			return function () {
				controller.abort();
			};
		},
		[query],
	);
	return { movies, isLoading, error };
};
