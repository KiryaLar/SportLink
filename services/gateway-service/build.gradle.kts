plugins {
//    alias(libs.plugins.kotlin.jvm)
//    alias(libs.plugins.kotlin.spring)
//    alias(libs.plugins.spring.boot)
//    alias(libs.plugins.spring.dependency.management)
    id("sportlink.java-conventions")
}

description = "gateway-service"

dependencies {
    //    Base
    implementation(libs.spring.boot.starter.webflux)

//    Gateway
    implementation(libs.spring.cloud.starter.gateway.server.webflux)

//    Eureka Client
    implementation(platform(libs.spring.cloud.bom))

//    Observability
    implementation(libs.spring.boot.starter.actuator)
    implementation(libs.micrometer.tracing.bridge.otel)
    implementation(libs.opentelemetry.exporter.otlp)

//    Security
    implementation(libs.spring.boot.starter.security)
    implementation(libs.spring.boot.starter.oauth2.resource.server)
    implementation(libs.spring.boot.starter.oauth2.client)
    implementation(libs.jjwt.api)
    implementation(libs.jjwt.impl)
    implementation(libs.jjwt.jackson)
    implementation(libs.spring.security.oauth2.jose)

//    OpenApi
    implementation(libs.springdoc.openapi.webflux.ui)

//    Validation
    implementation("org.springframework.boot:spring-boot-starter-validation")

//    Tests
    testRuntimeOnly(libs.junit.platform.launcher)
    testImplementation(libs.wiremock)
}


tasks.withType<Test> {
    useJUnitPlatform()
}
