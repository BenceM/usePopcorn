import { useEffect, useState } from "react";
import StarRating from "./StarRating";

const average = (arr) =>
	arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0).toFixed(1);

function NavBar({ children }) {
	return <nav className="nav-bar">{children}</nav>;
}

function Search({ onChange, query }) {
	return (
		<input
			className="search"
			type="text"
			placeholder="Search movies..."
			value={query}
			onChange={(e) => onChange(e)}
		/>
	);
}

function Logo() {
	return (
		<div className="logo">
			<span role="img">🍿</span>
			<h1>usePopcorn</h1>
		</div>
	);
}

function Results({ movies }) {
	return (
		<p className="num-results">
			Found <strong>{movies?.length}</strong> results
		</p>
	);
}
function Main({ children }) {
	return <main className="main">{children}</main>;
}

function Box({ children }) {
	const [isOpen, setIsOpen] = useState(true);

	return (
		<div className="box">
			<button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
				{isOpen ? "–" : "+"}
			</button>
			{isOpen && children}
		</div>
	);
}

function MovieList({ movies, onSelectMovie }) {
	return (
		<ul className="list list-movies">
			{movies?.map((movie) => (
				<Movie movie={movie} key={movie.imdbID} onSelectMovie={onSelectMovie} />
			))}
		</ul>
	);
}
function Movie({ movie, onSelectMovie }) {
	return (
		<li onClick={() => onSelectMovie(movie.imdbID)}>
			<img src={movie.Poster} alt={`${movie.Title} poster`} />
			<h3>{movie.Title}</h3>
			<div>
				<p>
					<span>🗓</span>
					<span>{movie.Year}</span>
				</p>
			</div>
		</li>
	);
}

function SelectedMovie({ selectedId, onClearMovie, onAddWatched, watched }) {
	const [movie, setMovie] = useState({});
	const [isLoading, setIsLoading] = useState(false);
	const [userRating, setUserRating] = useState(0);
	const isWatched = watched.map((w) => w.imdbID).includes(selectedId);
	const watchedUserRating = watched.find(
		(movie) => movie.imdbID === selectedId,
	)?.userRating;
	const {
		Title: title,
		Year: year,
		Poster: poster,
		Runtime: runtime,
		imdbRating,
		Plot: plot,
		Released: released,
		Actors: actors,
		Director: director,
		Genre: genre,
	} = movie;
	useEffect(
		function () {
			async function getMovieDetails() {
				setIsLoading(true);

				const res = await fetch(
					`http://www.omdbapi.com/?apikey=${
						import.meta.env.VITE_OMDB_KEY
					}&i=${selectedId}`,
				);
				const data = await res.json();
				setIsLoading(false);
				setMovie(data);
			}
			getMovieDetails();
		},
		[selectedId],
	);
	useEffect(
		function () {
			if (!title) return;
			document.title = `Movie: ${title}`;

			return () => (document.title = "usePopcorn");
		},
		[title],
	);
	const handleAdd = () => {
		const newMovie = {
			imdbID: selectedId,
			title,
			year,
			poster,
			imdbRating: Number(imdbRating),
			runtime: Number(runtime.split(" ").at(0)),
			userRating,
		};
		onAddWatched(newMovie);
		onClearMovie();
	};
	useEffect(() => {
		function callback(e) {
			(e) => {
				if (e.key === "Escape") {
					onClearMovie();
				}
			};
		}
		document.addEventListener("keydown", callback);
		return () => document.removeEventListener("keydown", callback);
	}, [onClearMovie]);
	return (
		<div className="details">
			{isLoading ? (
				<Loader />
			) : (
				<>
					<header>
						<button className="btn-back" onClick={onClearMovie}>
							&larr;
						</button>
						<img src={poster} alt={`Poster of ${title} movie`} />
						<div className="details-overview">
							<h2>{title}</h2>
							<p>
								{released} &bull; {runtime}
							</p>
							<p>{genre}</p>
							<p>
								<span>⭐</span>
								{imdbRating} IMDB rating
							</p>
						</div>
					</header>
					<section>
						<div className="rating">
							{!isWatched ? (
								<>
									<StarRating
										maxRating={10}
										size={24}
										onSetRating={setUserRating}
									/>
									{userRating > 0 && (
										<button className="btn-add" onClick={handleAdd}>
											+ Add to list
										</button>
									)}
								</>
							) : (
								<p>
									You have already rated this movie {watchedUserRating}{" "}
									<span>⭐</span>
								</p>
							)}
						</div>
						<p>
							<em>{plot}</em>
						</p>
						<p>Starring {actors}</p>
						<p>Directed by {director}</p>
					</section>
				</>
			)}
		</div>
	);
}

