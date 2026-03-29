#!/bin/bash

# Скрипт для быстрого тестирования API SportLink
# Использование: ./test-api.sh

BASE_URL="http://localhost:8080"
TOKEN=""

echo_info() {
    echo -e "\033[1;33m>>> $1\033[0m"
}

echo_success() {
    echo -e "\033[0;32m✓ $1\033[0m"
}

echo_error() {
    echo -e "\033[0;31m✗ $1\033[0m"
}

# 1. Проверка доступности сервисов
echo_info "1. Проверка доступности Gateway..."
HEALTH=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/actuator/health")
if [ "$HEALTH" == "200" ]; then
    echo_success "Gateway доступен"
else
    echo_error "Gateway недоступен (status: $HEALTH)"
    exit 1
fi

# 2. Логин (используем тестового пользователя)
echo_info "\n2. Логин..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user1@sportlink.ru",
    "password": "user123"
  }')

TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.accessToken // empty')

if [ -n "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
    echo_success "Логин успешен, токен получен"
    echo "  Token: ${TOKEN:0:50}..."
else
    echo_error "Ошибка логина"
    
    # Пробуем создать нового пользователя и логинимся
    echo_info "\n  Пробуем зарегистрировать нового пользователя..."
    REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/auth/register" \
      -H "Content-Type: application/json" \
      -d "{
        \"email\": \"test$(date +%s)@example.com\",
        \"password\": \"password123\",
        \"name\": \"Тестовый Пользователь\"
      }")
    
    if echo "$REGISTER_RESPONSE" | jq -e '.userId' > /dev/null 2>&1; then
        echo_success "  Регистрация успешна"
        
        # Теперь логинимся с новым пользователем
        EMAIL=$(echo "$REGISTER_RESPONSE" | jq -r '.email // empty')
        LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/auth/login" \
          -H "Content-Type: application/json" \
          -d "{\"email\": \"$EMAIL\", \"password\": \"password123\"}")
        
        TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.accessToken // empty')
        if [ -n "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
            echo_success "  Логин успешен"
        else
            echo_error "  Не удалось залогиниться"
            exit 1
        fi
    else
        echo_error "  Не удалось зарегистрировать пользователя"
        exit 1
    fi
fi

# 3. Получение списка площадок
echo_info "\n3. Получение списка спортивных площадок..."
PLACES_RESPONSE=$(curl -s "$BASE_URL/api/v1/sports-places" \
  -H "Authorization: Bearer $TOKEN")

PLACES_COUNT=$(echo "$PLACES_RESPONSE" | jq 'length')
echo "Найдено площадок: $PLACES_COUNT"

if [ "$PLACES_COUNT" -gt 0 ]; then
    echo_success "Площадки получены"
    echo "  Первая площадка:"
    echo "$PLACES_RESPONSE" | jq '.[0]'
    
    # Сохраняем ID первой площадки для создания матча
    SPORTS_PLACE_ID=$(echo "$PLACES_RESPONSE" | jq '.[0].id')
else
    echo_error "Площадки не найдены"
    SPORTS_PLACE_ID=1
fi

# 4. Получение профиля текущего пользователя
echo_info "\n4. Получение профиля..."
PROFILE_RESPONSE=$(curl -s "$BASE_URL/api/v1/profiles/my" \
  -H "Authorization: Bearer $TOKEN")

if echo "$PROFILE_RESPONSE" | jq -e 'type == "object"' > /dev/null 2>&1; then
    echo_success "Профиль получен"
    echo "$PROFILE_RESPONSE" | jq '.'
else
    echo_info "Профиль не найден (нужно создать)"
fi

# 5. Создание/обновление профиля
echo_info "\n5. Создание/обновление профиля..."
PROFILE_CREATE_RESPONSE=$(curl -s -X PUT "$BASE_URL/api/v1/profiles/my" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "city": "Москва",
    "description": "Люблю спорт!",
    "sports": [
      {
        "sport": "FOOTBALL",
        "level": 2,
        "description": "Играю по выходным"
      }
    ]
  }')

if echo "$PROFILE_CREATE_RESPONSE" | jq -e '.id' > /dev/null 2>&1; then
    echo_success "Профиль создан/обновлён"
    echo "  ID: $(echo "$PROFILE_CREATE_RESPONSE" | jq -r '.id')"
    echo "  Name: $(echo "$PROFILE_CREATE_RESPONSE" | jq -r '.name')"
    echo "  City: $(echo "$PROFILE_CREATE_RESPONSE" | jq -r '.city')"
else
    echo_error "Ошибка создания профиля"
fi

# 6. Создание матча
echo_info "\n6. Создание матча..."
MATCH_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/matches" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"title\": \"Тестовый матч\",
    \"sport\": \"FOOTBALL\",
    \"scheduledAt\": \"2024-04-15T18:00:00\",
    \"sportsPlaceId\": $SPORTS_PLACE_ID,
    \"maxParticipants\": 10,
    \"minLevel\": 1,
    \"maxLevel\": 5,
    \"description\": \"Приглашаю всех желающих\"
  }")

MATCH_ID=$(echo "$MATCH_RESPONSE" | jq -r '.id // empty')

if [ -n "$MATCH_ID" ] && [ "$MATCH_ID" != "null" ]; then
    echo_success "Матч создан (ID: $MATCH_ID)"
    echo "  Title: $(echo "$MATCH_RESPONSE" | jq -r '.title')"
    echo "  Sport: $(echo "$MATCH_RESPONSE" | jq -r '.sport')"
    echo "  Sports Place ID: $(echo "$MATCH_RESPONSE" | jq -r '.sportsPlaceId')"
else
    echo_error "Ошибка создания матча"
    MATCH_ID=""
fi

# 7. Получение списка матчей
echo_info "\n7. Получение списка матчей..."
MATCHES_RESPONSE=$(curl -s "$BASE_URL/api/v1/matches" \
  -H "Authorization: Bearer $TOKEN")

MATCHES_COUNT=$(echo "$MATCHES_RESPONSE" | jq 'length')
echo "Всего матчей: $MATCHES_COUNT"

if [ "$MATCHES_COUNT" -gt 0 ]; then
    echo_success "Матчи получены"
    echo "  Матчи:"
    echo "$MATCHES_RESPONSE" | jq '.[] | "    - \(.title) (\(.sport))"'
else
    echo_error "Матчи не найдены"
fi

# Итоги
echo_info "\n========================================="
echo "Тестирование завершено!"
echo "========================================="
echo "Токен: $TOKEN"
echo "Матч ID: ${MATCH_ID:-не создан}"
echo ""
echo "Полезные команды:"
echo "  # Получить площадки:"
echo "  curl $BASE_URL/api/v1/sports-places -H 'Authorization: Bearer \$TOKEN'"
echo ""
echo "  # Получить матчи:"
echo "  curl $BASE_URL/api/v1/matches -H 'Authorization: Bearer \$TOKEN'"
echo ""
echo "  # Получить профиль:"
echo "  curl $BASE_URL/api/v1/profiles/my -H 'Authorization: Bearer \$TOKEN'"
