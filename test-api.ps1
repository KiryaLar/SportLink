# Скрипт для быстрого тестирования API SportLink
# Использование: .\test-api.ps1

$BASE_URL = "http://localhost:8080"
$TOKEN = ""

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "SportLink API Testing Script" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# 1. Проверка доступности сервисов
Write-Host "`n[1] Проверка доступности Gateway..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "$BASE_URL/actuator/health" -Method Get -ErrorAction Stop
    Write-Host "✓ Gateway доступен" -ForegroundColor Green
    Write-Host "  Status: $($healthResponse.status)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Gateway недоступен" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 2. Логин (используем тестового пользователя)
Write-Host "`n[2] Логин..." -ForegroundColor Yellow
try {
    $loginBody = @{
        email = "user1@sportlink.ru"
        password = "user123"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "$BASE_URL/api/v1/auth/login" `
        -Method Post `
        -ContentType "application/json" `
        -Body $loginBody

    $TOKEN = $loginResponse.accessToken
    Write-Host "✓ Логин успешен" -ForegroundColor Green
    Write-Host "  Token: $($TOKEN.Substring(0, 50))..." -ForegroundColor Gray
} catch {
    Write-Host "✗ Ошибка логина" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    
    # Пробуем создать нового пользователя и логинимся
    Write-Host "`n  Пробуем зарегистрировать нового пользователя..." -ForegroundColor Yellow
    try {
        $registerBody = @{
            email = "test$(Get-Date -Format 'yyyyMMddHHmmss')@example.com"
            password = "password123"
            name = "Тестовый Пользователь"
        } | ConvertTo-Json

        $registerResponse = Invoke-RestMethod -Uri "$BASE_URL/api/v1/auth/register" `
            -Method Post `
            -ContentType "application/json" `
            -Body $registerBody

        Write-Host "  ✓ Регистрация успешна: $($registerResponse.userId)" -ForegroundColor Green

        # Теперь логинимся
        $loginBody = @{
            email = $registerBody.email | ConvertFrom-Json
            password = "password123"
        } | ConvertTo-Json

        $loginResponse = Invoke-RestMethod -Uri "$BASE_URL/api/v1/auth/login" `
            -Method Post `
            -ContentType "application/json" `
            -Body $loginBody

        $TOKEN = $loginResponse.accessToken
        Write-Host "  ✓ Логин успешен" -ForegroundColor Green
    } catch {
        Write-Host "`n  ✗ Не удалось зарегистрировать пользователя" -ForegroundColor Red
        Write-Host "  Убедитесь, что Keycloak запущен и realm импортирован" -ForegroundColor Yellow
        exit 1
    }
}

# 3. Получение списка площадок
Write-Host "`n[3] Получение списка спортивных площадок..." -ForegroundColor Yellow
try {
    $placesResponse = Invoke-RestMethod -Uri "$BASE_URL/api/v1/sports-places" `
        -Method Get `
        -Headers @{ Authorization = "Bearer $TOKEN" }

    $placesCount = $placesResponse.Count
    Write-Host "✓ Найдено площадок: $placesCount" -ForegroundColor Green
    
    if ($placesCount -gt 0) {
        Write-Host "  Первая площадка:" -ForegroundColor Gray
        $placesResponse[0] | ConvertTo-Json -Depth 3
    }
} catch {
    Write-Host "✗ Ошибка получения площадок" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. Получение профиля текущего пользователя
Write-Host "`n[4] Получение профиля..." -ForegroundColor Yellow
try {
    $profileResponse = Invoke-RestMethod -Uri "$BASE_URL/api/v1/profiles/my" `
        -Method Get `
        -Headers @{ Authorization = "Bearer $TOKEN" }

    Write-Host "✓ Профиль получен" -ForegroundColor Green
    $profileResponse | ConvertTo-Json -Depth 3
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 404) {
        Write-Host "ℹ Профиль не найден (нужно создать)" -ForegroundColor Yellow
    } else {
        Write-Host "✗ Ошибка получения профиля" -ForegroundColor Red
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 5. Создание/обновление профиля
Write-Host "`n[5] Создание/обновление профиля..." -ForegroundColor Yellow
try {
    $profileBody = @{
        city = "Москва"
        description = "Люблю спорт!"
        sports = @(
            @{
                sport = "FOOTBALL"
                level = 2
                description = "Играю по выходным"
            }
        )
    } | ConvertTo-Json -Depth 3

    $profileResponse = Invoke-RestMethod -Uri "$BASE_URL/api/v1/profiles/my" `
        -Method Put `
        -ContentType "application/json" `
        -Headers @{ Authorization = "Bearer $TOKEN" } `
        -Body $profileBody

    Write-Host "✓ Профиль создан/обновлён" -ForegroundColor Green
    Write-Host "  ID: $($profileResponse.id)" -ForegroundColor Gray
    Write-Host "  Name: $($profileResponse.name)" -ForegroundColor Gray
    Write-Host "  City: $($profileResponse.city)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Ошибка создания профиля" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
}

# 6. Создание матча
Write-Host "`n[6] Создание матча..." -ForegroundColor Yellow
try {
    $matchBody = @{
        title = "Тестовый матч"
        sport = "FOOTBALL"
        scheduledAt = "2024-04-15T18:00:00"
        locationName = "Парк Горького"
        latitude = 55.7297
        longitude = 37.6015
        maxParticipants = 10
        minLevel = 1
        maxLevel = 5
        description = "Приглашаю всех желающих"
    } | ConvertTo-Json -Depth 3

    $matchResponse = Invoke-RestMethod -Uri "$BASE_URL/api/v1/matches" `
        -Method Post `
        -ContentType "application/json" `
        -Headers @{ Authorization = "Bearer $TOKEN" } `
        -Body $matchBody

    $MATCH_ID = $matchResponse.id
    Write-Host "✓ Матч создан" -ForegroundColor Green
    Write-Host "  ID: $MATCH_ID" -ForegroundColor Gray
    Write-Host "  Title: $($matchResponse.title)" -ForegroundColor Gray
    Write-Host "  Sport: $($matchResponse.sport)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Ошибка создания матча" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    $MATCH_ID = $null
}

# 7. Получение списка матчей
Write-Host "`n[7] Получение списка матчей..." -ForegroundColor Yellow
try {
    $matchesResponse = Invoke-RestMethod -Uri "$BASE_URL/api/v1/matches" `
        -Method Get `
        -Headers @{ Authorization = "Bearer $TOKEN" }

    $matchesCount = $matchesResponse.Count
    Write-Host "✓ Всего матчей: $matchesCount" -ForegroundColor Green
    
    if ($matchesCount -gt 0) {
        Write-Host "  Матчи:" -ForegroundColor Gray
        $matchesResponse | ForEach-Object {
            Write-Host "    - $($_.title) ($($_.sport))" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "✗ Ошибка получения матчей" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Итоги
Write-Host "`n=========================================" -ForegroundColor Cyan
Write-Host "Тестирование завершено!" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "`nПолезные команды PowerShell:" -ForegroundColor Yellow
Write-Host "  # Получить площадки:" -ForegroundColor Gray
Write-Host "  Invoke-RestMethod '$BASE_URL/api/v1/sports-places' -Headers @{Authorization='Bearer $TOKEN'}" -ForegroundColor Gray
Write-Host ""
Write-Host "  # Получить матчи:" -ForegroundColor Gray
Write-Host "  Invoke-RestMethod '$BASE_URL/api/v1/matches' -Headers @{Authorization='Bearer $TOKEN'}" -ForegroundColor Gray
Write-Host ""
Write-Host "  # Получить профиль:" -ForegroundColor Gray
Write-Host "  Invoke-RestMethod '$BASE_URL/api/v1/profiles/my' -Headers @{Authorization='Bearer $TOKEN'}" -ForegroundColor Gray
