import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import About from "@/pages/about";
import Delivery from "@/pages/delivery";
import Returns from "@/pages/returns";
import AdminPage from "@/pages/admin";
import Catalog from "@/pages/catalog";
import EvaGaloshi from "@/pages/eva-galoshi";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/catalog" component={Catalog} />
      <Route path="/eva-galoshi" component={EvaGaloshi} />
      <Route path="/about" component={About} />
      <Route path="/delivery" component={Delivery} />
      <Route path="/returns" component={Returns} />
      <Route path="/admin" component={AdminPage} />
      <Route path="/upravlenie" component={AdminPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
