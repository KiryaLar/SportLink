# Build stage
FROM gradle:8.14.3-jdk21 AS builder

WORKDIR /app

COPY build.gradle.kts settings.gradle.kts ./
COPY gradle/ gradle/
COPY gradlew ./
COPY build-logic/ build-logic/
COPY common/ common/

COPY services/matches-service/build.gradle.kts services/matches-service/

RUN gradle :services:matches-service:dependencies --no-daemon || true

COPY services/matches-service/src services/matches-service/src

RUN gradle :services:matches-service:bootJar -x test --no-daemon

# Run stage
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=builder /app/services/matches-service/build/libs/*.jar app.jar

RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 8082

HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
    CMD wget -qO- http://localhost:8082/actuator/health || exit 1

ENV JAVA_TOOL_OPTIONS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:+ExitOnOutOfMemoryError"

ENTRYPOINT ["java", "-jar", "app.jar"]
