#!/bin/bash
# Test des endpoints d'authentification

API_URL="http://localhost:8080/api/users"

echo "=== Test 1: Register ==="
curl -X POST "$API_URL/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username":"TestUser",
    "email":"test@example.com",
    "password":"TestPass123",
    "poids":75.5,
    "taille":180,
    "age":28
  }' | jq '.'

echo -e "\n=== Test 2: Login ==="
curl -X POST "$API_URL/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "password":"TestPass123"
  }' | jq '.'

echo -e "\n✅ Tests complétés"
