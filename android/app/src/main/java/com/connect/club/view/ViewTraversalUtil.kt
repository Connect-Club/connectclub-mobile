package com.connect.club.view

import android.view.View
import android.view.ViewGroup

object ViewTraversalUtil {
    fun findParent(child: View, predicate: (ViewGroup) -> Boolean): ViewGroup? {
        var parent = child.parent
        while (parent is ViewGroup) {
            if (predicate(parent)) return parent
            parent = parent.parent
        }
        return null
    }
}