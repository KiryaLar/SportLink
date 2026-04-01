# Build stage
FROM gradle:8.14.3-jdk21 AS builder

WORKDIR /app

COPY build.gradle.kts settings.gradle.kts ./
COPY gradle/ gradle/
COPY gradlew ./
COPY build-logic/ build-logic/
COPY common/ common/

COPY services/rating-service/build.gradle.kts services/rating-service/

RUN gradle :services:rating-service:dependencies --no-daemon

COPY services/rating-service/src services/rating-service/src

RUN gradle :services:rating-service:bootJar -x test --no-daemon

# Run stage
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --chown=appuser:appgroup --from=builder /app/services/profile-service/build/libs/*.jar app.jar

USER appuser

EXPOSE 8083

HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
    CMD wget -qO- http://localhost:8083/actuator/health || exit 1

ENV JAVA_TOOL_OPTIONS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:+ExitOnOutOfMemoryError"

ENTRYPOINT ["java", "-jar", "app.jar"]
