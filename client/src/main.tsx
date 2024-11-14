import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Switch, Route } from "wouter";
import "./index.css";
import { SWRConfig } from "swr";
import { fetcher } from "./lib/fetcher";
import { Toaster } from "@/components/ui/toaster";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Medicines from "./pages/Medicines";
import Pharmacies from "./pages/Pharmacies";
import Inventory from "./pages/Inventory";
import Users from "./pages/Users";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SWRConfig value={{ fetcher }}>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/login" component={Login} />
        <Route path="/medicines" component={Medicines} />
        <Route path="/pharmacies" component={Pharmacies} />
        <Route path="/inventory" component={Inventory} />
        <Route path="/users" component={Users} />
        <Route>404 Page Not Found</Route>
      </Switch>
      <Toaster />
    </SWRConfig>
  </StrictMode>
);