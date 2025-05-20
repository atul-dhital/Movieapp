import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  successContainer: {
    backgroundColor: '#4CAF50',
  },
  errorContainer: {
    backgroundColor: '#F44336',
  },
  infoContainer: {
    backgroundColor: '#2196F3',
  },
  text: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  subText: {
    color: 'white',
    fontSize: 14,
    marginTop: 4,
  },
});

export const toastConfig = {
  success: (props: any) => (
    <View style={[styles.container, styles.successContainer]}>
      <Text style={styles.text}>{props.text1}</Text>
    </View>
  ),
  error: (props: any) => (
    <View style={[styles.container, styles.errorContainer]}>
      <Text style={styles.text}>{props.text1}</Text>
      {props.text2 && <Text style={styles.subText}>{props.text2}</Text>}
    </View>
  ),
  info: (props: any) => (
    <View style={[styles.container, styles.infoContainer]}>
      <Text style={styles.text}>{props.text1}</Text>
    </View>
  ),
}; 