function WatchedSummary({ watched }) {
	const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
	const avgUserRating = average(watched.map((movie) => movie.userRating));
	const avgRuntime = average(watched.map((movie) => movie.runtime));
	return (
		<div className="summary">
			<h2>Movies you watched</h2>
			<div>
				<p>
					<span>#️⃣</span>
					<span>{watched.length} movies</span>
				</p>
				<p>
					<span>⭐️</span>
					<span>{avgImdbRating}</span>
				</p>
				<p>
					<span>🌟</span>
					<span>{avgUserRating}</span>
				</p>
				<p>
					<span>⏳</span>
					<span>{avgRuntime} min</span>
				</p>
			</div>
		</div>
	);
}

function WatchedMoviesList({ watched, onDeleteWatched }) {
	return (
		<ul className="list">
			{watched.map((movie) => (
				<WatchedMovie
					movie={movie}
					key={movie.imdbID}
					onDeleteWatched={onDeleteWatched}
				/>
			))}
		</ul>
	);
}

function WatchedMovie({ movie, onDeleteWatched }) {
	return (
		<li>
			<img src={movie.poster} alt={`${movie.title} poster`} />
			<h3>{movie.title}</h3>
			<div>
				<p>
					<span>⭐️</span>
					<span>{movie.imdbRating}</span>
				</p>
				<p>
					<span>🌟</span>
					<span>{movie.userRating}</span>
				</p>
				<p>
					<span>⏳</span>
					<span>{movie.runtime} min</span>
				</p>
			</div>
			<button
				className="btn-delete"
				onClick={() => onDeleteWatched(movie.imdbID)}
			>
				X
			</button>
		</li>
	);
}

function Loader() {
	return <p className="loader">Loading...</p>;
}
function Error({ message }) {
	return <p className="error">{message}</p>;
}
export default function App() {
	const [movies, setMovies] = useState([]);
	const [watched, setWatched] = useState(
		() => JSON.parse(localStorage.getItem("watched")) || [],
	);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(null);
	const [selectedId, setSelectedId] = useState(null);
	const [query, setQuery] = useState("");

	function handleSelectMovie(id) {
		setSelectedId(id === selectedId ? null : id);
	}
	function handleClearMovie() {
		setSelectedId(null);
	}
	function handleAddWatched(movie) {
		setWatched((watched) => watched.find((mov) => [...watched, movie]));
	}
	function handleDeleteWatched(id) {
		setWatched((w) => w.filter((mov) => mov.imdbID !== id));
	}

	useEffect(
		function () {
			localStorage.setItem("watched", JSON.stringify(watched));
		},
		[watched],
	);

	useEffect(() => {
		const controller = new AbortController();
		async function fetchMovies() {
			try {
				setIsLoading(true);
				setError(null);
				const res = await fetch(
					`http://www.omdbapi.com/?apikey=${
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
		if (!query.length) {
			setMovies([]);
			setError("");
			return;
		}
		handleClearMovie();
		fetchMovies();
		return function () {
			controller.abort();
		};
	}, [query]);

	const onChange = (e) => {
		setQuery(e.target.value);
	};
	return (
		<>
			<NavBar>
				<Logo />
				<Search onChange={onChange} query={query} />
				<Results movies={movies} />
			</NavBar>
			<Main>
				<Box>
					{isLoading && <Loader />}
					{!isLoading && !error && (
						<MovieList movies={movies} onSelectMovie={handleSelectMovie} />
					)}
					{error && <Error message={error} />}
				</Box>
				<Box>
					{selectedId ? (
						<SelectedMovie
							onClearMovie={handleClearMovie}
							selectedId={selectedId}
							onAddWatched={handleAddWatched}
							watched={watched}
						/>
					) : (
						<>
							<WatchedSummary watched={watched} />
							<WatchedMoviesList
								watched={watched}
								onDeleteWatched={handleDeleteWatched}
							/>
						</>
					)}
				</Box>
			</Main>
		</>
	);
}
