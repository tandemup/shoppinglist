import React from "react";
import { Platform } from "react-native";
import { SvgUri } from "react-native-svg";
import { Asset } from "expo-asset";

const ICONS = {
  "shopping-cart": require("../assets/icons/shopping-cart.svg"),
  "cart-outline": require("../assets/icons/shopping-cart.svg"),

  "chevron-forward": require("../assets/icons/chevron-right.svg"),
  "ellipsis-vertical": require("../assets/icons/ellipsis-vertical.svg"),
  menu: require("../assets/icons/bars-3.svg"),

  search: require("../assets/icons/magnifying-glass.svg"),
  "search-outline": require("../assets/icons/magnifying-glass.svg"),

  barcode: require("../assets/icons/qr-code.svg"),
  "barcode-outline": require("../assets/icons/qr-code.svg"),

  flash: require("../assets/icons/bolt.svg"),
  "flash-off": require("../assets/icons/bolt-slash.svg"),

  "location-outline": require("../assets/icons/map-pin.svg"),
  "storefront-outline": require("../assets/icons/building-storefront.svg"),
  "navigate-outline": require("../assets/icons/arrow-top-right-on-square.svg"),
  "map-outline": require("../assets/icons/map.svg"),

  "calendar-outline": require("../assets/icons/calendar.svg"),
  "pricetag-outline": require("../assets/icons/tag.svg"),
  "cube-outline": require("../assets/icons/cube.svg"),

  save: require("../assets/icons/bookmark.svg"),
  trash: require("../assets/icons/trash.svg"),
  "refresh-outline": require("../assets/icons/arrow-path.svg"),
  close: require("../assets/icons/x-mark.svg"),
  "close-outline": require("../assets/icons/x-mark.svg"),

  warning: require("../assets/icons/exclamation-triangle.svg"),
};

export default function AppIcon({ name, size = 22, color = "#374151", style }) {
  const source = ICONS[name];
  if (!source) return null;

  const asset = Asset.fromModule(source);
  const uri = asset.uri || asset.localUri;

  return (
    <SvgUri
      uri={uri}
      width={size}
      height={size}
      stroke={color}
      fill="none"
      style={style}
    />
  );
}
