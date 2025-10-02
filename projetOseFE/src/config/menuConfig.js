export const menuConfig = [
    {
        id: "connexion",
        label: "menu.connexion",
        link: {href: "/login"},
        sections: [],
    },
    {
        id: "signup",
        label: "menu.signup",
        sections: [
            {
                title: "menu.signupTitle",
                links: [
                    {label: "menu.student", href: "/signup/student"},
                    {label: "menu.manager", href: "/signup/gs"},
                    {label: "menu.employer", href: "/signup/employer"},
                ],
            },
        ],
    },
];
