import React from "react";
import {BrowserRouter, Routes, Route} from "react-router-dom";
import Navbar from "./components/menu/Navbar.jsx";

import {LoginPage} from "./pages/login.jsx";

// Pages Employeur
import {EmployerSignUpPage} from "./pages/employer/signUp.jsx";
import AjoutStage from "./pages/employer/addIntership.jsx";
import {ResetPasswordPage} from "./pages/auth/resetPassword.jsx";
import {RequestPassword} from "./pages/auth/requestPassword.jsx";
import {StudentDashboard} from "./pages/student/dashboard.jsx";
import {StudentSignUpPage} from "./pages/student/signUp.jsx";
import {StudentOffers} from "./pages/student/studentOffers.jsx";
import Home from "./pages/home.jsx";
import {EmployerDashboard} from "./pages/employer/dashboard.jsx";
import {DashboardLayout} from "./components/layouts/dashboard.jsx";
import OffresAConfirmer from "./pages/student/internshipFinalDecision.jsx";
import {DashboardPhoneLayout} from "./components/layouts/phone/dashboardPhone.jsx";
import { Handshake } from "lucide-react";

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
import {StudentCVs} from "./pages/student/cvs.jsx";
import {useTranslation} from "react-i18next";
import {AllOffers} from "./pages/gs/allOffers.jsx";
import {GsDashboard} from "./pages/gs/dashboard.jsx";
import {GsManageCvs} from "./pages/gs/cvs.jsx";
import {DashboardSettings} from "./pages/dashboard/settings.jsx";
import {DevMode} from "./components/tools/dev-mode.jsx";
import {InternshipApplicationsGE} from "./pages/gs/internshipApplication.jsx";
import StudentConvocations from "./pages/student/studentConvocationDecision.jsx";
import {PhoneCallIcon} from "lucide-react";
import {StudentApplications} from "./pages/student/internshipApplications.jsx";
import {GsAssignments} from "./pages/gs/assignments.jsx";
import {GsRecommendations} from "./pages/gs/recommendations.jsx";
import {InternshipApplicationsWrapper} from "./pages/employer/wrapper/InternshipApplicationsWrapper.jsx";
import {PageWrapper} from "./components/layouts/wrapper/pageWrapper.jsx";
import {OfferListWrapper} from "./pages/employer/wrapper/offerListWrapper.jsx";
import {PostInterview} from "./pages/employer/PostInterview.jsx";
import {CvsPhone} from "./pages/student/phone/cvsPhone.jsx";
import {InternshipApplicationStudentPhone} from "./pages/student/phone/internshipApplicationsStudentPhone.jsx";
import {CvsGsPhone} from "./pages/gs/phone/cvsGsPhone.jsx";
import {AllOffersGsPhone} from "./pages/gs/phone/allOffersGsPhone.jsx";
import {InternshipApplicationsGsPhone} from "./pages/gs/phone/internshipApplicationGsPhone.jsx";
import {StudentOffersPhone} from "./pages/student/phone/studentOffersPhone.jsx";
import OffresAConfirmerPhone from "./pages/student/phone/internshipFinalDecisionPhone.jsx";
import StudentConvocationDecisionPhone from "./pages/student/phone/studenConvocationDecisionPhone.jsx";
import {DashboardCardEmployerWrapper} from "./pages/employer/wrapper/dashboardCardEmployerWrapper.jsx";
import {DashboardCardGsWrapper} from "./pages/gs/wrapper/dashboardGsPhone.jsx";
import {DashboardCardStudentWrapper} from "./pages/student/wrapper/dashboardCardStudentWrapper.jsx";
import {DashboardGsPhone} from "./pages/gs/phone/dashboardGsPhone.jsx";
import {PostInterviewPhone} from "./pages/employer/phone/PostInterviewPhone.jsx";
import {AgreementsGsPhone} from "./pages/gs/phone/agreementsGsPhone.jsx";
import {GsInternshipAgreements} from "./pages/gs/agreements.jsx";
import {EmployerInternshipAgreements} from "./pages/employer/agreementsEmployer.jsx";
import {StudentInternshipAgreements} from "./pages/student/agreementsStudent.jsx";
import {StudentInternshipAgreementsPhone} from "./pages/student/phone/agreementsStudentPhone.jsx";
import {EmployerInternshipAgreementsPhone} from "./pages/employer/phone/agreementsEmployerPhone.jsx";

