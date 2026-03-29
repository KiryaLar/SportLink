plugins {
//    alias(libs.plugins.kotlin.jvm)
//    alias(libs.plugins.spring.dependency.management)
    id("sportlink.java-conventions")
}

kotlin {
    jvmToolchain(21)

    compilerOptions {
        freeCompilerArgs.addAll("-Xjsr305=strict", "-Xannotation-default-target=param-property")
    }
}

dependencies {
    implementation(libs.spring.boot.starter.web)
    implementation("com.fasterxml.jackson.core:jackson-annotations")
    implementation("com.fasterxml.jackson.module:jackson-module-kotlin")
    implementation("com.fasterxml.jackson.datatype:jackson-datatype-jsr310")
    
    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("org.jetbrains.kotlin:kotlin-test-junit5")
}
