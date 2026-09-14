package com.gem.compliance.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(exception -> exception.authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)))
            .authorizeHttpRequests(auth -> auth
                // Public Documentation, Health & Error Dispatch Endpoints
                .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html", "/actuator/health", "/api/v1/health", "/error").permitAll()
                // Explicit Public Auth Endpoint for Dev/Demo Token Generation
                .requestMatchers("/api/v1/auth/**").permitAll()

                // Vendor's own profile self-service & DigiLocker sync (Specific patterns registered BEFORE broader /sellers/**)
                .requestMatchers(
                    "/api/v1/sellers/me",
                    "/api/v1/sellers/me/**",
                    "/api/v1/sellers/*/digilocker-sync",
                    "/api/v1/sellers/my-status"
                ).hasAnyAuthority(
                    "BIDDER_VENDOR", "BIDDER", "PROCUREMENT_OFFICER", "COMPLIANCE_REVIEWER", "SYSTEM_ADMIN",
                    "ROLE_BIDDER_VENDOR", "ROLE_BIDDER", "ROLE_PROCUREMENT_OFFICER", "ROLE_COMPLIANCE_REVIEWER", "ROLE_SYSTEM_ADMIN"
                )
                // Seller Verification Queue - strictly Committee (Officer, Reviewer, Admin) - Auditor & Bidder are BLOCKED
                .requestMatchers("/api/v1/sellers", "/api/v1/sellers/**").hasAnyAuthority(
                    "PROCUREMENT_OFFICER", "COMPLIANCE_REVIEWER", "SYSTEM_ADMIN",
                    "ROLE_PROCUREMENT_OFFICER", "ROLE_COMPLIANCE_REVIEWER", "ROLE_SYSTEM_ADMIN"
                )

                // Contradiction Resolution - Reviewer and System Admin ONLY (Officer, Auditor, Bidder are strictly BLOCKED)
                .requestMatchers("/api/v1/compliance/contradictions/resolve").hasAnyAuthority(
                    "COMPLIANCE_REVIEWER", "SYSTEM_ADMIN",
                    "ROLE_COMPLIANCE_REVIEWER", "ROLE_SYSTEM_ADMIN"
                )

                // Reviewer Personal Calibration - Reviewer and Admin only
                .requestMatchers("/api/v1/reviews/calibration/me").hasAnyAuthority(
                    "COMPLIANCE_REVIEWER", "SYSTEM_ADMIN",
                    "ROLE_COMPLIANCE_REVIEWER", "ROLE_SYSTEM_ADMIN"
                )

                // Human Reviews & Overrides - strictly officers, reviewers, and admin
                .requestMatchers("/api/v1/reviews", "/api/v1/reviews/**", "/api/v1/compliance/override").hasAnyAuthority(
                    "PROCUREMENT_OFFICER", "COMPLIANCE_REVIEWER", "SYSTEM_ADMIN",
                    "ROLE_PROCUREMENT_OFFICER", "ROLE_COMPLIANCE_REVIEWER", "ROLE_SYSTEM_ADMIN"
                )

                // Multi-bidder listing per tender - Officer, Reviewer, Auditor, Admin, and Bidder (Bidder scoped in controller)
                .requestMatchers("/api/v1/bids/tender/**").hasAnyAuthority(
                    "PROCUREMENT_OFFICER", "COMPLIANCE_REVIEWER", "AUDITOR", "VIEWER", "SYSTEM_ADMIN", "BIDDER_VENDOR", "BIDDER",
                    "ROLE_PROCUREMENT_OFFICER", "ROLE_COMPLIANCE_REVIEWER", "ROLE_AUDITOR", "ROLE_VIEWER", "ROLE_SYSTEM_ADMIN", "ROLE_BIDDER_VENDOR", "ROLE_BIDDER"
                )

                // Dedicated Auditor, Officer & Admin views: Collusion flags, Debarment history, Human override log
                .requestMatchers(
                    "/api/v1/audit/collusion-flags",
                    "/api/v1/audit/debarment-history",
                    "/api/v1/audit/overrides"
                ).hasAnyAuthority(
                    "AUDITOR", "VIEWER", "SYSTEM_ADMIN", "PROCUREMENT_OFFICER",
                    "ROLE_AUDITOR", "ROLE_VIEWER", "ROLE_SYSTEM_ADMIN", "ROLE_PROCUREMENT_OFFICER"
                )

                // Audit Trail & Blockchain verification - internal oversight (Bidder is BLOCKED)
                .requestMatchers("/api/v1/audit", "/api/v1/audit/**").hasAnyAuthority(
                    "PROCUREMENT_OFFICER", "COMPLIANCE_REVIEWER", "SYSTEM_ADMIN", "AUDITOR", "VIEWER",
                    "ROLE_PROCUREMENT_OFFICER", "ROLE_COMPLIANCE_REVIEWER", "ROLE_SYSTEM_ADMIN", "ROLE_AUDITOR", "ROLE_VIEWER"
                )

                // System Admin Exclusive Panel Endpoints
                .requestMatchers("/api/v1/admin/**").hasAnyAuthority("SYSTEM_ADMIN", "ROLE_SYSTEM_ADMIN")

                // Dynamic Permissions, Copilot Configuration & Query Endpoints
                .requestMatchers("/api/v1/permissions/**", "/api/v1/copilot/**").authenticated()

                // Protected Business APIs Require Authentication
                .requestMatchers("/api/v1/tenders", "/api/v1/tenders/**").authenticated()
                .requestMatchers("/api/v1/bids", "/api/v1/bids/**").authenticated()
                .requestMatchers("/api/v1/compliance", "/api/v1/compliance/**").authenticated()
                .requestMatchers("/api/v1/notifications", "/api/v1/notifications/**").authenticated()
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of(
            "http://localhost:[*]",
            "http://127.0.0.1:[*]",
            "https://*.gembid.local",
            "https://*.gov.in"
        ));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
