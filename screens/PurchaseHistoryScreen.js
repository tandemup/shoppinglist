// screens/PurchaseHistoryScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { getPurchases } from '../utils/storageHelpers';

export default function PurchaseHistoryScreen() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const loadHistory = async () => {
      const purchases = await getPurchases();
      setHistory(purchases);
    };
    loadHistory();
  }, []);

  return (
    <View style={styles.container}>

      {history.length === 0 ? (
        <Text style={styles.empty}>No hay compras guardadas aún.</Text>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.date}>{item.date}</Text>
              <Text style={styles.store}>🛍️ {item.store}</Text>
              <Text style={styles.count}>{item.items.length} productos</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
  empty: { color: '#888', marginTop: 20, textAlign: 'center' },
  card: {
    backgroundColor: '#f1f1f1',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  date: { color: '#555', fontSize: 14 },
  store: { fontSize: 16, fontWeight: 'bold', marginVertical: 4 },
  count: { color: '#666' },
});
