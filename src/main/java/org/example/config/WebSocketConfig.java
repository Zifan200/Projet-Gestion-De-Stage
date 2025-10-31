package org.example.config;

import org.example.model.UserApp;
import org.example.model.auth.Role;
import org.example.repository.UserAppRepository;
import org.example.security.JwtTokenProvider;
import org.example.security.exception.InvalidJwtTokenException;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import java.util.Optional;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {


    private final UserAppRepository userAppRepository;
    private final JwtTokenProvider jwtTokenProvider;

    public WebSocketConfig(UserAppRepository userAppRepository, JwtTokenProvider jwtTokenProvider) {
        this.userAppRepository = userAppRepository;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")  // point d’entrée WebSocket
                .setAllowedOriginPatterns("*") // autorise toutes les origines (dev)
                .withSockJS(); // fallback pour navigateurs sans WS natif
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic");
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(authChannelInterceptor());
    }

    // Intercepteur pour vérifier s'il agit du bon utilisateur pour visualiser une notification
    private ChannelInterceptor authChannelInterceptor() {
        return new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);

                switch (accessor.getCommand()) {
                    case CONNECT, SUBSCRIBE -> {
                        // Récupère le token
                        String token = accessor.getFirstNativeHeader("Authorization");
                        if (token == null || !token.startsWith("Bearer ")) {
                            throw new IllegalArgumentException("Unauthorized: missing or invalid token");
                        }
                        token = token.substring(7);

                        // Vérifie le token
                        jwtTokenProvider.validateToken(token);

                        // Récupère l’utilisateur
                        String userEmail = jwtTokenProvider.getEmailFromJWT(token);
                        Optional<UserApp> user = userAppRepository.findUserAppByEmail(userEmail);

                        if (user.isEmpty()) {
                            throw new InvalidJwtTokenException(HttpStatus.NOT_FOUND,
                                    "User associated with token not found.");
                        }

                        // Crée le Principal avec authorities
                        Authentication principal = new UsernamePasswordAuthenticationToken(
                                user.get().getEmail(),
                                null,
                                user.get().getAuthorities()
                        );
                        accessor.setUser(principal);

                        // Vérifie les SUBSCRIBE pour éviter l'accès aux files des autres
                        if (StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
                            String destination = accessor.getDestination();
                            if (destination != null) {
                                String[] parts = destination.split("/");
                                if (parts.length >= 3) {
                                    boolean authorized = isAuthorized(parts, user);

                                    if (!authorized) {
                                        throw new IllegalArgumentException("Unauthorized subscription attempt to "
                                                + destination);
                                    }
                                }
                            }
                        }
                    }
                    default -> {}
                }
                return message;
            }
        };
    }

    private static boolean isAuthorized(String[] parts, Optional<UserApp> user) {
        String role = parts[2];
        String idInDestination = parts[3]; // l’ID de l’utilisateur

        if (user.isPresent()) {
            Long userId = user.get().getId();

            return switch (role) {
                case "etudiant" -> user.get().getRole() == Role.STUDENT && userId.toString().equals(idInDestination);
                case "employer" -> user.get().getRole() == Role.EMPLOYER && userId.toString().equals(idInDestination);
                case "gestionnaire" ->
                        user.get().getRole() == Role.GESTIONNAIRE && userId.toString().equals(idInDestination);
                default -> false;
            };
        }
        else return false;
    }
}
