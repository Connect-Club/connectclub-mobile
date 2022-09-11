package com.connect.club.utils

import android.content.Context
import com.connect.club.R
import java.util.*

fun profileFullName(
    name: String?,
    surname: String?,
    unknownUserName: String,
    splitByNewLine: Boolean = false
): String {
    var title = ""
    if (!name.isNullOrEmpty()) title = name

    if (!surname.isNullOrEmpty()) {
        if (title.isNotEmpty() && !splitByNewLine) title += " "
        if (splitByNewLine) title += "\n"
        title += surname
    }
    if (title.isEmpty()) {
        title = unknownUserName
        if (splitByNewLine) title = title.replace(" ", "\n")
    }
    return title
}

fun profileInitials(
    name: String?,
    surname: String?,
    unknownUserNameInitials: String
): String {
    val nameInitial = name?.firstOrNull()
    val surnameInitial = surname?.firstOrNull()
    var initials = ""
    nameInitial?.let { initials += it }
    surnameInitial?.let { initials += it }

    if (initials.isEmpty()) { initials = unknownUserNameInitials }
    return initials.toUpperCase(Locale.getDefault())
}

fun profileInitials(
    context: Context,
    name: String?,
    surname: String?
): String {
    return profileInitials(name, surname, context.getString(R.string.unknownUserNameInitials))
}

fun profileName(context: Context, name: String?): String {
    if (!name.isNullOrEmpty()) return name
    return context.getString(R.string.unknownUserNameInitials)
}