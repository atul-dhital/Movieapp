import AsyncStorage from '@react-native-async-storage/async-storage';
import { Movie } from '@/types/movie';

const STORAGE_KEYS = {
  SAVED_MOVIES: 'saved_movies',
  WATCHED_MOVIES: 'watched_movies',
  USER_LISTS: 'user_lists',
  USER_PROFILE: 'user_profile',
};

export const saveMovie = async (movie: Movie) => {
  try {
    const savedMovies = await getSavedMovies();
    if (!savedMovies.some(m => m.id === movie.id)) {
      savedMovies.push(movie);
      await AsyncStorage.setItem(STORAGE_KEYS.SAVED_MOVIES, JSON.stringify(savedMovies));
    }
  } catch (error) {
    console.error("Error saving movie:", error);
    throw error;
  }
};

export const unsaveMovie = async (movieId: number) => {
  try {
    const savedMovies = await getSavedMovies();
    const updatedMovies = savedMovies.filter(movie => movie.id !== movieId);
    await AsyncStorage.setItem(STORAGE_KEYS.SAVED_MOVIES, JSON.stringify(updatedMovies));
  } catch (error) {
    console.error("Error unsaving movie:", error);
    throw error;
  }
};

export const getSavedMovies = async (): Promise<Movie[]> => {
  try {
    const savedMovies = await AsyncStorage.getItem(STORAGE_KEYS.SAVED_MOVIES);
    return savedMovies ? JSON.parse(savedMovies) : [];
  } catch (error) {
    console.error("Error getting saved movies:", error);
    return [];
  }
};

export const addToWatched = async (movie: Movie) => {
  try {
    const watchedMovies = await getWatchedMovies();
    if (!watchedMovies.some(m => m.id === movie.id)) {
      watchedMovies.push(movie);
      await AsyncStorage.setItem(STORAGE_KEYS.WATCHED_MOVIES, JSON.stringify(watchedMovies));
    }
  } catch (error) {
    console.error("Error adding to watched:", error);
    throw error;
  }
};

export const getWatchedMovies = async (): Promise<Movie[]> => {
  try {
    const watchedMovies = await AsyncStorage.getItem(STORAGE_KEYS.WATCHED_MOVIES);
    return watchedMovies ? JSON.parse(watchedMovies) : [];
  } catch (error) {
    console.error("Error getting watched movies:", error);
    return [];
  }
};

export const createList = async (name: string, movies: Movie[] = []) => {
  try {
    const lists = await getLists();
    const newList = {
      id: Date.now().toString(),
      name,
      movies,
      createdAt: new Date().toISOString(),
    };
    lists.push(newList);
    await AsyncStorage.setItem(STORAGE_KEYS.USER_LISTS, JSON.stringify(lists));
    return newList;
  } catch (error) {
    console.error("Error creating list:", error);
    throw error;
  }
};

export const getLists = async () => {
  try {
    const lists = await AsyncStorage.getItem(STORAGE_KEYS.USER_LISTS);
    return lists ? JSON.parse(lists) : [];
  } catch (error) {
    console.error("Error getting lists:", error);
    return [];
  }
};

export const updateUserProfile = async (profile: any) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

export const getUserProfile = async () => {
  try {
    const profile = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    return profile ? JSON.parse(profile) : null;
  } catch (error) {
    console.error("Error getting user profile:", error);
    return null;
  }
};
