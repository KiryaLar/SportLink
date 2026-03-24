package ru.larkin.keycloakeventlistener.events

import com.fasterxml.jackson.annotation.JsonProperty

data class KeycloakEvent(
    val id: String,
    val type: String,
    val realmId: String,
    val userId: String,
    val username: String?,
    val email: String?,
    val timestamp: Long,
    @JsonProperty("details")
    val details: Map<String, String>?
)
