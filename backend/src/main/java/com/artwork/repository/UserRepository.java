package com.artwork.repository;

import com.artwork.entity.Role;
import com.artwork.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    List<User> findByRole(Role role);
    Page<User> findByRole(Role role, Pageable pageable);
    
    @Query("SELECT u FROM User u WHERE u.role = :role AND (LOWER(u.firstName) LIKE %:search% OR LOWER(u.lastName) LIKE %:search%)")
    Page<User> findByRoleAndNameContaining(Role role, String search, Pageable pageable);
}
