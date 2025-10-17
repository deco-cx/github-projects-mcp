import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import {
  createRootRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from "@tanstack/react-router";
import HomePage from "./routes/home.tsx";
import TrackingRoute from "./routes/tracking.tsx";
import ToolsRoute from "./routes/tools.tsx";
import ProjectsRoute from "./routes/projects.tsx";
import IssuesRoute from "./routes/issues.tsx";
import { Toaster } from "sonner";

import "./styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const routeTree = rootRoute.addChildren([
  HomePage(rootRoute),
  TrackingRoute(rootRoute),
  ToolsRoute(rootRoute),
  ProjectsRoute(rootRoute),
  IssuesRoute(rootRoute),
]);

const queryClient = new QueryClient();

const router = createRouter({
  routeTree,
  context: {
    queryClient,
  },
  defaultPreload: "intent",
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById("root");
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster />
      </QueryClientProvider>
    </StrictMode>,
  );
}
