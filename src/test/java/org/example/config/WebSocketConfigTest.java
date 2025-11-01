package org.example.config;

import org.example.repository.UserAppRepository;
import org.example.security.JwtTokenProvider;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.mockito.*;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.StompWebSocketEndpointRegistration;

import static org.mockito.Mockito.*;

class WebSocketConfigTest {

    private WebSocketConfig config;

    @Mock
    private MessageBrokerRegistry messageBrokerRegistry;

    @Mock
    private StompEndpointRegistry stompEndpointRegistry;

    @Mock
    private StompWebSocketEndpointRegistration endpointRegistration;

    @Mock
    private UserAppRepository userAppRepository;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        config = new WebSocketConfig(
                this.userAppRepository,
                this.jwtTokenProvider
        );

        when(stompEndpointRegistry.addEndpoint("/ws")).thenReturn(endpointRegistration);
        when(endpointRegistration.setAllowedOriginPatterns("*")).thenReturn(endpointRegistration);
        when(endpointRegistration.withSockJS()).thenReturn(null);
    }

    @Test
    void shouldConfigureMessageBroker() {
        // Act
        config.configureMessageBroker(messageBrokerRegistry);

        // Assert
        verify(messageBrokerRegistry).enableSimpleBroker("/topic");
        verify(messageBrokerRegistry).setApplicationDestinationPrefixes("/app");
    }

    @Test
    void shouldRegisterEndpoint() {
        // Act
        config.registerStompEndpoints(stompEndpointRegistry);

        // Assert
        verify(stompEndpointRegistry, times(1)).addEndpoint("/ws");
    }
}