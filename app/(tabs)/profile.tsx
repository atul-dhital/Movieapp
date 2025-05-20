import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Switch,
  Linking,
  TextInput,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { useTheme } from "@/context/ThemeContext";
import { useUser } from "@/context/UserContext";
import { Movie } from "@/types/movie";
import {
  getSavedMovies,
  getWatchedMovies,
  getLists,
  getUserProfile,
  updateUserProfile,
} from "@/services/appwrite";
import MovieCard from "@/components/MovieCard";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

const Profile = () => {
  const { theme, toggleTheme, isDark } = useTheme();
  const { user, updatePreferences, updateUser } = useUser();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [savedCount, setSavedCount] = useState(0);
  const [watchedCount, setWatchedCount] = useState(0);
  const [listsCount, setListsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAbout, setShowAbout] = useState(false);
  const [showAccountSettings, setShowAccountSettings] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const version = Constants.expoConfig?.version || "1.0.0";
  const router = useRouter();
  const [showSavedMovies, setShowSavedMovies] = useState(false);
  const [savedMovies, setSavedMovies] = useState<Movie[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      const loadData = async () => {
        setLoading(true);
        try {
          await loadUserData();
        } catch (error) {
          console.error("Error loading data:", error);
        } finally {
          setLoading(false);
        }
      };

      loadData();
    }, [])
  );

  // Reset states when tab is focused
  useFocusEffect(
    React.useCallback(() => {
      setShowAbout(false);
      setShowAccountSettings(false);
      setShowSavedMovies(false);
      setIsEditing(false);
    }, [])
  );

  const loadUserData = async () => {
    try {
      const [saved, watched, lists, profile] = await Promise.all([
        getSavedMovies(),
        getWatchedMovies(),
        getLists(),
        getUserProfile(),
      ]);

      setSavedCount(saved.length);
      setSavedMovies(saved);
      setWatchedCount(watched.length);
      setListsCount(lists.length);
      if (profile?.image) {
        setProfileImage(profile.image);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      throw error; // Re-throw to handle in the calling function
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setProfileImage(base64Image);
      await updateUserProfile({ image: base64Image });
    }
  };

  const features = [
    {
      icon: "search",
      title: "Movie Search",
      description: "Search for any movie with instant results and detailed information",
    },
    {
      icon: "bookmark",
      title: "Save Movies",
      description: "Keep track of your favorite movies and create custom lists",
    },
    {
      icon: "play",
      title: "Watch Trailers",
      description: "Watch official trailers and teasers directly in the app",
    },
    {
      icon: "list",
      title: "Custom Lists",
      description: "Create and organize your movie collections",
    },
    {
      icon: "moon",
      title: "Dark Mode",
      description: "Switch between light and dark themes for comfortable viewing",
    },
  ];

  const techStack = [
    "React Native",
    "Expo",
    "TypeScript",
    "TMDb API",
    "AsyncStorage",
    "TailwindCSS",
    "React Navigation",
  ];

  const appDetails = {
    name: "Movie App",
    tagline: "Your Ultimate Movie Companion",
    description: "Movie App is a modern mobile application that helps you discover and track your favorite movies. Built with React Native and powered by The Movie Database (TMDb) API, this app provides a seamless experience for movie enthusiasts. Whether you're looking for the latest releases or classic films, Movie App has got you covered.",
    colors: {
      primary: "#030014",
      secondary: "#151312",
      accent: "#AB8BFF",
      light: {
        100: "#D6C7FF",
        200: "#A8B5DB",
        300: "#9CA4AB",
      },
      dark: {
        100: "#221F3D",
        200: "#0F0D23",
      },
    },
    features: features,
    techStack: techStack,
    version: version,
    contact: {
      email: "support@movieapp.com",
      website: "https://www.movieapp.com",
    
    },
    social: {
      twitter: "@movieapp",
      instagram: "@movieapp",
    },
    copyright: "© 2024 Movie App. All rights reserved.",
  };

  const handleSave = async () => {
    try {
      if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
        Alert.alert("Error", "New passwords do not match");
        return;
      }

      const updatedProfile = {
        name: formData.name,
        email: formData.email,
      };

      // Update profile in backend
      await updateUserProfile(updatedProfile);

      // Update local user state
      updateUser({
        ...user,
        name: formData.name,
        email: formData.email,
      });

      setIsEditing(false);
      Alert.alert("Success", "Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile. Please try again.");
    }
  };

  const handlePasswordChange = async () => {
    try {
      if (!formData.currentPassword || !formData.newPassword) {
        Alert.alert("Error", "Please fill in all password fields");
        return;
      }

      if (formData.newPassword !== formData.confirmPassword) {
        Alert.alert("Error", "New passwords do not match");
        return;
      }

      // Here you would typically call your password update API
      // await updatePassword(formData.currentPassword, formData.newPassword);

      Alert.alert("Success", "Password changed successfully");
      
      // Reset password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    } catch (error) {
      console.error("Error changing password:", error);
      Alert.alert("Error", "Failed to change password. Please try again.");
    }
  };

  const accountSettingsSections = [
    {
      title: "Personal Information",
      items: [
        {
          title: "Name",
          value: isEditing ? (
            <TextInput
              value={formData.name}
              onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
              className={`flex-1 ${isDark ? 'text-white' : 'text-black'}`}
              placeholder="Enter your name"
              placeholderTextColor={isDark ? "#666" : "#999"}
            />
          ) : (
            <Text className={isDark ? 'text-white' : 'text-black'}>{user.name}</Text>
          ),
        },
        {
          title: "Email",
          value: isEditing ? (
            <TextInput
              value={formData.email}
              onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
              className={`flex-1 ${isDark ? 'text-white' : 'text-black'}`}
              placeholder="Enter your email"
              placeholderTextColor={isDark ? "#666" : "#999"}
              keyboardType="email-address"
            />
          ) : (
            <Text className={isDark ? 'text-white' : 'text-black'}>{user.email}</Text>
          ),
        },
      ],
    },
    {
      title: "Security",
      items: [
        {
          title: "Change Password",
          value: isEditing ? (
            <View className="space-y-4">
              <TextInput
                value={formData.currentPassword}
                onChangeText={(text) => setFormData(prev => ({ ...prev, currentPassword: text }))}
                className={`p-2 rounded-lg ${isDark ? 'bg-gray-800 text-white' : 'bg-gray-100 text-black'}`}
                placeholder="Current Password"
                placeholderTextColor={isDark ? "#666" : "#999"}
                secureTextEntry
              />
              <TextInput
                value={formData.newPassword}
                onChangeText={(text) => setFormData(prev => ({ ...prev, newPassword: text }))}
                className={`p-2 rounded-lg ${isDark ? 'bg-gray-800 text-white' : 'bg-gray-100 text-black'}`}
                placeholder="New Password"
                placeholderTextColor={isDark ? "#666" : "#999"}
                secureTextEntry
              />
              <TextInput
                value={formData.confirmPassword}
                onChangeText={(text) => setFormData(prev => ({ ...prev, confirmPassword: text }))}
                className={`p-2 rounded-lg ${isDark ? 'bg-gray-800 text-white' : 'bg-gray-100 text-black'}`}
                placeholder="Confirm New Password"
                placeholderTextColor={isDark ? "#666" : "#999"}
                secureTextEntry
              />
              <TouchableOpacity
                onPress={handlePasswordChange}
                className="bg-blue-500 p-2 rounded-lg"
              >
                <Text className="text-white text-center">Update Password</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => setIsEditing(true)}
              className="bg-blue-500 px-4 py-2 rounded-lg"
            >
              <Text className="text-white">Change</Text>
            </TouchableOpacity>
          ),
        },
        {
          title: "Two-Factor Authentication",
          value: (
            <Switch
              value={false}
              onValueChange={() => Alert.alert("Coming Soon", "This feature will be available soon")}
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={false ? "#f5dd4b" : "#f4f3f4"}
            />
          ),
        },
      ],
    },
    {
      title: "Privacy",
      items: [
        {
          title: "Profile Visibility",
          value: (
            <View className="flex-row items-center space-x-2">
              <Text className={isDark ? 'text-white' : 'text-black'}>Public</Text>
              <Switch
                value={true}
                onValueChange={() => {}}
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor={true ? "#f5dd4b" : "#f4f3f4"}
              />
              <Text className={isDark ? 'text-white' : 'text-black'}>Private</Text>
            </View>
          ),
        },
      ],
    },
  ];

  const menuItems = [
    {
      title: "Account Settings",
      icon: icons.settings || icons.person,
      onPress: () => setShowAccountSettings(true),
    },
    {
      title: "Notifications",
      icon: icons.notification || icons.star,
      onPress: () => console.log("Notifications"),
      rightElement: (
        <Switch
          value={user.preferences.notifications}
          onValueChange={(value: boolean) => updatePreferences({ notifications: value })}
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={user.preferences.notifications ? "#f5dd4b" : "#f4f3f4"}
        />
      ),
    },
    {
      title: "Email Updates",
      icon: icons.save,
      onPress: () => console.log("Email Updates"),
      rightElement: (
        <Switch
          value={user.preferences.emailUpdates}
          onValueChange={(value: boolean) => updatePreferences({ emailUpdates: value })}
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={user.preferences.emailUpdates ? "#f5dd4b" : "#f4f3f4"}
        />
      ),
    },
    {
      title: "Theme",
      icon: icons.home,
      onPress: () => {},
      rightElement: (
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={toggleTheme}
            className={`px-2 py-1 rounded-md ${
              isDark ? 'bg-blue-500' : 'bg-gray-700'
            }`}
          >
            <Text className="text-white">{isDark ? 'Dark' : 'Light'}</Text>
          </TouchableOpacity>
        </View>
      ),
    },
    {
      title: "Language",
      icon: icons.info,
      onPress: () => console.log("Language"),
      rightElement: (
        <Text className="text-gray-400">{user.preferences.language.toUpperCase()}</Text>
      ),
    },
    {
      title: "Help & Support",
      icon: icons.help || icons.play,
      onPress: () => console.log("Help & Support"),
    },
    {
      title: "About",
      icon: icons.info || icons.home,
      onPress: () => setShowAbout(true),
    },
  ];

  if (loading) {
    return (
      <View className="flex-1 bg-primary items-center justify-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (showAccountSettings) {
    return (
      <SafeAreaView className="flex-1 bg-primary">
        <ScrollView className="flex-1 px-5 pb-24">
          {/* Header */}
          <View className="flex-row items-center mt-4 mb-4">
            <TouchableOpacity
              onPress={() => setShowAccountSettings(false)}
              className="absolute left-0 z-10"
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-2xl font-bold flex-1 text-center">
              Account Settings
            </Text>
            {isEditing ? (
              <TouchableOpacity onPress={handleSave} className="absolute right-0 z-10">
                <Text className="text-blue-500">Save</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => setIsEditing(true)} className="absolute right-0 z-10">
                <Text className="text-blue-500">Edit</Text>
              </TouchableOpacity>
            )}
          </View>

          {accountSettingsSections.map((section, sectionIndex) => (
            <View key={sectionIndex} className="mb-8">
              <Text className="text-white text-lg font-semibold mb-4">
                {section.title}
              </Text>
              <View className="bg-gray-800/50 rounded-xl overflow-hidden">
                {section.items.map((item, itemIndex) => (
                  <View
                    key={itemIndex}
                    className={`p-4 ${
                      itemIndex !== section.items.length - 1
                        ? 'border-b border-gray-700'
                        : ''
                    }`}
                  >
                    <View className="flex-row items-center justify-between">
                      <Text className="text-white text-base">
                        {item.title}
                      </Text>
                      {item.value}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ))}

          {/* Danger Zone */}
          <View className="mb-8">
            <Text className="text-red-500 text-lg font-semibold mb-4">
              Danger Zone
            </Text>
            <View className="bg-gray-800/50 rounded-xl overflow-hidden">
              <TouchableOpacity
                onPress={() => {
                  Alert.alert(
                    "Delete Account",
                    "Are you sure you want to delete your account? This action cannot be undone.",
                    [
                      {
                        text: "Cancel",
                        style: "cancel",
                      },
                      {
                        text: "Delete",
                        style: "destructive",
                        onPress: () => {
                          Alert.alert("Coming Soon", "Account deletion will be available soon");
                        },
                      },
                    ]
                  );
                }}
                className="p-4"
              >
                <Text className="text-red-500 text-center">Delete Account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (showAbout) {
    return (
      <SafeAreaView className="flex-1 bg-primary">
        <ScrollView className="flex-1 px-5 pb-24">
          {/* Header */}
          <View className="flex-row items-center mt-4 mb-4">
            <TouchableOpacity
              onPress={() => {
                setShowAbout(false);
                router.setParams({ screen: 'profile' });
              }}
              className="absolute left-0 z-10"
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-2xl font-bold flex-1 text-center">
              About
            </Text>
          </View>


          {/* Description */}
          <View className="mb-8">
            <Text className="text-white text-lg font-semibold mb-4">
              About this Project
            </Text>
            <Text className="text-gray-300 leading-6">
              {appDetails.description}
            </Text>
          </View>

          {/* Features */}
          <View className="mb-8">
            <Text className="text-white text-lg font-semibold mb-4">
              Features
            </Text>
            <View className="space-y-4">
              {appDetails.features.map((feature, index) => (
                <View key={index} className="flex-row items-start">
                  <Ionicons name={feature.icon as any} size={24} color="#AB8BFF" />
                  <View className="ml-3 flex-1">
                    <Text className="text-white font-semibold">{feature.title}</Text>
                    <Text className="text-gray-400 mt-1">
                      {feature.description}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Tech Stack */}
          <View className="mb-8">
            <Text className="text-white text-lg font-semibold mb-4">
              Tech Stack
            </Text>
            <View className="flex-row flex-wrap">
              {appDetails.techStack.map((tech, index) => (
                <View
                  key={index}
                  className="bg-accent/20 px-3 py-1 rounded-full mr-2 mb-2"
                >
                  <Text className="text-accent">{tech}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Credits */}
          <View className="mb-8">
            <Text className="text-white text-lg font-semibold mb-4">Credits</Text>
            <Text className="text-gray-300 mb-4">
              This app uses the TMDb API but is not endorsed or certified by TMDb.
              Movie data and images are provided by TMDb.
            </Text>
            <TouchableOpacity
              onPress={() => Linking.openURL("https://www.themoviedb.org")}
              className="bg-accent/20 p-4 rounded-lg"
            >
              <Text className="text-accent text-center">
                Visit TMDb Website
              </Text>
            </TouchableOpacity>
          </View>

          {/* Contact */}
          <View className="mb-8">
            <Text className="text-white text-lg font-semibold mb-4">Contact</Text>
            <Text className="text-gray-300">
              Have questions or suggestions? Feel free to reach out to us.
            </Text>
            <TouchableOpacity
              onPress={() => Linking.openURL(`mailto:${appDetails.contact.email}`)}
              className="bg-gray-800/50 p-4 rounded-lg mt-4"
            >
              <Text className="text-white text-center">
                {appDetails.contact.email}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Copyright */}
          <View className="mb-30">
            <Text className="text-gray-400 text-center mb-40">
              {appDetails.copyright}
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (showSavedMovies) {
    return (
      <SafeAreaView className="flex-1 bg-primary">
        <ScrollView className="flex-1 px-5 pb-24">
          {/* Header */}
          <View className="flex-row items-center mt-4 mb-4">
            <TouchableOpacity
              onPress={() => setShowSavedMovies(false)}
              className="absolute left-0 z-10"
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-2xl font-bold flex-1 text-center">
              Saved Movies
            </Text>
          </View>

          {savedMovies.length > 0 ? (
            <View className="flex-row flex-wrap justify-between">
              {savedMovies.map((movie) => (
                <View key={movie.id} className="w-[31%] mb-4">
                  <MovieCard {...movie} />
                </View>
              ))}
            </View>
          ) : (
            <View className="items-center justify-center py-8">
              <Text className="text-white text-lg mb-2">No saved movies yet</Text>
              <Text className="text-gray-400 text-center">
                Save your favorite movies to watch them later
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-primary' : 'bg-white'}`}>
      <Image
        source={images.bg}
        className="flex-1 absolute w-full z-0"
        resizeMode="cover"
        style={{ opacity: isDark ? 1 : 0.1 }}
      />

      <ScrollView className="flex-1 pb-40">
        <View className="px-5">
          <View className="w-full flex-row justify-center mt-5 items-center">
            <Image source={icons.logo} className="w-12 h-10" />
            <TouchableOpacity
              onPress={() => console.log("Logout")}
              className="absolute right-0"
            >
              <Ionicons name="log-out-outline" size={24} color={isDark ? "white" : "black"} />
            </TouchableOpacity>
          </View>

          {/* Profile Header */}
          <View className="items-center mt-8 mb-8">
            <TouchableOpacity onPress={pickImage} className="relative">
              <Image
                source={
                  profileImage
                    ? { uri: profileImage }
                    : require("@/assets/images/default-avatar.png")
                }
                className="w-24 h-24 rounded-full"
              />
              <View className="absolute bottom-0 right-0 bg-accent p-2 rounded-full">
                <Ionicons name="camera" size={20} color="white" />
              </View>
            </TouchableOpacity>
            <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>
              {user.name}
            </Text>
            <Text className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {user.email}
            </Text>
          </View>

          {/* Stats */}
          <View className="flex-row justify-around mb-8">
            <TouchableOpacity 
              className="items-center"
              onPress={() => setShowSavedMovies(true)}
            >
              <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                {savedCount}
              </Text>
              <Text className={isDark ? 'text-gray-400' : 'text-gray-600'}>Saved</Text>
            </TouchableOpacity>
            <View className="items-center">
              <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                {watchedCount}
              </Text>
              <Text className={isDark ? 'text-gray-400' : 'text-gray-600'}>Watched</Text>
            </View>
            <View className="items-center">
              <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                {listsCount}
              </Text>
              <Text className={isDark ? 'text-gray-400' : 'text-gray-600'}>Lists</Text>
            </View>
          </View>

          {/* Menu Items */}
          <View className={`${isDark ? 'bg-gray-800/50' : 'bg-gray-100'} rounded-xl mb-40 border border-gray-700/50`}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                className="flex-row items-center py-4 px-5 border-b border-gray-700/50 last:border-b-0"
                onPress={item.onPress}
              >
                <Image source={item.icon} className="w-6 h-6 mr-4" tintColor={isDark ? "#fff" : "#000"} />
                <Text className={`text-lg flex-1 ${isDark ? 'text-white' : 'text-black'}`}>
                  {item.title}
                </Text>
                {item.rightElement || (
                  <Image source={icons.arrow} className="w-5 h-5" tintColor={isDark ? "#fff" : "#000"} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
