package com.nutritionist.demo.Repositories;

import com.nutritionist.demo.Entities.History;
import com.nutritionist.demo.Entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HistoryRepository extends JpaRepository<History, Long> {
    List<History> findByUser(User user); // pour récupérer tous les historiques d'un utilisateur
}