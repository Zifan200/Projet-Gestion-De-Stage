package org.example.utils;

import jakarta.servlet.http.HttpServletRequest;

public class JwtTokenUtils {
    public static String getTokenFromRequest(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("JWT manquant ou invalide");
        }
        return authHeader.substring(7);
    }
}
