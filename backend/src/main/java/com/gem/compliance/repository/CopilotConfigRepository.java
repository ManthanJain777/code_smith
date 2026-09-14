package com.gem.compliance.repository;

import com.gem.compliance.domain.CopilotConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CopilotConfigRepository extends JpaRepository<CopilotConfig, String> {
    Optional<CopilotConfig> findByRole(String role);
}
