package com.connect.club.react.rncviews.rncroomlisteners

enum class ListenerRole {
    Default, Admin, FestivalAdmin, BadgedGuest, Newbie, SpecialGuest
}

data class ListenerItem(
    val id: String,
    val name: String,
    val surname: String,
    val avatarSrc: String,
    val reaction: String? = null,
    val isAdmin: Boolean,
    val isLocal: Boolean,
    val role: ListenerRole,
)