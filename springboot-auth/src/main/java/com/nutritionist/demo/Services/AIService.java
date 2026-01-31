package com.nutritionist.demo.Services;

import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.beans.factory.annotation.Value;
import jakarta.annotation.PostConstruct;

@Service
public class AIService {

    private WebClient webClient;

    // Default URL if not in properties, though it should be
    @Value("${ai.service.url:http://localhost:8000/api}")
    private String aiServiceUrl;

    public AIService() {
        // Default constructor
    }
    
    @PostConstruct
    public void init() {
        this.webClient = WebClient.builder()
                .baseUrl(aiServiceUrl)
                .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(16 * 1024 * 1024)) // 16MB buffer
                .build();
    }

    public String analyzeFoodImage(byte[] imageBytes, String filename, String userEmail) {
        try {
            MultipartBodyBuilder builder = new MultipartBodyBuilder();
            builder.part("file", new ByteArrayResource(imageBytes) {
                @Override
                public String getFilename() {
                    return filename;
                }
            });
            builder.part("user_email", userEmail);

            return webClient.post()
                    .uri("/analyze")
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(BodyInserters.fromMultipartData(builder.build()))
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
        } catch (Exception e) {
            e.printStackTrace();
            return "{\"error\": \"Failed to connect to AI Service: " + e.getMessage() + "\"}";
        }
    }
}
