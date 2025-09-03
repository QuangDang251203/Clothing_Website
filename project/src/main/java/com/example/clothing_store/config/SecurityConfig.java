package com.example.clothing_store.config;

import com.example.clothing_store.security.CustomOAuth2UserService;
import com.example.clothing_store.security.JwtAuthenticationFilter;
import com.example.clothing_store.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.*;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    private final JwtAuthenticationFilter jwtFilter;
    private final UserDetailsService uds;
    private final CustomOAuth2UserService oAuth2UserService;
    private final JwtUtil jwtUtil;

    @Value("${app.security.protected-endpoints}")
    private String[] protectedEndpoints;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())
                .sessionManagement(m -> m.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authz -> {
                    authz
                            .requestMatchers(
                                    "/api/auth/**",
                                    "/oauth2/**",
                                    "/oauth2/authorize/**",
                                    "/oauth2/callback/**"
                            ).permitAll();

                    // ... giữ nguyên các rule khác của bạn ...
                    authz.requestMatchers("/api/admin/**").hasRole("ADMIN");
                    // etc.
                    authz.anyRequest().permitAll();
                })
                .oauth2Login(oauth2 -> oauth2
                        .authorizationEndpoint(a -> a.baseUri("/oauth2/authorize"))
                        .redirectionEndpoint(r -> r.baseUri("/oauth2/callback/*"))
                        .userInfoEndpoint(u -> u.userService(oAuth2UserService))
                        .successHandler(this::oauth2SuccessHandler)
                )
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    private void oauth2SuccessHandler(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException {
        OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();
        String email = oauthUser.getAttribute("email");
        String token = jwtUtil.generateToken(email);
        response.sendRedirect("http://localhost:3000/oauth2/redirect?token=" + token);
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    // NOTE: removed passwordEncoder() from here!
}
