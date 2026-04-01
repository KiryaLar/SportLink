# Build stage
FROM gradle:8.14.3-jdk21 AS builder

WORKDIR /app

# Кэшируем зависимости
COPY build.gradle.kts settings.gradle.kts ./
COPY gradle/ gradle/
COPY gradlew ./
COPY build-logic/ build-logic/
COPY common/ common/

# Копируем только build файл сервиса
COPY services/profile-service/build.gradle.kts services/profile-service/

# Загружаем зависимости (кэшируется)
RUN gradle :services:profile-service:dependencies --no-daemon

# Копируем исходный код сервиса
COPY services/profile-service/src services/profile-service/src

# Собираем сервис
RUN gradle :services:profile-service:bootJar -x test --no-daemon

# Run stage
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --chown=appuser:appgroup --from=builder /app/services/profile-service/build/libs/*.jar app.jar

USER appuser

EXPOSE 8081

HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
    CMD wget -qO- http://localhost:8081/actuator/health || exit 1

ENV JAVA_TOOL_OPTIONS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:+ExitOnOutOfMemoryError"

ENTRYPOINT ["java", "-jar", "app.jar"]
