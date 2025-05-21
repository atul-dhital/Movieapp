import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator, FlatList, Image, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

import { images } from "@/constants/images";
import { icons } from "@/constants/icons";

import useFetch from "@/services/usefetch";
import { fetchMovies, fetchTrendingMovies } from "@/services/api";

import SearchBar from "@/components/SearchBar";
import MovieDisplayCard from "@/components/MovieCard";

const Search = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [trendingSearches, setTrendingSearches] = useState([
    "Avengers",
    "Inception",
    "The Dark Knight",
    "Interstellar",
    "Pulp Fiction"
  ]);

  const {
    data: movies = [],
    loading,
    error,
    refetch: loadMovies,
    reset,
  } = useFetch(() => fetchMovies({ query: searchQuery }), false);

  useEffect(() => {
    loadRecentSearches();
  }, []);

  const loadRecentSearches = async () => {
    try {
      const searches = await AsyncStorage.getItem('recentSearches');
      if (searches) {
        setRecentSearches(JSON.parse(searches));
      }
    } catch (error) {
      console.error('Error loading recent searches:', error);
    }
  };

  const handleSearch = async (text: string) => {
    setSearchQuery(text);
    if (text.trim()) {
      try {
        // Get existing searches
        const existingSearches = await AsyncStorage.getItem('recentSearches');
        let searches = existingSearches ? JSON.parse(existingSearches) : [];
        
        // Add new search to the beginning and remove duplicates
        searches = [text.trim(), ...searches.filter((s: string) => s !== text.trim())].slice(0, 5);
        
        // Save to AsyncStorage
        await AsyncStorage.setItem('recentSearches', JSON.stringify(searches));
        setRecentSearches(searches);
      } catch (error) {
        console.error('Error saving search:', error);
      }
    }
  };

  const handleSearchPress = async (query: string) => {
    setSearchQuery(query);
    try {
      // Get existing searches
      const existingSearches = await AsyncStorage.getItem('recentSearches');
      let searches = existingSearches ? JSON.parse(existingSearches) : [];
      
      // Add clicked search to the beginning and remove duplicates
      searches = [query, ...searches.filter((s: string) => s !== query)].slice(0, 5);
      
      // Save to AsyncStorage
      await AsyncStorage.setItem('recentSearches', JSON.stringify(searches));
      setRecentSearches(searches);
    } catch (error) {
      console.error('Error saving search:', error);
    }
  };

  const clearRecentSearches = async () => {
    try {
      await AsyncStorage.removeItem('recentSearches');
      setRecentSearches([]);
    } catch (error) {
      console.error('Error clearing recent searches:', error);
    }
  };

  const removeRecentSearch = async (searchToRemove: string) => {
    try {
      const updatedSearches = recentSearches.filter(s => s !== searchToRemove);
      await AsyncStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
      setRecentSearches(updatedSearches);
    } catch (error) {
      console.error('Error removing search:', error);
    }
  };

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (searchQuery.trim()) {
        await loadMovies();
      } else {
        reset();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const renderSearchSection = () => {
    if (searchQuery.trim()) return null;

    return (
      <View className="mt-5">
        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-white text-lg font-bold">Recent Searches</Text>
              <TouchableOpacity onPress={clearRecentSearches}>
                <Text className="text-accent">Clear All</Text>
              </TouchableOpacity>
            </View>
            <View className="flex-row flex-wrap">
              {recentSearches.map((search, index) => (
                <View key={index} className="flex-row items-center mr-2 mb-2">
                  <TouchableOpacity
                    onPress={() => handleSearchPress(search)}
                    className="bg-accent/20 px-4 py-2 rounded-full"
                  >
                    <Text className="text-accent">{search}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => removeRecentSearch(search)}
                    className="ml-2"
                  >
                    <Ionicons name="close-circle" size={20} color="#666" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Trending Searches */}
        <View className="mb-6">
          <Text className="text-white text-lg font-bold mb-3">Trending Searches</Text>
          <View className="flex-row flex-wrap">
            {trendingSearches.map((search, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleSearchPress(search)}
                className="bg-gray-800/50 px-4 py-2 rounded-full mr-2 mb-2"
              >
                <Text className="text-white">{search}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-primary">
      <Image
        source={images.bg}
        className="absolute w-full z-0"
        resizeMode="cover"
      />

      <View className="flex-row justify-between items-center px-5 pt-12 pb-4">
        <TouchableOpacity onPress={() => router.replace("/")}>
          <Image source={icons.logo} className="w-12 h-10" />
        </TouchableOpacity>
        <View className="flex-row gap-4">
          <TouchableOpacity onPress={() => router.replace("/search")}>
            <Image source={icons.search} className="w-6 h-6" tintColor="#A8B5DB" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.replace("/profile")}>
            <Image source={icons.person} className="w-6 h-6" tintColor="#A8B5DB" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ minHeight: "100%", paddingBottom: 10 }}
      >
        <View className="my-5">
          <SearchBar
            placeholder="Search for a movie"
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>

        {renderSearchSection()}

        {loading && (
          <ActivityIndicator
            size="large"
            color="#0000ff"
            className="my-3"
          />
        )}

        {error && (
          <View className="bg-red-500/20 p-4 rounded-lg my-3">
            <Text className="text-red-500 text-center">
              Error: {error.message}
            </Text>
          </View>
        )}

        {!loading &&
          !error &&
          searchQuery.trim() &&
          movies?.length! > 0 && (
            <Text className="text-xl text-white font-bold mb-4">
              Search Results for{" "}
              <Text className="text-accent">{searchQuery}</Text>
            </Text>
          )}

        {!loading && !error && movies?.length! > 0 && (
          <View className="flex-row flex-wrap justify-between">
            {movies.map((movie) => (
              <View key={movie.id} className="w-[31%] mb-4">
                <MovieDisplayCard {...movie} />
              </View>
            ))}
          </View>
        )}

        {!loading && !error && movies?.length === 0 && searchQuery.trim() && (
          <View className="items-center justify-center py-8">
            <Image source={icons.search} className="w-16 h-16 mb-4" tintColor="#666" />
            <Text className="text-center text-gray-500 text-lg">
              No movies found for "{searchQuery}"
            </Text>
            <Text className="text-center text-gray-400 mt-2">
              Try different keywords or check your spelling
            </Text>
          </View>
        )}

        {!loading && !error && !searchQuery.trim() && (
          <View className="items-center justify-center py-8">
            <Image source={icons.search} className="w-16 h-16 mb-4" tintColor="#666" />
            <Text className="text-center text-gray-500 text-lg">
              Start typing to search for movies
            </Text>
            <Text className="text-center text-gray-400 mt-2">
              Find your favorite movies and TV shows
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default Search;
