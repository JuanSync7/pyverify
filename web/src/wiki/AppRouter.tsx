import { lazy } from "react";
import { Route, Routes } from "react-router-dom";
import { WikiLayout } from "./WikiLayout";
import { HomePage } from "../pages/HomePage";
import { ConceptsPage } from "../pages/ConceptsPage";
import { PipelinePage } from "../pages/PipelinePage";
import { StepsPage } from "../pages/StepsPage";
import { ToolsPage } from "../pages/ToolsPage";
import { AgentsPage } from "../pages/AgentsPage";
import { ConfigPage } from "../pages/ConfigPage";
import { StartPage } from "../pages/StartPage";
import { TutorialsPage } from "../pages/TutorialsPage";
import { NotFoundPage } from "../pages/NotFoundPage";

// The Playground embeds the full dashboard (React + xterm terminal + SSE), the
// heaviest part of the bundle. Lazy-load it so the wiki's first paint stays
// lean — the terminal/dashboard chunk only downloads when a visitor opens it.
const PlaygroundPage = lazy(() =>
  import("../pages/PlaygroundPage").then((m) => ({ default: m.PlaygroundPage }))
);

// The full route tree. New wiki pages get a <Route> here; the layout supplies
// the chrome (top bar + sidebar) around every one.
export function AppRouter() {
  return (
    <Routes>
      <Route element={<WikiLayout />}>
        <Route index element={<HomePage />} />
        <Route path="start" element={<StartPage />} />
        <Route path="concepts" element={<ConceptsPage />} />
        <Route path="pipeline" element={<PipelinePage />} />
        <Route path="steps" element={<StepsPage />} />
        <Route path="steps/:stepId" element={<StepsPage />} />
        <Route path="tools" element={<ToolsPage />} />
        <Route path="agents" element={<AgentsPage />} />
        <Route path="config" element={<ConfigPage />} />
        <Route path="tutorials" element={<TutorialsPage />} />
        <Route path="playground" element={<PlaygroundPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
