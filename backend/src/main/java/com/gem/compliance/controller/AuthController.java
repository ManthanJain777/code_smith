package com.gem.compliance.controller;

import com.gem.compliance.domain.User;
import com.gem.compliance.security.JwtTokenProvider;
import com.gem.compliance.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Authentication & User API", description = "Endpoints for login, logout, session restoration, and RBAC permissions")
public class AuthController {

    private final JwtTokenProvider tokenProvider;
    private final UserService userService;
    private final com.gem.compliance.service.TokenDenylistService tokenDenylistService;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LoginRequest {
        private String email;
        private String password;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class UserProfileResponse {
        private String userId;
        private String email;
        private String fullName;
        private String role;
        private String organizationId;
        private List<String> permissions;
    }

    @Data
    @AllArgsConstructor
    public static class LoginResponse {
        private String token;
        private String tokenType;
        private String userId;
        private String email;
        private String fullName;
        private String role;
        private String organizationId;
        private List<String> permissions;
    }

    @PostMapping("/auth/login")
    @Operation(summary = "Authenticate user and issue JWT token", description = "Validates user credentials against DB and returns a signed JWT token with permissions.")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        Optional<User> userOpt = userService.authenticate(request.getEmail(), request.getPassword());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "Unauthorized", "message", "Invalid email or password credentials."));
        }

        User user = userOpt.get();
        String token = tokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole());
        List<String> permissions = userService.getPermissionsForRole(user.getRole());

        return ResponseEntity.ok(new LoginResponse(
            token,
            "Bearer",
            user.getId(),
            user.getEmail(),
            user.getFullName(),
            user.getRole(),
            user.getOrganizationId(),
            permissions
        ));
    }

    @GetMapping("/auth/me")
    @Operation(summary = "Get current authenticated user profile", description = "Returns active user session details and permissions from JWT context.")
    public ResponseEntity<?> getCurrentUserSession() {
        Optional<User> userOpt = userService.getCurrentUser();
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "Unauthorized", "message", "No active authentication session."));
        }

        User user = userOpt.get();
        List<String> permissions = userService.getPermissionsForRole(user.getRole());
        return ResponseEntity.ok(new UserProfileResponse(
            user.getId(),
            user.getEmail(),
            user.getFullName(),
            user.getRole(),
            user.getOrganizationId(),
            permissions
        ));
    }

    @PostMapping("/auth/logout")
    @Operation(summary = "Logout user", description = "Revokes server-side JWT and clears security context.")
    public ResponseEntity<?> logout(jakarta.servlet.http.HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            tokenDenylistService.denylistToken(token);
        }
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok(Map.of("message", "Successfully logged out. JWT token revoked and invalidated on server."));
    }

    @PostMapping("/auth/refresh")
    @Operation(summary = "Refresh JWT token", description = "Issues a fresh JWT token for authenticated active user.")
    public ResponseEntity<?> refreshToken() {
        Optional<User> userOpt = userService.getCurrentUser();
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "Unauthorized", "message", "Cannot refresh token without valid session."));
        }

        User user = userOpt.get();
        String newToken = tokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole());
        List<String> permissions = userService.getPermissionsForRole(user.getRole());

        return ResponseEntity.ok(new LoginResponse(
            newToken,
            "Bearer",
            user.getId(),
            user.getEmail(),
            user.getFullName(),
            user.getRole(),
            user.getOrganizationId(),
            permissions
        ));
    }

    @GetMapping("/users/me/permissions")
    @Operation(summary = "Get RBAC permission array for active user", description = "Returns list of permission strings granted to current user role.")
    public ResponseEntity<?> getUserPermissions() {
        Optional<User> userOpt = userService.getCurrentUser();
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "Unauthorized", "message", "User unauthenticated."));
        }
        User user = userOpt.get();
        List<String> permissions = userService.getPermissionsForRole(user.getRole());
        return ResponseEntity.ok(Map.of("role", user.getRole(), "permissions", permissions));
    }
}
