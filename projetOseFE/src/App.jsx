import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/menu/Navbar.jsx";

import { LoginPage } from "./pages/login.jsx";

// Pages Employeur
import { EmployerSignUpPage } from "./pages/employer/signUp.jsx";
import AjoutStage from "./pages/employer/addIntership.jsx";
import { ResetPasswordPage } from "./pages/auth/resetPassword.jsx";
import { RequestPassword } from "./pages/auth/requestPassword.jsx";
import { StudentDashboard } from "./pages/student/dashboard.jsx";
import { StudentSignUpPage } from "./pages/student/signUp.jsx";
import { StudentOffers } from "./pages/student/studentOffers.jsx";
import Home from "./pages/home.jsx";
import { EmployerDashboard } from "./pages/employer/dashboard.jsx";
import { DashboardLayout } from "./components/layouts/dashboard.jsx";
import OffresAConfirmer from "./pages/student/internshipFinalDecision.jsx";
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
import {InternshipApplicationsGE} from "./pages/gs/internshipApplication.jsx";
import StudentConvocations from "./pages/student/studentConvocationDecision.jsx";
import {PhoneCallIcon} from "lucide-react";
import { StudentApplications } from "./pages/student/internshipApplications.jsx";

function App() {
  const { t } = useTranslation([
    "student_dashboard",
    "employer_dashboard",
    "gs_dashboard",
    "menu",
    "student_dashboard_decision",
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
      key: "decision",
      label: t("student_dashboard_decision:stats.decisionStatus"),
      href: "/dashboard/student/internshipFinalDecision",
      icon: CheckIcon,
    },
    {
      key: "applications",
      label: t("student_dashboard:stats.myApplications"),
      href: "/dashboard/student/applications",
      icon: EnvelopeClosedIcon,
    },
    {
      key: "convocation",
      label: t("student_dashboard:titles.convocation"),
      href: "/dashboard/student/convocations",
      icon: PhoneCallIcon
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
      key: "applications",
      label: t("gs_dashboard:stats.application"),
      href: "/dashboard/gs/applications",
      icon: PersonIcon,
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
                  path="/dashboard/gs/applications"
                  element={<InternshipApplicationsGE />}
              />
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
            <Route path="/dashboard/student/offers" element={<StudentOffers />} />
            <Route
              path="/dashboard/student/settings"
              element={<DashboardSettings />}
            />
              <Route path="/dashboard/student/applications" element={<StudentApplications />} />
              <Route
                path="/dashboard/student/internshipFinalDecision"
                element={<OffresAConfirmer />}
            />
            <Route
                path="/dashboard/student/convocations"
                element={<StudentConvocations />}
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
          </Routes>
          <DevMode />
        </BrowserRouter>




        {/* Hidden safelist for dynamic color props (shades 50–700) */}
        <div className="hidden
              bg-gray-50 bg-gray-100 bg-gray-200 bg-gray-300 bg-gray-400 bg-gray-500 bg-gray-600 bg-gray-700
              bg-blue-50 bg-blue-100 bg-blue-200 bg-blue-300 bg-blue-400 bg-blue-500 bg-blue-600 bg-blue-700
              bg-green-50 bg-green-100 bg-green-200 bg-green-300 bg-green-400 bg-green-500 bg-green-600 bg-green-700
              bg-amber-50 bg-amber-100 bg-amber-200 bg-amber-300 bg-amber-400 bg-amber-500 bg-amber-600 bg-amber-700
              bg-red-50 bg-red-100 bg-red-200 bg-red-300 bg-red-400 bg-red-500 bg-red-600 bg-red-700
              text-gray-50 text-gray-100 text-gray-200 text-gray-300 text-gray-400 text-gray-500 text-gray-600 text-gray-700
              text-blue-50 text-blue-100 text-blue-200 text-blue-300 text-blue-400 text-blue-500 text-blue-600 text-blue-700
              text-green-50 text-green-100 text-green-200 text-green-300 text-green-400 text-green-500 text-green-600 text-green-700
              text-amber-50 text-amber-100 text-amber-200 text-amber-300 text-amber-400 text-amber-500 text-amber-600 text-amber-700
              text-red-50 text-red-100 text-red-200 text-red-300 text-red-400 text-red-500 text-red-600 text-red-700
            "></div>
      </div>
  );
}

export default App;