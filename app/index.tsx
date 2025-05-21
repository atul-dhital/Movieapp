import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  Image,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";

import useFetch from "@/services/usefetch";
import { fetchMovies, fetchTrendingMovies } from "@/services/api";

import { icons } from "@/constants/icons";
import { images } from "@/constants/images";

import MovieCard from "@/components/MovieCard";
import TrendingCard from "@/components/TrendingCard";

const Index = () => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingMovies, setIsLoadingMovies] = useState(false);

  const {
    data: trendingMovies,
    loading: trendingLoading,
    error: trendingError,
  } = useFetch(fetchTrendingMovies);

  const fetchLatestMovies = async (page: number, append: boolean = false) => {
    try {
      setIsLoadingMovies(true);
      const response = await fetchMovies({ 
        query: "", 
        page: page,
        pageSize: 21 
      });
      setMovies(prevMovies => append ? [...prevMovies, ...response.results] : response.results);
      setTotalPages(response.total_pages);
    } catch (error) {
      console.error('Error fetching latest movies:', error);
    } finally {
      setIsLoadingMovies(false);
    }
  };

  useEffect(() => {
    fetchLatestMovies(1);
  }, []);

  const handleLoadMore = () => {
    if (currentPage < totalPages && !isLoadingMovies) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchLatestMovies(nextPage, true);
    }
  };

  return (
    <View className="flex-1 bg-primary">
      <Image
        source={images.bg}
        className="absolute w-full z-0"
        resizeMode="cover"
      />

      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ minHeight: "100%", paddingBottom: 10 }}
      >
        <View className="flex-row justify-between items-center mt-20 mb-5">
          <TouchableOpacity onPress={() => router.push("/")}>
            <Image source={icons.logo} className="w-12 h-10" />
          </TouchableOpacity>
          <View className="flex-row gap-4">
            <TouchableOpacity onPress={() => router.push("/search")}>
              <Image source={icons.search} className="w-6 h-6" tintColor="#A8B5DB" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push("/profile")}>
              <Image source={icons.person} className="w-6 h-6" tintColor="#A8B5DB" />
            </TouchableOpacity>
          </View>
        </View>

        {trendingLoading ? (
          <ActivityIndicator
            size="large"
            color="#0000ff"
            className="mt-10 self-center"
          />
        ) : trendingError ? (
          <Text className="text-red-500 text-center mt-10">
            Error: {trendingError?.message}
          </Text>
        ) : (
          <View className="flex-1 mt-5">
            {trendingMovies && trendingMovies.length > 0 && (
              <View className="mt-10">
                <Text className="text-lg text-white font-bold mb-3">
                  Trending Movies
                </Text>
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="mb-4 mt-3"
                  data={trendingMovies}
                  contentContainerStyle={{
                    gap: 26,
                  }}
                  renderItem={({ item, index }) => (
                    <TrendingCard movie={item} index={index} />
                  )}
                  keyExtractor={(item) => item.id.toString()}
                  ItemSeparatorComponent={() => <View className="w-4" />}
                />
              </View>
            )}

            <View>
              <Text className="text-lg text-white font-bold mt-5 mb-3">
                Latest Movies
              </Text>

              {isLoadingMovies && movies.length === 0 ? (
                <ActivityIndicator
                  size="large"
                  color="#0000ff"
                  className="my-10"
                />
              ) : (
                <>
                  {movies && movies.length > 0 && (
                    <FlatList
                      data={movies}
                      renderItem={({ item }) => <MovieCard {...item} />}
                      keyExtractor={(item) => item.id.toString()}
                      numColumns={3}
                      columnWrapperStyle={{
                        justifyContent: "flex-start",
                        gap: 20,
                        paddingRight: 5,
                        marginBottom: 10,
                      }}
                      className="mt-2"
                      scrollEnabled={false}
                      contentContainerStyle={{
                        paddingBottom: 20,
                      }}
                    />
                  )}

                  {currentPage < totalPages && (
                    <TouchableOpacity
                      onPress={handleLoadMore}
                      disabled={isLoadingMovies}
                      className={`py-3 px-6 rounded-lg self-center ${
                        isLoadingMovies ? 'bg-gray-600' : 'bg-accent'
                      }`}
                      style={{
                        marginTop: 10,
                        marginBottom: 30,
                      }}
                    >
                      {isLoadingMovies ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <Text className="text-white font-semibold text-center">
                          Load More Movies
                        </Text>
                      )}
                    </TouchableOpacity>
                  )}
                </>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default Index;
