package com.nutritionist.demo.Repositories;

import com.nutritionist.demo.Entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email); // pour login par email
    boolean existsByEmail(String email);      // pour vérifier si l'email existe
}