function App() {
    const {t} = useTranslation([
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
            key: "decision",
            label: t("student_dashboard_decision:stats.decisionStatus"),
            href: "/dashboard/student/internshipFinalDecision",
            icon: CheckIcon,
        },
        {
            key: "agreementsStudent",
            label: t("student_dashboard:stats.internshipAgreements"),
            href: "/dashboard/student/internship-agreements-student",
            icon: Handshake,
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
            key: "applications",
            label: t("employer_dashboard:stats.applications"),
            href: "/dashboard/employer/applications",
            icon: PhoneCallIcon,
        },
        {
            key: "postInterview",
            label: t("employer_dashboard:stats.interviews"),
            href: "/dashboard/employer/post-interviews",
            icon: PersonIcon,
        },
        {
            key: "agreementsEmployer",
            label: t("employer_dashboard:stats.internshipAgreements"),
            href: "/dashboard/employer/internship-agreements-employer",
            icon: Handshake,
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
            key: "agreements",
            label: t("gs_dashboard:stats.internshipAgreements"),
            href: "/dashboard/gs/internship-agreements", // desktop
            icon: Handshake,
        },
        {
            key: "assignments",
            label: t("gs_dashboard:stats.assignments"),
            href: "/dashboard/gs/assignments",
            icon: PersonIcon,
        },
        {
            key: "recommendations",
            label: t("gs_dashboard:stats.recommendations"),
            href: "/dashboard/gs/recommendations",
            icon: CheckIcon,
        },
        {
            key: "agreements",
            label: t("gs_dashboard:stats.internshipAgreements"),
            href: "/dashboard/gs/internship-agreements",
            icon: Handshake,
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
                <Navbar/>
                <Routes>
                    {/* Pages principales */}
                    <Route path="/" element={<Home/>}/>
                    <Route path="/reset-password" element={<ResetPasswordPage/>}/>
                    <Route path="/request-password" element={<RequestPassword/>}/>

                    {/* Routes GS */}
                    <Route
                        path="/dashboard/gs/"
                        element={
                            <PageWrapper
                                sidebarLinks={gsDashboardSidebarLinks}
                                title={t("gs_dashboard:titles.dashboard")}
                                DesktopComponent={DashboardLayout}
                                PhoneComponent={DashboardPhoneLayout}
                            />
                        }
                    >
                        <Route
                            index
                            element={
                                <PageWrapper
                                    sidebarLinks={gsDashboardSidebarLinks}
                                    title={t("gs_dashboard:titles.dashboard")}
                                    DesktopComponent={DashboardGsPhone}
                                />
                            }
                        />

                        <Route
                            path="/dashboard/gs/manage-students-cvs"
                            element={
                                <PageWrapper
                                    DesktopComponent={GsManageCvs}
                                    PhoneComponent={CvsGsPhone}
                                />
                            }
                        />
                        <Route
                            path="/dashboard/gs/internships"
                            element={
                                <PageWrapper
                                    DesktopComponent={AllOffers}
                                    PhoneComponent={AllOffersGsPhone}
                                />
                            }
                        />
                        <Route
                            path="/dashboard/gs/applications"
                            element={
                                <PageWrapper
                                    DesktopComponent={InternshipApplicationsGE}
                                    PhoneComponent={InternshipApplicationsGsPhone}
                                />
                            }
                        />
                        <Route
                            path="/dashboard/gs/internship-agreements"
                            element={
                                <PageWrapper
                                    DesktopComponent={GsInternshipAgreements}
                                    PhoneComponent={AgreementsGsPhone}
                                />
                            }
                        />

                        <Route
                            path="/dashboard/gs/assignments"
                            element={
                                <PageWrapper
                                    DesktopComponent={GsAssignments}
                                />
                            }
                        />

                        <Route
                            path="/dashboard/gs/recommendations"
                            element={
                                <PageWrapper
                                    DesktopComponent={GsRecommendations}
                                />
                            }
                        />

                        <Route
                            path="/dashboard/gs/settings"
                            element={<DashboardSettings/>}
                        />
                    </Route>

                    {/* Routes Étudiant */}
                    <Route path="/signup/student" element={<StudentSignUpPage/>}/>
                    <Route path="/dashboard/student/*" element={
                        <PageWrapper
                            sidebarLinks={studentDashboardSidebarLinks}
                            title={t("student_dashboard:titles.dashboard")}
                            DesktopComponent={DashboardLayout}
                            PhoneComponent={DashboardPhoneLayout}
                        />
                    }>
                        <Route
                            index
                            element={
                                <PageWrapper
                                    sidebarLinks={studentDashboardSidebarLinks}
                                    title={t("student_dashboard:titles.dashboard")}
                                    DesktopComponent={DashboardCardStudentWrapper}
                                />
                            }
                        />

                        <Route
                            path="cvs"
                            element={
                                <PageWrapper
                                    sidebarLinks={studentDashboardSidebarLinks}
                                    title={t("student_dashboard_cvs:myCvs")}
                                    DesktopComponent={StudentCVs}
                                    PhoneComponent={CvsPhone}
                                />
                            }
                        />

                        <Route
                            path="offers"
                            element={
                                <PageWrapper
                                    sidebarLinks={studentDashboardSidebarLinks}
                                    title={t("student_dashboard_offers:title")}
                                    DesktopComponent={StudentOffers}
                                    PhoneComponent={StudentOffersPhone}
                                />
                            }
                        />

                        <Route path="settings" element={<DashboardSettings/>}/>
                        <Route
                            path="applications"
                            element={
                                <PageWrapper
                                    DesktopComponent={StudentApplications}
                                    PhoneComponent={InternshipApplicationStudentPhone}
                                />
                            }
                        />
                        <Route
                            path="internshipFinalDecision"
                            element={
                                <PageWrapper
                                    DesktopComponent={OffresAConfirmer}
                                    PhoneComponent={OffresAConfirmerPhone}
                                />
                            }
                        />
                        <Route
                            path="convocations"
                            element={
                                <PageWrapper
                                    DesktopComponent={StudentConvocations}
                                    PhoneComponent={StudentConvocationDecisionPhone}
                                />
                            }
                        />
                        <Route
                            path="internship-agreements-student"
                            element={
                                <PageWrapper
                                    DesktopComponent={StudentInternshipAgreements}
                                    PhoneComponent={StudentInternshipAgreementsPhone}
                                />
                            }
                        />

                    </Route>

                    {/* Routes Employer */}
                    <Route
                        path="/dashboard/employer/*"
                        element={
                            <PageWrapper
                                sidebarLinks={employerDashboardSidebarLinks}
                                title={t("employer_dashboard:titles.dashboard")}
                                DesktopComponent={DashboardLayout}
                                PhoneComponent={DashboardPhoneLayout}
                            />
                        }
                    >
                        {/*/!* Route principale *!/*/}
                        <Route
                            path="/dashboard/employer/*"
                            element={
                                <PageWrapper
                                    sidebarLinks={employerDashboardSidebarLinks}
                                    title="Accueil"
                                    DesktopComponent={DashboardCardEmployerWrapper}
                                />
                            }
                        />

                        {/* Ajouter un stage */}
                        <Route
                            path="add-intership"
                            element={
                                <PageWrapper
                                    DesktopComponent={AddIntership}
                                    // PhoneComponent={() => (
                                    //     <DashboardPhoneLayout
                                    //         sidebarLinks={employerDashboardSidebarLinks}
                                    //         title="Ajouter un stage"
                                    //     />
                                    // )}
                                />
                            }
                        />

                        {/* Mes offres */}
                        <Route
                            path="my-offers"
                            element={
                                < OfferListWrapper/>
                            }
                        />

                        {/* Candidatures */}
                        <Route
                            path="applications"
                            element={
                                <InternshipApplicationsWrapper/>
                            }
                        />

                        {/* Paramètres */}
                        <Route
                            path="settings"
                            element={
                                <PageWrapper
                                    DesktopComponent={DashboardSettings}
                                    // PhoneComponent={() => (
                                    //     <DashboardPhoneLayout
                                    //         sidebarLinks={employerDashboardSidebarLinks}
                                    //         title="Paramètres"
                                    //     />
                                    // )}
                                />
                            }
                        />
                        <Route
                            path="post-interviews"
                            element={
                                <PageWrapper
                                    title="Entretiens post-stage"
                                    sidebarLinks={employerDashboardSidebarLinks}
                                    DesktopComponent={PostInterview}
                                    PhoneComponent={PostInterviewPhone}
                                />
                            }
                        />
                        <Route
                            path="internship-agreements-employer"
                            element={
                                <PageWrapper
                                    DesktopComponent={EmployerInternshipAgreements}
                                    PhoneComponent={EmployerInternshipAgreementsPhone}
                                />
                            }
                        />

                    </Route>


                    {/* Routes Employeur */}
                    <Route path="/signup/employer" element={<EmployerSignUpPage/>}/>
                    <Route path="/login" element={<LoginPage/>}/>
                    <Route path="/employer/ajout_stages" element={<AjoutStage/>}/>
                </Routes>
                <DevMode/>
            </BrowserRouter>
        </div>
    );
}

export default App;