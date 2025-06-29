import { createContext } from "react";

interface ColorModeContextType {
  mode: string;
  setMode: () => void;
}

export const ColorModeContext = createContext<ColorModeContextType>({} as ColorModeContextType);
