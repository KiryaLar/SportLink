plugins {
    kotlin("jvm") version "2.2.21"
    kotlin("plugin.spring") version "2.2.21"
    id("org.springframework.boot") version "4.0.0"
    id("io.spring.dependency-management") version "1.1.7"
}

group = "ru.larkin"
version = "0.0.1-SNAPSHOT"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}

dependencies {
    // Keycloak SPI (provided - уже есть в Keycloak)
    compileOnly("org.keycloak:keycloak-server-spi:26.2.0")
    compileOnly("org.keycloak:keycloak-server-spi-private:26.2.0")
    compileOnly("org.keycloak:keycloak-services:26.2.0")
    compileOnly("org.keycloak:keycloak-model-storage-private:26.2.0")
    
    // Kafka
    implementation("org.springframework.kafka:spring-kafka")
    implementation("org.springframework.boot:spring-boot-starter-json")
    
    // Kotlin
    implementation("org.jetbrains.kotlin:kotlin-reflect")
    implementation("com.fasterxml.jackson.module:jackson-module-kotlin")
    
    // Lombok (для Keycloak)
    compileOnly("org.projectlombok:lombok")
    annotationProcessor("org.projectlombok:lombok")
}

tasks.withType<Test> {
    useJUnitPlatform()
}

// Copy SPI jar в директорию Keycloak для разработки
tasks.register<Copy>("copyToKeycloak") {
    from(tasks.jar)
    into("$rootDir/infra/keycloak/providers")
    dependsOn(tasks.jar)
}
