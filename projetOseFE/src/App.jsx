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
  GearIcon,
} from "@radix-ui/react-icons";
import AddIntership from "./pages/employer/addIntership.jsx";
import { StudentCVs } from "./pages/student/cvs.jsx";
import { useTranslation } from "react-i18next";
import { OfferList } from "./pages/employer/offerList.jsx";
import { AllOffers } from "./pages/gs/allOffers.jsx";
import { GsDashboard } from "./pages/gs/dashboard.jsx";
import { GsManageCvs } from "./pages/gs/cvs.jsx";
import { InternshipApplications } from "./pages/employer/internshipApplication.jsx";
import { DashboardSettings } from "./pages/dashboard/settings.jsx";
import { DevMode } from "./components/tools/dev-mode.jsx";

function App() {
  const { t } = useTranslation([
    "student_dashboard",
    "employer_dashboard",
    "gs_dashboard",
    "menu",
  ]);

  const studentDashboardSidebarLinks = [
    {
      key: "home",
      label: t("student_dashboard:titles.home"),
      href: "/dashboard/student",
      icon: BackpackIcon,
    },
    {
      key: "cvs",
      label: t("student_dashboard:stats.cvs"),
      href: "/dashboard/student/cvs",
      icon: FileTextIcon,
    },
    {
      key: "offers",
      label: t("student_dashboard:stats.availableOffers"),
      href: "/dashboard/student/offers",
      icon: EnvelopeOpenIcon,
    },
    {
      key: "applications",
      label: t("student_dashboard:stats.pendingOffers"),
      href: "/dashboard/student/applications",
      icon: EnvelopeClosedIcon,
    },
    {
      key: "settings",
      label: t("menu:settings"),
      href: "/dashboard/student/settings",
      icon: GearIcon,
    },
  ];

  const employerDashboardSidebarLinks = [
    {
      key: "dashboard",
      label: t("employer_dashboard:titles.home"),
      href: "/dashboard/employer/",
      icon: BackpackIcon,
    },
    {
      key: "applications",
      label: t("employer_dashboard:stats.applications"),
      href: "/dashboard/employer/applications",
      icon: PersonIcon,
    },
    {
      key: "createOffers",
      label: t("employer_dashboard:stats.createOffer"),
      href: "/dashboard/employer/add-intership",
      icon: EnvelopeClosedIcon,
    },
    {
      key: "seeOffers",
      label: t("employer_dashboard:stats.myOffers"),
      href: "/dashboard/employer/my-offers",
      icon: EnvelopeOpenIcon,
    },
    {
      key: "settings",
      label: t("menu:settings"),
      href: "/dashboard/employer/settings",
      icon: GearIcon,
    },
  ];

  const gsDashboardSidebarLinks = [
    {
      key: "dashboard",
      label: t("gs_dashboard:titles.home"),
      href: "/dashboard/gs/",
      icon: BackpackIcon,
    },
    {
      key: "manageCvs",
      label: t("gs_dashboard:stats.manageCvs"),
      href: "/dashboard/gs/manage-students-cvs",
      icon: BackpackIcon,
    },
    {
      key: "seeOffers",
      label: t("gs_dashboard:stats.allOffers"),
      href: "/dashboard/gs/internships",
      icon: EnvelopeClosedIcon,
    },
    {
      key: "settings",
      label: t("menu:settings"),
      href: "/dashboard/gs/settings",
      icon: GearIcon,
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

          {/* Routes Ge */}
          <Route
            path="/dashboard/gs/"
            element={
              <DashboardLayout
                sidebarLinks={gsDashboardSidebarLinks}
                title={t("gs_dashboard:titles.dashboard")}
              />
            }
          >
            <Route index element={<GsDashboard />} />
            <Route
              path="/dashboard/gs/manage-students-cvs"
              element={<GsManageCvs />}
            />
            <Route path="/dashboard/gs/internships" element={<AllOffers />} />
            <Route
              path="/dashboard/gs/settings"
              element={<DashboardSettings />}
            />
          </Route>

          {/* Routes Étudiant */}
          <Route path="/signup/student" element={<StudentSignUpPage />} />
          <Route
            path="/dashboard/student/"
            element={
              <DashboardLayout
                sidebarLinks={studentDashboardSidebarLinks}
                title={t("student_dashboard:titles.dashboard")}
              />
            }
          >
            <Route index element={<StudentDashboard />} />
            <Route path="/dashboard/student/cvs" element={<StudentCVs />} />
            <Route
              path="/dashboard/student/offers"
              element={<StudentOffers />}
            />
            <Route
              path="/dashboard/student/settings"
              element={<DashboardSettings />}
            />
          </Route>

          <Route
            path="/dashboard/employer/"
            element={
              <DashboardLayout
                sidebarLinks={employerDashboardSidebarLinks}
                title={t("employer_dashboard:titles.dashboard")}
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
            <Route
              path="/dashboard/employer/applications"
              element={<InternshipApplications />}
            />
            <Route
              path="/dashboard/employer/settings"
              element={<DashboardSettings />}
            />
          </Route>
          {/* Routes Employeur */}
          <Route path="/signup/employer" element={<EmployerSignUpPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/employer/ajout_stages" element={<AjoutStage />} />
          <Route
            path="/dashboard/employer/settings"
            element={<DashboardSettings />}
          />
        </Routes>
        <DevMode />
      </BrowserRouter>
    </div>
  );
}

export default App;
