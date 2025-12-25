import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { Layout } from "@/components/layout/Layout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Expenses from "./pages/Expenses";
import Protein from "./pages/Protein";
import Water from "./pages/Water";
import Analysis from "./pages/Analysis";
import Notes from "./pages/Notes";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/"
              element={
                <Layout>
                  <Index />
                </Layout>
              }
            />
            <Route
              path="/expenses"
              element={
                <Layout>
                  <Expenses />
                </Layout>
              }
            />
            <Route
              path="/protein"
              element={
                <Layout>
                  <Protein />
                </Layout>
              }
            />
            <Route
              path="/water"
              element={
                <Layout>
                  <Water />
                </Layout>
              }
            />
            <Route
              path="/analysis"
              element={
                <Layout>
                  <Analysis />
                </Layout>
              }
            />
            <Route
              path="/notes"
              element={
                <Layout>
                  <Notes />
                </Layout>
              }
            />
            <Route
              path="/admin"
              element={
                <Layout>
                  <Admin />
                </Layout>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
