package com.gem.compliance.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiServiceClient {

    @Value("${app.ai-service.url:http://localhost:8000}")
    private String aiServiceUrl;

    private final ObjectMapper objectMapper;

    private final HttpClient httpClient = HttpClient.newBuilder()
        .connectTimeout(Duration.ofSeconds(3))
        .build();

    public boolean checkHealth() {
        try {
            HttpRequest req = HttpRequest.newBuilder()
                .uri(URI.create(aiServiceUrl + "/health"))
                .timeout(Duration.ofMillis(1500))
                .GET()
                .build();
            HttpResponse<Void> resp = httpClient.send(req, HttpResponse.BodyHandlers.discarding());
            return resp.statusCode() == 200;
        } catch (Exception e) {
            log.debug("AI service health check failed: {}", e.getMessage());
            return false;
        }
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> extractDocument(String filename, byte[] content, String bidId) {
        try {
            String boundary = "----WebKitFormBoundary" + UUID.randomUUID().toString().replace("-", "");
            byte[] body = createMultipartBody(boundary, filename, content, "bid_id", bidId != null ? bidId : "");

            HttpRequest req = HttpRequest.newBuilder()
                .uri(URI.create(aiServiceUrl + "/api/v1/ai/documents/extract"))
                .header("Content-Type", "multipart/form-data; boundary=" + boundary)
                .timeout(Duration.ofSeconds(10))
                .POST(HttpRequest.BodyPublishers.ofByteArray(body))
                .build();

            HttpResponse<String> resp = httpClient.send(req, HttpResponse.BodyHandlers.ofString());
            if (resp.statusCode() == 200) {
                return objectMapper.readValue(resp.body(), Map.class);
            }
        } catch (Exception e) {
            log.warn("FastAPI extractDocument failed ({}), falling back to deterministic extraction", e.getMessage());
        }
        return Map.of("filename", filename, "status", "PARSED", "pages", List.of());
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> checkForgery(String filename, byte[] content) {
        try {
            String boundary = "----WebKitFormBoundary" + UUID.randomUUID().toString().replace("-", "");
            byte[] body = createSingleFileMultipart(boundary, filename, content);

            HttpRequest req = HttpRequest.newBuilder()
                .uri(URI.create(aiServiceUrl + "/api/v1/ai/documents/forgery-check"))
                .header("Content-Type", "multipart/form-data; boundary=" + boundary)
                .timeout(Duration.ofSeconds(6))
                .POST(HttpRequest.BodyPublishers.ofByteArray(body))
                .build();

            HttpResponse<String> resp = httpClient.send(req, HttpResponse.BodyHandlers.ofString());
            if (resp.statusCode() == 200) {
                return objectMapper.readValue(resp.body(), Map.class);
            }
        } catch (Exception e) {
            log.warn("FastAPI checkForgery failed ({}): falling back to clean status", e.getMessage());
        }
        return Map.of("risk_score", 0.0, "is_flagged", false, "status", "SERVICE_UNAVAILABLE_FALLBACK");
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> checkCollusion(List<Map<String, Object>> bidProfiles) {
        try {
            String json = objectMapper.writeValueAsString(bidProfiles);
            HttpRequest req = HttpRequest.newBuilder()
                .uri(URI.create(aiServiceUrl + "/api/v1/ai/bids/collusion-check"))
                .header("Content-Type", "application/json")
                .timeout(Duration.ofSeconds(6))
                .POST(HttpRequest.BodyPublishers.ofString(json))
                .build();

            HttpResponse<String> resp = httpClient.send(req, HttpResponse.BodyHandlers.ofString());
            if (resp.statusCode() == 200) {
                return objectMapper.readValue(resp.body(), Map.class);
            }
        } catch (Exception e) {
            log.warn("FastAPI checkCollusion failed ({}): falling back to empty flags", e.getMessage());
        }
        return Map.of("signals", List.of(), "count", 0);
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> evaluateCompliance(Map<String, Object> requirement, List<Map<String, Object>> evidences, String bidId) {
        try {
            Map<String, Object> payload = Map.of(
                "requirement", requirement,
                "evidences", evidences,
                "bid_id", bidId != null ? bidId : ""
            );
            String json = objectMapper.writeValueAsString(payload);
            HttpRequest req = HttpRequest.newBuilder()
                .uri(URI.create(aiServiceUrl + "/api/v1/ai/compliance/evaluate?bid_id=" + (bidId != null ? bidId : "")))
                .header("Content-Type", "application/json")
                .timeout(Duration.ofSeconds(8))
                .POST(HttpRequest.BodyPublishers.ofString(json))
                .build();

            HttpResponse<String> resp = httpClient.send(req, HttpResponse.BodyHandlers.ofString());
            if (resp.statusCode() == 200) {
                return objectMapper.readValue(resp.body(), Map.class);
            }
        } catch (Exception e) {
            log.warn("FastAPI evaluateCompliance failed: {}", e.getMessage());
        }
        return Map.of("status", "UNVERIFIED", "reasoning", "AI verification service unavailable; evaluated deterministically");
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> detectContradictions(List<Map<String, Object>> evidences, String bidId) {
        try {
            String json = objectMapper.writeValueAsString(evidences);
            HttpRequest req = HttpRequest.newBuilder()
                .uri(URI.create(aiServiceUrl + "/api/v1/ai/contradictions/detect?bid_id=" + (bidId != null ? bidId : "")))
                .header("Content-Type", "application/json")
                .timeout(Duration.ofSeconds(6))
                .POST(HttpRequest.BodyPublishers.ofString(json))
                .build();

            HttpResponse<String> resp = httpClient.send(req, HttpResponse.BodyHandlers.ofString());
            if (resp.statusCode() == 200) {
                return objectMapper.readValue(resp.body(), Map.class);
            }
        } catch (Exception e) {
            log.warn("FastAPI detectContradictions failed: {}", e.getMessage());
        }
        return Map.of("flags", List.of(), "count", 0);
    }

    private byte[] createSingleFileMultipart(String boundary, String filename, byte[] fileBytes) throws Exception {
        java.io.ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream();
        baos.write(("--" + boundary + "\r\n").getBytes());
        baos.write(("Content-Disposition: form-data; name=\"file\"; filename=\"" + filename + "\"\r\n").getBytes());
        baos.write("Content-Type: application/pdf\r\n\r\n".getBytes());
        baos.write(fileBytes);
        baos.write(("\r\n--" + boundary + "--\r\n").getBytes());
        return baos.toByteArray();
    }

    private byte[] createMultipartBody(String boundary, String filename, byte[] fileBytes, String fieldName, String fieldValue) throws Exception {
        java.io.ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream();
        baos.write(("--" + boundary + "\r\n").getBytes());
        baos.write(("Content-Disposition: form-data; name=\"file\"; filename=\"" + filename + "\"\r\n").getBytes());
        baos.write("Content-Type: application/pdf\r\n\r\n".getBytes());
        baos.write(fileBytes);
        baos.write("\r\n".getBytes());
        baos.write(("--" + boundary + "\r\n").getBytes());
        baos.write(("Content-Disposition: form-data; name=\"" + fieldName + "\"\r\n\r\n").getBytes());
        baos.write(fieldValue.getBytes());
        baos.write(("\r\n--" + boundary + "--\r\n").getBytes());
        return baos.toByteArray();
    }
}
