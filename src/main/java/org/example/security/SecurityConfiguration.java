package org.example.security;

import static org.springframework.boot.autoconfigure.security.servlet.PathRequest.toH2Console;
import static org.springframework.http.HttpMethod.*;

import java.util.Arrays;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.example.model.auth.Role;
import org.example.repository.UserAppRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity // Enables @PreAuthorize, @PostAuthorize, etc.
@RequiredArgsConstructor
public class SecurityConfiguration {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserAppRepository userRepository;
    private final JwtAuthenticationEntryPoint authenticationEntryPoint;

    private static final String H2_CONSOLE_PATH = "/h2-console/**";
    private static final String EMPLOYER_REGISTER_PATH =
        "/api/v1/employer/register";
    private static final String USER_PATH = "/api/v1/user/**";
    private static final String USER_PASSWORD_RESET_PATH =
        "/api/v1/user/password-reset/**";
    private static final String EMPLOYER_PATH = "/api/v1/employer/**";
    private static final String STUDENT_PATH = "/api/v1/student/**";
    private static final String STUDENT_REGISTER_PATH =
        "/api/v1/student/register";
    private static final String INTERNSHIP_PATH =
        "/api/v1/internship-offers/**";
    private static final String EMPLOYER_INTERNSHIP_STUDENT_APPLICATIONS_PATH =
        "/api/v1/internship-applications/internship-offer/**";
    private static final String INTERNSHIP_APPLICATION_PATH =
        "/api/v1/internship-applications/**";
    private static final String TEACHER_PATH = "/api/v1/teacher/**";
    private static final String TEACHER_REGISTER_PATH =
        "/api/v1/teacher/register";

    // Swagger/OpenAPI paths
    private static final String SWAGGER_UI_PATH = "/swagger-ui/**";
    private static final String SWAGGER_UI_HTML_PATH = "/swagger-ui.html";
    private static final String API_DOCS_PATH = "/v3/api-docs/**";
    private static final String SWAGGER_RESOURCES_PATH =
        "/swagger-resources/**";
    private static final String SWAGGER_CONFIG_PATH = "/swagger-ui/index.html";
    private static final String WEBJARS_PATH = "/webjars/**";

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http)
        throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .authorizeHttpRequests(
                auth ->
                    auth
                        // Swagger/OpenAPI - Allow all Swagger resources without authentication
                        .requestMatchers(
                            SWAGGER_UI_PATH,
                            SWAGGER_UI_HTML_PATH,
                            API_DOCS_PATH,
                            SWAGGER_RESOURCES_PATH,
                            SWAGGER_CONFIG_PATH,
                            WEBJARS_PATH
                        )
                        .permitAll()
                        // User
                        .requestMatchers(USER_PATH)
                        .permitAll()
                        .requestMatchers(POST, USER_PASSWORD_RESET_PATH)
                        .permitAll()
                        .requestMatchers(GET, USER_PATH)
                        .hasAnyAuthority(Role.STUDENT.name())
                        // Employer
                        .requestMatchers(POST, EMPLOYER_REGISTER_PATH)
                        .permitAll()
                        .requestMatchers(GET, USER_PATH)
                        .hasAnyAuthority(Role.EMPLOYER.name())
                        .requestMatchers(EMPLOYER_PATH)
                        .hasAuthority(Role.EMPLOYER.name())
                        // Student
                        .requestMatchers(POST, STUDENT_REGISTER_PATH)
                        .permitAll()
                        .requestMatchers(STUDENT_PATH)
                        .hasAnyAuthority(Role.STUDENT.name())
                        // Teacher
                        .requestMatchers(POST, TEACHER_REGISTER_PATH)
                        .permitAll()
                        .requestMatchers(TEACHER_PATH)
                        .hasAuthority(Role.TEACHER.name())
                        // Internships
                        .requestMatchers(INTERNSHIP_PATH)
                        .permitAll()
                        .requestMatchers(GET, INTERNSHIP_PATH)
                        .hasAnyAuthority(Role.STUDENT.name())
                        .anyRequest()
                        .authenticated() // Changed from denyAll() to authenticated() - more common, adjust if denyAll is strictly needed
            )
            .headers(headers ->
                headers.frameOptions(Customizer.withDefaults()).disable()
            ) // for h2-console
            .sessionManagement(secuManagement -> {
                secuManagement.sessionCreationPolicy(
                    SessionCreationPolicy.STATELESS
                );
            })
            .addFilterBefore(
                jwtAuthenticationFilter(),
                UsernamePasswordAuthenticationFilter.class
            )
            .exceptionHandling(configurer ->
                configurer.authenticationEntryPoint(authenticationEntryPoint)
            );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // 1. Specify allowed origins (VERY IMPORTANT!)
        //    Must match your React app's URL exactly (e.g., http://localhost:3000)
        //    Do NOT use "*" if you need credentials (like sending Authorization headers)
        configuration.setAllowedOrigins(List.of("http://localhost:5173")); // Adjust if your frontend runs elsewhere

        // 2. Specify allowed HTTP methods
        configuration.setAllowedMethods(
            Arrays.asList(
                HttpMethod.GET.name(),
                HttpMethod.POST.name(),
                HttpMethod.PUT.name(),
                HttpMethod.DELETE.name(),
                HttpMethod.OPTIONS.name() // Crucial for preflight requests
            )
        );

        // 3. Specify allowed headers
        //    Include standard headers and importantly "Authorization" for JWT,
        //    and "Content-Type". Add any other custom headers your frontend sends.
        configuration.setAllowedHeaders(
            Arrays.asList(
                "Authorization",
                "Cache-Control",
                "Content-Type",
                "Accept",
                "X-Requested-With",
                "*"
                // Add any other headers needed by your frontend
            )
        );

        // 4. Allow credentials (cookies, Authorization headers)
        //    Required if your frontend sends credentials.
        configuration.setAllowCredentials(true);

        // 5. (Optional) Specify exposed headers
        //    If your frontend needs to read headers from the response (e.g., a custom header)
        // configuration.setExposedHeaders(List.of("Custom-Header"));

        UrlBasedCorsConfigurationSource source =
            new UrlBasedCorsConfigurationSource();
        // Apply this configuration to all paths /**
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    @Order(Ordered.HIGHEST_PRECEDENCE)
    public CorsFilter corsFilter() {
        return new CorsFilter(corsConfigurationSource());
    }

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() throws Exception {
        return new JwtAuthenticationFilter(jwtTokenProvider, userRepository);
    }

    @Bean
    public AuthenticationManager authenticationManager(
        AuthenticationConfiguration authenticationConfiguration
    ) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
