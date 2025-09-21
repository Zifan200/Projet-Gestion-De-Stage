export const menuConfig = [
    {
        id: "connexion",
        label: "Connexion",
        sections: [
            {
                title: "Choisir votre rôle",
                links: [
                    { label: "Étudiant", href: "/login/etudiant" },
                    { label: "Gestionnaire", href: "/login/gs" },
                    { label: "Employeur", href: "/login/employer" },
                ],
            },
        ],
    },
    {
        id: "signup",
        label: "Créer un compte",
        sections: [
            {
                title: "Créer un compte",
                links: [
                    { label: "Étudiant", href: "/signup/etudiant" },
                    { label: "Gestionnaire", href: "/signup/gs" },
                    { label: "Employeur", href: "/signup/employer" },
                ],
            },
        ],
    },
];