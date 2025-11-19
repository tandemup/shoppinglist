import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import defaultConfig from "../config/config.default.json";

const CONFIG_KEY = "app_config";

const ConfigContext = createContext();

export function ConfigProvider({ children }) {
  const [config, setConfig] = useState(defaultConfig);

  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem(CONFIG_KEY);
      if (saved) {
        setConfig(JSON.parse(saved));
      }
    })();
  }, []);

  const updateConfig = async (newConfig) => {
    setConfig(newConfig);
    await AsyncStorage.setItem(CONFIG_KEY, JSON.stringify(newConfig));
  };

  return (
    <ConfigContext.Provider value={{ config, updateConfig }}>
      {children}
    </ConfigContext.Provider>
  );
}

export const useConfig = () => useContext(ConfigContext);
