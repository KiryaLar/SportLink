rootProject.name = "SportLink"

include(
    "services:user-service",
    "services:matches-service",
    "services:area-service",
    "services:gateway-service",
    "services:messaging-service",
    "services:notification-service",
    "services:rating-service",
    "common:core"
)

rootProject.name = "SportLink"

pluginManagement {
    repositories {
        gradlePluginPortal()
        mavenCentral()
    }
}

dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        mavenCentral()
    }
}