package org.example.service;
import com.deepl.api.DeepLClient;
import com.deepl.api.TextResult;
import com.deepl.api.DeepLException;
import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.stereotype.Service;

@Service
public class DeepLTranslatorService {
    private final DeepLClient client;

    public DeepLTranslatorService() throws DeepLException, InterruptedException {
        Dotenv dotenv = Dotenv.load();
        String key = dotenv.get("DEEPL_KEY");
        this.client = new DeepLClient(key);
    }

    public String translate(String text, String targetLang) {
        if (text == null || text.isBlank()) {
            return text;
        }

        try {
            TextResult result = client.translateText(text, null, targetLang);
            return result.getText();
        } catch (DeepLException | InterruptedException e) {
            System.err.println("Erreur DeepL: " + e.getMessage());
            return text;
        }
    }
}