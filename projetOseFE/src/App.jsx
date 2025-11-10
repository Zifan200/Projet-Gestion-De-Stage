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
import { DashboardCardPhone } from "./pages/employer/phone/dashboardCardPhone.jsx";
import { DashboardPhone } from "./components/layouts/phone/dashboardPhone.jsx";
import { InternshipApplicationsPhone } from "./pages/employer/phone/internshipApplicationPhone.jsx";

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
import {ResponsiveRoute} from "./ResponsiveRoute.jsx";
import {InternshipApplicationsWrapper} from "./pages/employer/wrapper/InternshipApplicationsWrapper.jsx";
import {DashboardPhoneWrapper} from "./components/layouts/wrapper/dashboardWrapper.jsx";
import {OfferListWrapper} from "./pages/employer/wrapper/offerListWrapper.jsx";
import {DashboardCardWrapperStudent} from "./pages/student/wrapper/dashboardCardWrapper.jsx";
import {DashboardCardWrapper} from "./pages/employer/wrapper/dashboardCardWrapper.jsx";
import {CvsWrapper} from "./pages/student/wrapper/cvsWrapper.jsx";
import {StudentOffersWrapper} from "./pages/student/wrapper/studentOffersWrapper.jsx";
import {StudentConvocationDecisionWrapper} from "./pages/student/wrapper/studentConvocationDecisionWrapper.jsx";
import {StudentApplicationsWrapper} from "./pages/student/wrapper/internshipApplicationsStudentWrapper.jsx";
import {DashboardGsWrapper} from "./pages/gs/wrapper/dashboardGsWrapper.jsx";
import {AllOffersGsWrapper} from "./pages/gs/wrapper/allOffersGsWrapper.jsx";
import {CvsGsWrapper} from "./pages/gs/wrapper/cvsGsWrapper.jsx";
import {InternshipApplicationsGsWrapper} from "./pages/gs/wrapper/internshipApplicationGsWrapper.jsx";

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

            {/* Routes GS */}
            <Route
                path="/dashboard/gs/"
                element={
                  <DashboardPhoneWrapper
                      sidebarLinks={gsDashboardSidebarLinks}
                      title={t("gs_dashboard:titles.dashboard")}
                      DesktopComponent={DashboardLayout}
                  />
                }
            >
              <Route
                  index
                  element={
                    <DashboardGsWrapper
                        sidebarLinks={gsDashboardSidebarLinks}
                        title={t("gs_dashboard:titles.dashboard")}
                        DesktopComponent={GsDashboard}
                    />
                  }
              />

              <Route
                  path="/dashboard/gs/manage-students-cvs"
                  element={
                    <CvsGsWrapper
                        DesktopComponent={GsManageCvs}
                    />
                  }
              />
                <Route
                    path="/dashboard/gs/internships"
                    element={
                        <AllOffersGsWrapper
                            DesktopComponent={AllOffers}
                        />
                    }
                />
                <Route
                    path="/dashboard/gs/applications"
                    element={
                        <InternshipApplicationsGsWrapper
                            DesktopComponent={InternshipApplicationsGE}
                        />
                    }
                />

                <Route
                  path="/dashboard/gs/settings"
                  element={<DashboardSettings />}
              />
            </Route>

          {/* Routes Étudiant */}
          <Route path="/signup/student" element={<StudentSignUpPage />} />
            <Route path="/dashboard/student/*" element={
              <DashboardPhoneWrapper
                  sidebarLinks={studentDashboardSidebarLinks}
                  title={t("student_dashboard:titles.dashboard")}
                  DesktopComponent={DashboardLayout}
              />
            }>
              <Route
                  index
                  element={
                    <DashboardCardWrapperStudent
                        sidebarLinks={studentDashboardSidebarLinks}
                        title={t("student_dashboard:titles.dashboard")}
                        DesktopComponent={StudentDashboard}
                    />
                  }
              />

              <Route
                  path="cvs"
                  element={
                    <CvsWrapper
                        sidebarLinks={studentDashboardSidebarLinks}
                        title={t("student_dashboard_cvs:myCvs")}
                        DesktopComponent={StudentCVs}
                    />
                  }
              />

              <Route
                  path="offers"
                  element={
                    <StudentOffersWrapper
                        sidebarLinks={studentDashboardSidebarLinks}
                        title={t("student_dashboard_offers:title")}
                        DesktopComponent={StudentOffers}
                    />
                  }
              />

              <Route path="settings" element={<DashboardSettings />} />
              <Route
                  path="applications"
                  element={
                    <StudentApplicationsWrapper
                        DesktopComponent={StudentApplications}
                    />
                  }
              />
              <Route path="internshipFinalDecision" element={<OffresAConfirmer />} />
              <Route
                  path="convocations"
                  element={
                    <StudentConvocationDecisionWrapper
                        DesktopComponent={StudentConvocations}
                    />
                  }
              />

            </Route>

            <Route
                path="/dashboard/employer/*"
                element={
                  <DashboardPhoneWrapper
                      sidebarLinks={employerDashboardSidebarLinks}
                      title={t("employer_dashboard:titles.dashboard")}
                      DesktopComponent={DashboardLayout}
                  />
                }
            >
              {/* Route principale */}
              <Route
                  path="/dashboard/employer/*"
                  element={
                    <DashboardCardWrapper sidebarLinks={employerDashboardSidebarLinks} title="Accueil" />
                  }
              />

              {/* Ajouter un stage */}
              <Route
                  path="add-intership"
                  element={
                    <ResponsiveRoute
                        DesktopComponent={AddIntership}
                        PhoneComponent={() => (
                            <DashboardPhone
                                sidebarLinks={employerDashboardSidebarLinks}
                                title="Ajouter un stage"
                            />
                        )}
                    />
                  }
              />

              {/* Mes offres */}
              <Route
                  path="my-offers"
                  element={
                    < OfferListWrapper />
                  }
              />

              {/* Candidatures */}
              <Route
                  path="applications"
                  element={
                    <InternshipApplicationsWrapper />
                  }
              />

              {/* Paramètres */}
              <Route
                  path="settings"
                  element={
                    <ResponsiveRoute
                        DesktopComponent={DashboardSettings}
                        PhoneComponent={() => (
                            <DashboardPhone
                                sidebarLinks={employerDashboardSidebarLinks}
                                title="Paramètres"
                            />
                        )}
                    />
                  }
              />
            </Route>



            {/* Routes Employeur */}
            <Route path="/signup/employer" element={<EmployerSignUpPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/employer/ajout_stages" element={<AjoutStage />} />
          </Routes>
          <DevMode />
        </BrowserRouter>
      </div>
  );
}

export default App;