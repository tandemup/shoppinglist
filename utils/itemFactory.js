// utils/itemFactory.js
import { v4 as uuidv4 } from "uuid";
import { todayISO } from "./date";
import { defaultItem } from "./defaultItem";

export const createItem = (name) => ({
  ...defaultItem,
  id: uuidv4(),
  name: name.trim(),
  date: todayISO(),
  checked: true,
});
