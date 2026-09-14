package com.gem.compliance.service;

import com.gem.compliance.domain.User;
import com.gem.compliance.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.env.Environment;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final Environment env;

    @PostConstruct
    public void validateProfileSecurity() {
        boolean isProd = Arrays.asList(env.getActiveProfiles()).contains("prod") 
                      || Arrays.asList(env.getActiveProfiles()).contains("production");
        boolean isDemo = Arrays.asList(env.getActiveProfiles()).contains("demo");
        if (isProd && isDemo) {
            throw new IllegalStateException("FATAL SECURITY VIOLATION: The 'demo' profile cannot be active concurrently with 'prod' profile!");
        }
        if (isProd) {
            log.info("PRODUCTION SECURITY GUARD ACTIVE: All password bypasses and synthetic demo user fallbacks are strictly disabled.");
        }
    }

    private boolean isDemoProfileActive() {
        return Arrays.asList(env.getActiveProfiles()).contains("demo");
    }

    public Optional<User> authenticate(String email, String password) {
        if (email == null || password == null) {
            return Optional.empty();
        }
        
        String cleanEmail = email.trim().toLowerCase();
        Optional<User> userOpt = findByIdOrEmail(cleanEmail);

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            // Production cryptographic password check
            if (passwordEncoder.matches(password, user.getPasswordHash())) {
                return Optional.of(user);
            }
            // Demo plaintext password bypass strictly permitted ONLY under explicit 'demo' profile
            if (isDemoProfileActive() && ("Password123!".equals(password) 
                || "demo".equalsIgnoreCase(password)
                || "pass".equalsIgnoreCase(password)
                || "password".equalsIgnoreCase(password))) {
                log.warn("DEMO PROFILE AUTH: Plaintext password bypass permitted for user '{}'", cleanEmail);
                return Optional.of(user);
            }
        }

        // Demo Fallback for standard demo accounts strictly isolated to 'demo' profile
        if (isDemoProfileActive() && ("Password123!".equals(password) 
            || "demo".equalsIgnoreCase(password) 
            || "pass".equalsIgnoreCase(password)
            || "password".equalsIgnoreCase(password))) {
            User demoUser = buildFallbackDemoUser(cleanEmail);
            if (demoUser != null) {
                return Optional.of(demoUser);
            }
        }

        return Optional.empty();
    }

    public Optional<User> findByIdOrEmail(String identifier) {
        if (identifier == null || identifier.trim().isEmpty()) return Optional.empty();
        String clean = identifier.trim().toLowerCase();
        
        // Try searching by direct Primary Key User ID
        Optional<User> u = userRepository.findById(identifier);
        if (u.isPresent()) return u;

        // Try searching by Email
        u = userRepository.findByEmailIgnoreCase(clean);
        if (u.isPresent()) return u;

        // Fallback demo user match strictly isolated to 'demo' profile
        if (isDemoProfileActive()) {
            return Optional.ofNullable(buildFallbackDemoUser(clean));
        }
        return Optional.empty();
    }

    public Optional<User> findByEmail(String email) {
        return findByIdOrEmail(email);
    }

    public Optional<User> getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return Optional.empty();
        }
        String principalName = auth.getName();
        return findByIdOrEmail(principalName);
    }

    public List<String> getPermissionsForRole(String role) {
        if (role == null) return Collections.emptyList();
        String normalized = role.toUpperCase().replace("ROLE_", "");
        switch (normalized) {
            case "SYSTEM_ADMIN":
            case "ADMIN":
                return List.of(
                    "tenders:read", "tenders:write", "tenders:delete",
                    "compliance:read", "compliance:write", "reviews:write",
                    "audit:read", "sellers:read", "sellers:write", "sellers:override",
                    "users:manage"
                );
            case "PROCUREMENT_OFFICER":
                return List.of(
                    "tenders:read", "tenders:write",
                    "compliance:read", "compliance:write", "reviews:write",
                    "audit:read", "sellers:read", "sellers:write", "sellers:override"
                );
            case "COMPLIANCE_REVIEWER":
                return List.of(
                    "tenders:read", "compliance:read", "compliance:write",
                    "reviews:write", "audit:read", "sellers:read"
                );
            case "VIEWER":
            case "AUDITOR":
                return List.of(
                    "tenders:read", "compliance:read", "audit:read", "sellers:read", "reviews:read"
                );
            case "BIDDER_VENDOR":
            case "BIDDER":
                return List.of(
                    "tenders:read", "bids:create", "bids:read_own", "documents:upload", "compliance:read_own"
                );
            default:
                return List.of("tenders:read");
        }
    }

    private User buildFallbackDemoUser(String emailOrId) {
        String key = emailOrId.toLowerCase();
        if (key.contains("admin") || key.contains("usr-demo-admin")) {
            return User.builder()
                .id("USR-DEMO-ADMIN")
                .organizationId("ORG-001")
                .email("admin.demo@gembid.local")
                .passwordHash("$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a")
                .fullName("System Admin (Demo)")
                .role("SYSTEM_ADMIN")
                .isActive(true)
                .build();
        } else if (key.contains("procurement") || key.contains("officer") || key.contains("usr-demo-proc") || key.contains("usr-proc-01")) {
            return User.builder()
                .id("USR-DEMO-PROC")
                .organizationId("ORG-001")
                .email("procurement.demo@gembid.local")
                .passwordHash("$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a")
                .fullName("Rajesh Kumar (Procurement Officer Demo)")
                .role("PROCUREMENT_OFFICER")
                .isActive(true)
                .build();
        } else if (key.contains("reviewer") || key.contains("usr-demo-rev") || key.contains("usr-rev-01")) {
            return User.builder()
                .id("USR-DEMO-REV")
                .organizationId("ORG-001")
                .email("reviewer.demo@gembid.local")
                .passwordHash("$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a")
                .fullName("Anita Sharma (Compliance Reviewer Demo)")
                .role("COMPLIANCE_REVIEWER")
                .isActive(true)
                .build();
        } else if (key.contains("auditor") || key.contains("usr-demo-aud")) {
            return User.builder()
                .id("USR-DEMO-AUD")
                .organizationId("ORG-001")
                .email("auditor.demo@gembid.local")
                .passwordHash("$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a")
                .fullName("Vikram Sethi (Auditor Demo)")
                .role("AUDITOR")
                .isActive(true)
                .build();
        } else if (key.contains("bidder") || key.contains("usr-demo-bid")) {
            return User.builder()
                .id("USR-DEMO-BID")
                .organizationId("ORG-001")
                .email("bidder.demo@gembid.local")
                .passwordHash("$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a")
                .fullName("Apex Pumps Vendor Representative")
                .role("BIDDER_VENDOR")
                .isActive(true)
                .build();
        }
        return null;
    }
}
