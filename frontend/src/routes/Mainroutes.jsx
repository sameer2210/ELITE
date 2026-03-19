import React, { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";

import Auth from "./Auth";
import Unauth from "./Unauth";
import Carts from "../pages/cart/Cart";
import Settings from "../pages/user/Settings";
import Notifications from "../pages/user/Notifications";
import ProjectCreate from "../pages/admin/ProjectCreate";
import ProjectDetails from "../pages/project/ProjectDetails";
import ProjectsPage from "../pages/project/ProjectsPage";

// Lazy-loaded components
const Signup = lazy(() => import("../pages/user/Signup"));
const Signin = lazy(() => import("../pages/user/Signin"));
const Home = lazy(() => import("../pages/general/Home"));
const About = lazy(() => import("../pages/general/About"));
const Contact = lazy(() => import("../pages/general/Contact"));
const PageNotFound = lazy(() => import("../pages/general/PageNotFound"));

const Loader = () => (
  <div className="text-center py-20 text-lg font-medium text-gray-600">
    Loading...
  </div>
);

const Mainroutes = () => {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/projects" element={<ProjectsPage />} />

        {/* Auth-Protected */}
        <Route path="/settings" element={<Auth><Settings /></Auth>} />
        <Route path="/submit" element={<Auth><ProjectCreate /></Auth>} />
        <Route path="/projects/:id" element={<Auth><ProjectDetails /></Auth>} />
        <Route path="/saved" element={<Auth><Carts /></Auth>} />
        <Route path="/notifications" element={<Auth><Notifications /></Auth>} />

        {/* Unauthenticated Only */}
        <Route path="/signin" element={<Unauth><Signin /></Unauth>} />
        <Route path="/signup" element={<Unauth><Signup /></Unauth>} />

        {/* Catch All */}
        <Route path="/*" element={<PageNotFound />} />
      </Routes>
    </Suspense>
  );
};

export default Mainroutes;
