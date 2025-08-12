package com.artwork.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.util.HashMap;
import java.util.Map;

/**
 * Controller for health checks and system information
 */
@RestController
@RequestMapping("/api/health")
public class HealthCheckController {

    @Value("${application.railway.project.name:unknown}")
    private String projectName;

    @Value("${application.railway.environment.name:unknown}")
    private String environmentName;

    @Autowired(required = false)
    private DataSource dataSource;

    /**
     * Health check endpoint for Railway
     * @return Health status and basic system information
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("timestamp", System.currentTimeMillis());
        
        // System information
        Map<String, String> systemInfo = new HashMap<>();
        systemInfo.put("projectName", projectName);
        systemInfo.put("environmentName", environmentName);
        systemInfo.put("javaVersion", System.getProperty("java.version"));
        systemInfo.put("availableProcessors", String.valueOf(Runtime.getRuntime().availableProcessors()));
        systemInfo.put("freeMemory", String.valueOf(Runtime.getRuntime().freeMemory() / 1024 / 1024) + " MB");
        
        // Database connectivity check
        Map<String, String> databaseInfo = new HashMap<>();
        if (dataSource != null) {
            try (Connection connection = dataSource.getConnection()) {
                databaseInfo.put("status", "CONNECTED");
                databaseInfo.put("url", connection.getMetaData().getURL());
            } catch (Exception e) {
                databaseInfo.put("status", "ERROR");
                databaseInfo.put("error", e.getMessage());
            }
        } else {
            databaseInfo.put("status", "NO_DATASOURCE");
        }
        
        response.put("system", systemInfo);
        response.put("database", databaseInfo);
        
        return ResponseEntity.ok(response);
    }
}
