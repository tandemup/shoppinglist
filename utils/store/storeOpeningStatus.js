/**
 * LEGACY FILE
 * Esta lógica debe migrarse a utils/store/openingHours.js
 */

import { isOpenNow, getOpeningText } from "./openingHours";

export const getStoreOpeningStatus = (store, date = new Date()) => {
  if (!store || !store.hours) {
    return {
      status: "unknown",
      text: "Horario no disponible",
    };
  }

  const open = isOpenNow(store.hours, date);

  return {
    status: open ? "open" : "closed",
    text: getOpeningText(store.hours, date),
  };
};
