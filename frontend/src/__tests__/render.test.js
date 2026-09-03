import React from "react";
import { render } from "@testing-library/react";
import App from "../App";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

test("renders app without crashing", () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });
  window.history.pushState({}, "Test", "/app");
  render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  );
});
