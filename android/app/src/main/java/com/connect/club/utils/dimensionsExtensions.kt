package com.connect.club.utils

import android.content.res.Resources

fun Int.toPx(): Int = (Resources.getSystem().displayMetrics.density * this).toInt()
fun Float.toPx(): Int = (Resources.getSystem().displayMetrics.density * this).toInt()
