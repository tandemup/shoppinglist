import React from "react";
import { Platform, Image } from "react-native";

import Cart from "../assets/icons/cart.svg";
import Search from "../assets/icons/magnifying-glass.svg";
import Chevron from "../assets/icons/chevron-right.svg";
import Ellipsis from "../assets/icons/ellipsis-vertical.svg";
import Trash from "../assets/icons/trash.svg";
import Close from "../assets/icons/x-mark.svg";
import Warning from "../assets/icons/exclamation-triangle.svg";
import Store from "../assets/icons/building-storefront.svg";
import QR from "../assets/icons/qr-code.svg";
import Bars from "../assets/icons/bars-3.svg";

const ICONS = {
  cart: Cart,
  search: Search,
  chevron: Chevron,
  ellipsis: Ellipsis,
  trash: Trash,
  close: Close,
  warning: Warning,
  store: Store,
  barcode: QR,
  menu: Bars,
};

const ICON_ALIASES = {
  "shopping-cart": "cart",
  "cart-outline": "cart",

  "storefront-outline": "store",

  "barcode-outline": "barcode",
  "barcode-scan": "barcode",

  "search-outline": "search",

  "chevron-forward": "chevron",
  "chevron-right": "chevron",

  "ellipsis-vertical": "ellipsis",
};

export default function AppIcon({ name, size = 22, color = "#374151", style }) {
  const resolved = ICON_ALIASES[name] || name;
  const Icon = ICONS[resolved];

  if (!Icon) {
    if (__DEV__) {
      console.warn(`[AppIcon] Icon not found: ${name}`);
    }
    return null;
  }

  // 🌐 WEB → SVG es un asset (Image)
  if (Platform.OS === "web" && Icon?.uri) {
    return (
      <Image source={Icon} style={[{ width: size, height: size }, style]} />
    );
  }

  // 📱 NATIVE → SVG es componente
  return (
    <Icon width={size} height={size} stroke={color} fill="none" style={style} />
  );
}
