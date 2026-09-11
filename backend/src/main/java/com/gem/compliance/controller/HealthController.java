package com.gem.compliance.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@Tag(name = "System Health", description = "Public health check endpoint for microservice health verification")
public class HealthController {

    @GetMapping("/health")
    @Operation(summary = "Health check", description = "Public health status endpoint for backend service verification")
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
            "status", "UP",
            "service", "sih26100-backend",
            "version", "1.0.0",
            "timestamp", Instant.now().toString(),
            "port", 8080
        ));
    }
}
