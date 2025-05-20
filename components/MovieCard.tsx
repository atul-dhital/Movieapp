import { Link } from "expo-router";
import { Text, Image, TouchableOpacity, View } from "react-native";
import { useState, useEffect } from "react";

import { icons } from "@/constants/icons";
import { saveMovie, unsaveMovie, getSavedMovies } from "@/services/appwrite";
import { Movie } from "@/types/movie";
import { useSnackbar } from "@/context/SnackbarContext";

const MovieCard = (movie: Movie) => {
  const [isSaved, setIsSaved] = useState(false);
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    checkIfSaved();
  }, [movie.id]);

  const checkIfSaved = async () => {
    try {
      const savedMovies = await getSavedMovies();
      setIsSaved(savedMovies.some((m) => m.id === movie.id));
    } catch (error) {
      console.error("Error checking saved status:", error);
    }
  };

  const handleSave = async (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (isSaved) {
        await unsaveMovie(movie.id);
        showSnackbar(`${movie.title} unsaved`, 'info');
      } else {
        await saveMovie(movie);
        showSnackbar(`${movie.title} saved`, 'success');
      }
      setIsSaved(!isSaved);
    } catch (error) {
      console.error("Error saving/unsaving movie:", error);
      showSnackbar('Error saving movie', 'error');
    }
  };

  return (
    <View className="w-[30%]">
      <Link href={`/movie/${movie.id}`} asChild>
        <TouchableOpacity>
          <Image
            source={{
              uri: movie.poster_path
                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                : "https://placehold.co/600x400/1a1a1a/FFFFFF.png",
            }}
            className="w-full h-52 rounded-lg"
            resizeMode="cover"
          />
        </TouchableOpacity>
      </Link>

      <View className="flex-row justify-between items-start mt-2">
        <Text className="text-sm font-bold text-white flex-1" numberOfLines={1}>
          {movie.title}
        </Text>
        <TouchableOpacity onPress={handleSave} className="ml-2">
          <Image
            source={icons.save}
            className="size-5"
            tintColor={isSaved ? "#FFD700" : "#fff"}
          />
        </TouchableOpacity>
      </View>

      <View className="flex-row items-center justify-start gap-x-1">
        <Image source={icons.star} className="size-4" />
        <Text className="text-xs text-white font-bold uppercase">
          {Math.round(movie.vote_average / 2)}
        </Text>
      </View>

      <View className="flex-row items-center justify-between">
        <Text className="text-xs text-light-300 font-medium mt-1">
          {movie.release_date?.split("-")[0]}
        </Text>
        <Text className="text-xs font-medium text-light-300 uppercase">
          Movie
        </Text>
      </View>
    </View>
  );
};

export default MovieCard;
