import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/menu/Navbar.jsx";

import { StudentOffers } from "./pages/student/studentOffers.jsx";

import { LoginPage } from "./pages/login.jsx";

// Pages Employeur
import { EmployerSignUpPage } from "./pages/employer/signUp.jsx";
import AjoutStage from "./pages/employer/addIntership.jsx";
import { ResetPasswordPage } from "./pages/auth/resetPassword.jsx";
import { RequestPassword } from "./pages/auth/requestPassword.jsx";
import { StudentDashboard } from "./pages/student/dashboard.jsx";
import { StudentSignUpPage } from "./pages/student/signUp.jsx";
import Home from "./pages/home.jsx";
import { EmployerDashboard } from "./pages/employer/dashboard.jsx";
import { DashboardLayout } from "./components/layouts/dashboard.jsx";
import {
  BackpackIcon,
  PersonIcon,
  CheckIcon,
  EnvelopeClosedIcon,
  FileTextIcon,
  EnvelopeOpenIcon,
} from "@radix-ui/react-icons";
import AddIntership from "./pages/employer/addIntership.jsx";
import { StudentCVs } from "./pages/student/cvs.jsx";
import { useTranslation } from "react-i18next";
import { OfferList } from "./pages/employer/offerList.jsx";

function App() {
  const { t } = useTranslation();
  const employerDashboardSidebarLinks = [
    {
      key: "dashboard",
      label: t("menu.dashboard"),
      href: "/dashboard/employer/",
      icon: BackpackIcon,
    },
    {
      key: "createOffers",
      label: t("menu.createOffer"),
      href: "/dashboard/employer/add-intership",
      icon: EnvelopeClosedIcon,
    },
    {
      key: "seeOffers",
      label: t("menu.seeOffer"),
      href: "/dashboard/employer/my-offers",
      icon: EnvelopeOpenIcon,
    },
    {
      key: "applications",
      label: t("menu.post"),
      href: "/employer/applications",
      icon: PersonIcon,
    },
    {
      key: "students",
      label: t("menu.student"),
      href: "/employer/students",
      icon: CheckIcon,
    },
  ];

  const studentDashboardSidebarLinks = [
    {
      key: "home",
      label: "Dashboard",
      href: "/dashboard/student",
      icon: BackpackIcon,
    },
    {
      key: "cvs",
      label: t("menu.cvs"),
      href: "/dashboard/student/cvs",
      icon: FileTextIcon,
    },
    {
      key: "offers",
      label: t("menu.myOffer"),
      href: "/dashboard/student/offers",
      icon: EnvelopeOpenIcon,
    },
    {
      key: "applications",
      label: t("menu.post"),
      href: "/dashboard/student/applications",
      icon: EnvelopeClosedIcon,
    },
  ];
  return (
    <div className="min-h-screen">
      <BrowserRouter>
        <Navbar />
        <Routes>
          {/* Pages principales */}
          <Route path="/" element={<Home />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/request-password" element={<RequestPassword />} />

          {/* Routes Étudiant */}
          <Route path="/signup/student" element={<StudentSignUpPage />} />
          <Route
            path="/dashboard/student/"
            element={
              <DashboardLayout
                sidebarLinks={studentDashboardSidebarLinks}
                title="Student"
              />
            }
          >
            <Route index element={<StudentDashboard />} />
            <Route path="/dashboard/student/cvs" element={<StudentCVs />} />
            <Route path="/dashboard/student/offers" element={<StudentOffers />} />
          </Route>

          <Route
            path="/dashboard/employer/"
            element={
              <DashboardLayout
                sidebarLinks={employerDashboardSidebarLinks}
                title="Employeur"
              />
            }
          >
            <Route index element={<EmployerDashboard />} />
            <Route
              path="/dashboard/employer/add-intership"
              element={<AddIntership />}
            />
            <Route
              path="/dashboard/employer/my-offers"
              element={<OfferList />}
            />
          </Route>
          {/* Routes Employeur */}
          <Route path="/signup/employer" element={<EmployerSignUpPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/employer/ajout_stages" element={<AjoutStage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
