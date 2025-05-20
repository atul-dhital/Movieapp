import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Modal,
  Dimensions,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { WebView } from "react-native-webview";
import { Movie } from "@/types/movie";

import { icons } from "@/constants/icons";
import useFetch from "@/services/usefetch";
import { fetchMovieDetails, fetchMovieTrailer } from "@/services/api";
import { saveMovie, unsaveMovie, getSavedMovies } from "@/services/appwrite";
import { useSnackbar } from "@/context/SnackbarContext";

const { width, height } = Dimensions.get("window");

interface MovieDetails extends Movie {
  runtime: number;
  genres: Array<{ id: number; name: string }>;
}

interface MovieInfoProps {
  label: string;
  value?: string | number | null;
}

const MovieInfo = ({ label, value }: MovieInfoProps) => (
  <View className="flex-col items-start justify-center mt-5">
    <Text className="text-light-200 font-normal text-sm">{label}</Text>
    <Text className="text-light-100 font-bold text-sm mt-2">
      {value || "N/A"}
    </Text>
  </View>
);

const MovieDetailsScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [loadingTrailer, setLoadingTrailer] = useState(false);
  const { showSnackbar } = useSnackbar();

  const {
    data: movieDetails,
    loading: fetchLoading,
    error: fetchError,
  } = useFetch(() => fetchMovieDetails(id as string));

  useEffect(() => {
    loadMovieDetails();
  }, [id]);

  const loadMovieDetails = async () => {
    try {
      setLoading(true);
      const details = await fetchMovieDetails(id as string);
      setMovie(details as unknown as MovieDetails);
      setError(null);

      // Check if movie is saved
      const savedMovies = await getSavedMovies();
      setIsSaved(savedMovies.some((m) => m.id === details.id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load movie details";
      setError(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (!movie) return;

      if (isSaved) {
        await unsaveMovie(movie.id);
        showSnackbar("Movie unsaved", "info");
      } else {
        const movieToSave: Movie = {
          id: movie.id,
          title: movie.title,
          overview: movie.overview,
          poster_path: movie.poster_path,
          backdrop_path: movie.backdrop_path,
          release_date: movie.release_date,
          vote_average: movie.vote_average,
          vote_count: movie.vote_count,
          adult: movie.adult,
          genre_ids: movie.genres.map((g) => g.id),
          original_language: movie.original_language,
          original_title: movie.original_title,
          popularity: movie.popularity,
          video: movie.video,
        };
        await saveMovie(movieToSave);
        showSnackbar("Movie saved", "success");
      }
      setIsSaved(!isSaved);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to save movie";
      console.error(err);
      showSnackbar(errorMessage, "error");
    }
  };

  const fetchTrailer = async () => {
    try {
      setLoadingTrailer(true);
      const key = await fetchMovieTrailer(id as string);
      
      if (key) {
        setTrailerKey(key);
        setShowTrailer(true);
      } else {
        showSnackbar("No trailer available for this movie", "info");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load trailer";
      console.error(err);
      showSnackbar(errorMessage, "error");
    } finally {
      setLoadingTrailer(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-primary">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error || !movie) {
    return (
      <View className="flex-1 justify-center items-center bg-primary">
        <Text className="text-red-500">{error || "Movie not found"}</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-primary">
      <ScrollView className="flex-1">
        {/* Movie Poster */}
        <View className="relative">
          <Image
            source={{
              uri: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
            }}
            className="w-full h-96"
            resizeMode="cover"
          />
          {/* Back Button */}
          <TouchableOpacity 
            onPress={() => router.back()}
            className="absolute top-12 left-5 bg-black/50 p-2 rounded-full"
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View className="px-5 py-6">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-white text-2xl font-bold flex-1 mr-4">
              {movie.title}
            </Text>
            <TouchableOpacity onPress={handleSave}>
              <Ionicons
                name={isSaved ? "bookmark" : "bookmark-outline"}
                size={24}
                color={isSaved ? "#3b82f6" : "white"}
              />
            </TouchableOpacity>
          </View>
          <Text className="text-gray-400 mb-4">
            {new Date(movie.release_date).getFullYear()} •{" "}
            {movie.runtime} min
          </Text>

          <TouchableOpacity
            onPress={fetchTrailer}
            disabled={loadingTrailer}
            className="flex-row items-center justify-center bg-accent py-3 rounded-lg mb-6"
          >
            {loadingTrailer ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Ionicons name="play" size={24} color="white" />
                <Text className="text-white text-lg font-semibold ml-2">
                  Play Trailer
                </Text>
              </>
            )}
          </TouchableOpacity>

          <Text className="text-white text-lg font-semibold mb-2">
            Overview
          </Text>
          <Text className="text-gray-300 leading-6">{movie.overview}</Text>

          <View className="mt-6">
            <Text className="text-white text-lg font-semibold mb-2">
              Details
            </Text>
            <View className="space-y-2">
              <Text className="text-gray-300">
                <Text className="text-gray-400">Genre: </Text>
                {movie.genres.map((g: any) => g.name).join(", ")}
              </Text>
              <Text className="text-gray-300">
                <Text className="text-gray-400">Language: </Text>
                {movie.original_language.toUpperCase()}
              </Text>
              <Text className="text-gray-300">
                <Text className="text-gray-400">Rating: </Text>
                {movie.vote_average.toFixed(1)}/10
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={showTrailer}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowTrailer(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.9)', height: height }}>
          <View className="flex-1 justify-center items-center">
            <View style={{ width: width * 0.9, aspectRatio: 1, borderRadius: 12, overflow: 'hidden' }}>
              <TouchableOpacity
                onPress={() => setShowTrailer(false)}
                className="absolute top-4 right-4 z-10 bg-black/50 p-2 rounded-full"
                style={{ elevation: 5 }}
              >
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
              {trailerKey && (
                <>
                  <View className="absolute inset-0 justify-center items-center bg-black/30">
                    <ActivityIndicator size="large" color="white" />
                  </View>
                  <WebView
                    source={{
                      uri: `https://www.youtube.com/embed/${trailerKey}?autoplay=1&modestbranding=1&rel=0&showinfo=0&controls=1&playsinline=1`,
                    }}
                    style={{ flex: 1 }}
                    allowsFullscreenVideo
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    onLoadStart={() => setLoadingTrailer(true)}
                    onLoadEnd={() => setLoadingTrailer(false)}
                  />
                </>
              )}
            </View>
            <Text className="text-white/70 text-sm mt-4">
              Tap outside to close
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default MovieDetailsScreen;
