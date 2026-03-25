FROM gradle:8.12.1-jdk21 AS builder

WORKDIR /app

COPY build.gradle.kts settings.gradle.kts ./
COPY gradle/ gradle/
COPY gradlew ./
COPY build-logic/ build-logic/
COPY common/core/ common/core/

COPY services/gateway-service/build.gradle.kts services/gateway-service/

RUN gradle :services:gateway-service:dependencies --no-daemon

COPY services/gateway-service/src services/gateway-service/src

RUN gradle :services:gateway-service:bootJar -x test --no-daemon

FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=builder /app/services/gateway-service/build/libs/*.jar app.jar

RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 8080

# JVM оптимизации для контейнеров
# - UseContainerSupport: JVM видит лимиты контейнера
# - MaxRAMPercentage: использует до 75% доступной памяти
# - ExitOnOutOfMemoryError: умирает при OOM (для перезапуска K8s)
ENV JAVA_TOOL_OPTIONS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:+ExitOnOutOfMemoryError"

ENTRYPOINT ["java", "-jar", "app.jar"]
