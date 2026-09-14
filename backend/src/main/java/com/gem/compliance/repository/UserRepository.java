package com.gem.compliance.repository;

import com.gem.compliance.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByEmail(String email);
    Optional<User> findByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCase(String email);
    java.util.List<User> findByRole(String role);
    java.util.List<User> findByRoleIn(java.util.List<String> roles);
}
