export const menuConfig = [
  {
    id: "connexion",
    label: "connexion",
    link: { href: "/login" },
    sections: [],
  },
  {
    id: "signup",
    label: "signup",
    sections: [
      {
        title: "signupTitle",
        links: [
          { label: "student", href: "/signup/student" },
          // { label: "manager", href: "/signup/gs" },
          { label: "employer", href: "/signup/employer" },
        ],
      },
    ],
  },
];
