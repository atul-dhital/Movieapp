import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Add first page and ellipsis if needed
    if (startPage > 1) {
      pages.push(
        <TouchableOpacity
          key={1}
          onPress={() => onPageChange(1)}
          style={styles.pageButton}
        >
          <Text style={styles.pageText}>1</Text>
        </TouchableOpacity>
      );
      if (startPage > 2) {
        pages.push(
          <View key="ellipsis1" style={styles.ellipsis}>
            <Text style={styles.ellipsisText}>...</Text>
          </View>
        );
      }
    }

    // Add page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <TouchableOpacity
          key={i}
          onPress={() => onPageChange(i)}
          style={[
            styles.pageButton,
            currentPage === i && styles.activePageButton
          ]}
        >
          <Text style={[
            styles.pageText,
            currentPage === i && styles.activePageText
          ]}>
            {i}
          </Text>
        </TouchableOpacity>
      );
    }

    // Add last page and ellipsis if needed
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <View key="ellipsis2" style={styles.ellipsis}>
            <Text style={styles.ellipsisText}>...</Text>
          </View>
        );
      }
      pages.push(
        <TouchableOpacity
          key={totalPages}
          onPress={() => onPageChange(totalPages)}
          style={styles.pageButton}
        >
          <Text style={styles.pageText}>{totalPages}</Text>
        </TouchableOpacity>
      );
    }

    return pages;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        style={[styles.navButton, currentPage === 1 && styles.disabledButton]}
      >
        <Text style={[styles.navText, currentPage === 1 && styles.disabledText]}>
          Previous
        </Text>
      </TouchableOpacity>

      <View style={styles.pageNumbers}>
        {renderPageNumbers()}
      </View>

      <TouchableOpacity
        onPress={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        style={[styles.navButton, currentPage === totalPages && styles.disabledButton]}
      >
        <Text style={[styles.navText, currentPage === totalPages && styles.disabledText]}>
          Next
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 10,
  },
  pageNumbers: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  pageButton: {
    minWidth: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#1F2937',
    marginHorizontal: 2,
  },
  activePageButton: {
    backgroundColor: '#3B82F6',
  },
  pageText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  activePageText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  navButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#1F2937',
  },
  disabledButton: {
    backgroundColor: '#374151',
    opacity: 0.5,
  },
  navText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  disabledText: {
    color: '#9CA3AF',
  },
  ellipsis: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ellipsisText: {
    color: '#9CA3AF',
    fontSize: 16,
  },
});

export default Pagination; 