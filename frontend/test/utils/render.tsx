import type { ReactElement } from "react";
import { render as originalRender } from "@testing-library/react";
import type { RenderOptions } from "@testing-library/react";
import { AllTheProviders } from "./test-utils";

// Custom render function
export const render = (ui: ReactElement, options?: Omit<RenderOptions, "wrapper">) =>
  originalRender(ui, { wrapper: AllTheProviders, ...options });
