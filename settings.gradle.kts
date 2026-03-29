rootProject.name = "SportLink"

pluginManagement {
    includeBuild("build-logic")
    repositories {
        gradlePluginPortal()
        mavenCentral()
    }
}

include(
    "services:profile-service",
    "services:matches-service",
    "services:sports-places-service",
    "services:gateway-service",
    "services:messaging-service",
    "services:notification-service",
    "services:rating-service",
    "common:core"
)

dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        mavenCentral()
    }
}
