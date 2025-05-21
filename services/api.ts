export const TMDB_CONFIG = {
  BASE_URL: "https://api.themoviedb.org/3",
  API_KEY: process.env.EXPO_PUBLIC_MOVIE_API_KEY,
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${process.env.EXPO_PUBLIC_MOVIE_API_KEY}`,
  },
};

export const fetchTrendingMovies = async (): Promise<Movie[]> => {
  const endpoint = `${TMDB_CONFIG.BASE_URL}/trending/movie/day`;

  const response = await fetch(endpoint, {
    method: "GET",
    headers: TMDB_CONFIG.headers,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch trending movies: ${response.statusText}`);
  }

  const data = await response.json();
  return data.results;
};

export const fetchMovies = async ({
  query,
  page = 1,
  pageSize = 21,
}: {
  query: string;
  page?: number;
  pageSize?: number;
}): Promise<{ results: Movie[]; total_pages: number }> => {
  // Calculate how many pages we need to fetch to get the desired number of movies
  const pagesToFetch = Math.ceil(pageSize / 20); // TMDB's default page size is 20
  const startPage = page;
  const endPage = startPage + pagesToFetch - 1;

  try {
    // Fetch all required pages in parallel
    const pagePromises = Array.from({ length: pagesToFetch }, (_, i) => {
      const pageNum = startPage + i;
      const endpoint = query
        ? `${TMDB_CONFIG.BASE_URL}/search/movie?query=${encodeURIComponent(query)}&page=${pageNum}`
        : `${TMDB_CONFIG.BASE_URL}/discover/movie?sort_by=popularity.desc&page=${pageNum}`;

      return fetch(endpoint, {
        method: "GET",
        headers: TMDB_CONFIG.headers,
      }).then(res => res.json());
    });

    const results = await Promise.all(pagePromises);
    
    // Combine all results and take only the requested number of movies
    const allMovies = results.flatMap(result => result.results);
    const totalPages = Math.ceil(results[0].total_pages / pagesToFetch);
    
    return {
      results: allMovies.slice(0, pageSize),
      total_pages: totalPages
    };
  } catch (error) {
    console.error('Error fetching movies:', error);
    throw error;
  }
};

export const fetchMovieDetails = async (
  movieId: string
): Promise<MovieDetails> => {
  try {
    const response = await fetch(
      `${TMDB_CONFIG.BASE_URL}/movie/${movieId}?api_key=${TMDB_CONFIG.API_KEY}`,
      {
        method: "GET",
        headers: TMDB_CONFIG.headers,
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch movie details: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching movie details:", error);
    throw error;
  }
};

export const fetchMovieTrailer = async (movieId: string): Promise<string | null> => {
  try {
    const response = await fetch(
      `${TMDB_CONFIG.BASE_URL}/movie/${movieId}/videos`,
      {
        method: "GET",
        headers: TMDB_CONFIG.headers,
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch movie trailer: ${response.statusText}`);
    }

    const data = await response.json();
    
    // First try to find an official trailer
    let trailer = data.results.find(
      (video: any) => video.type === "Trailer" && video.site === "YouTube" && video.official
    );

    // If no official trailer, try to find any trailer
    if (!trailer) {
      trailer = data.results.find(
        (video: any) => video.type === "Trailer" && video.site === "YouTube"
      );
    }

    // If still no trailer, try to find any YouTube video
    if (!trailer) {
      trailer = data.results.find(
        (video: any) => video.site === "YouTube"
      );
    }

    return trailer?.key || null;
  } catch (error) {
    console.error("Error fetching movie trailer:", error);
    throw error;
  }
};
