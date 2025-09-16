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
}
