# Build stage
FROM gradle:8.12.1-jdk21 AS builder

WORKDIR /app

# Кэшируем зависимости
COPY build.gradle.kts settings.gradle.kts ./
COPY gradle/ gradle/
COPY gradlew ./
COPY build-logic/ build-logic/
COPY common/ common/

# Копируем только build файлы сервисов для кэширования
COPY services/gateway-service/build.gradle.kts services/gateway-service/
COPY services/profile-service/build.gradle.kts services/profile-service/
COPY services/matches-service/build.gradle.kts services/matches-service/
COPY services/rating-service/build.gradle.kts services/rating-service/
COPY services/sports-places-service/build.gradle.kts services/sports-places-service/
COPY services/messaging-service/build.gradle.kts services/messaging-service/
COPY services/notification-service/build.gradle.kts services/notification-service/

# Загружаем зависимости (кэшируется)
RUN gradle dependencies --no-daemon || true

# Копируем исходный код
COPY services/ services/

# Собираем только gateway-service
RUN gradle :services:gateway-service:bootJar -x test --no-daemon

# Run stage
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Создаём пользователя для безопасности
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Копируем jar из builder
COPY --from=builder /app/services/gateway-service/build/libs/*.jar app.jar

# Устанавливаем владельца
RUN chown -R appuser:appgroup /app

USER appuser

# Экспозиция порта
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
    CMD wget -qO- http://localhost:8080/actuator/health || exit 1

# JVM оптимизации для контейнеров
ENV JAVA_TOOL_OPTIONS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:+ExitOnOutOfMemoryError"

ENTRYPOINT ["java", "-jar", "app.jar"]
