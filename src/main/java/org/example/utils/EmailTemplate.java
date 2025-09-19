package org.example.utils;


public class EmailTemplate {
    public static String CreateAccount(String firstName) {
        String emailHtml = """
            <html>
                <body>
                    <h1>Bonjour %s,</h1>
                    <p>Votre compte a été créé avec succès !</p>
                    <p>Nous sommes ravis de vous compter parmi nous.</p>
                    <br/>
                    <p>Cordialement,<br/>L'équipe Thibeault Cloud</p>
                </body>
            </html>
            """;
        return String.format(emailHtml, firstName);
    }

    public static String ResetPassword(String firstName, String resetLink) {
        String emailHtml = """
        <html>
            <body>
                <h1>Bonjour %s,</h1>
                <p>Nous avons reçu une demande de votre part pour réinitialiser votre mot de passe.</p>
                <p>Voici le <a href="%s">lien</a> vers le formulaire de réinitialisation.</p>
                <br/>
                <p>Cordialement,<br/>L'équipe Thibeault Cloud</p>
            </body>
        </html>
        """;
        return String.format(emailHtml, firstName, resetLink);
    }


}
