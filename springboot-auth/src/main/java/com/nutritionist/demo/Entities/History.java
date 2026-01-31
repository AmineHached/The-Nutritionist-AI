package com.nutritionist.demo.Entities;

import java.time.LocalDateTime; 
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import com.fasterxml.jackson.annotation.JsonBackReference;


@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class History {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    private String action; // ou message, description, etc.4
    
    private Double calories;
    private Double protein;
    private Double carbs;
    private Double fat;
    
    @Column(length = 2000)
    private String foodItems; // Comma separated list of food items

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}