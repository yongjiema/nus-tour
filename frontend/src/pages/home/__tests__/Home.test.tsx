import * as React from "react";
import { describe, it, expect } from "vitest";
import { render } from "../../../../test/utils/render";
import { screen } from "@testing-library/react";
import { Home } from "../index";

describe("Home Page", () => {
  it("renders welcome title", () => {
    render(<Home />);
    expect(screen.getByRole("heading", { name: /welcome to nus tour/i })).toBeInTheDocument();
  });
});
