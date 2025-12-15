import React from "react";
import { View, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";

export default function StoresMapScreen({ route }) {
  const { stores = [], userLocation } = route.params ?? {};

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />
  <link
    rel="stylesheet"
    href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
  />
  <style>
    html, body, #map {
      height: 100%;
      margin: 0;
      padding: 0;
    }
  </style>
</head>
<body>
  <div id="map"></div>

  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    const map = L.map('map').setView(
      [${userLocation?.latitude ?? 43.5322}, ${
    userLocation?.longitude ?? -5.6611
  }],
      13
    );

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    ${
      userLocation
        ? `
      L.marker([${userLocation.latitude}, ${userLocation.longitude}])
        .addTo(map)
        .bindPopup("Tu ubicación");
    `
        : ""
    }

    const stores = ${JSON.stringify(stores)};

    stores.forEach(store => {
      if (!store.location) return;

      L.marker([store.location.lat, store.location.lon])
        .addTo(map)
        .bindPopup(
          '<b>' + store.name + '</b><br/>' +
          (store.address ?? '')
        );
    });
  </script>
</body>
</html>
`;

  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={["*"]}
        source={{ html }}
        style={styles.webview}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  webview: { flex: 1 },
});
