package com.connect.club.view

import android.annotation.SuppressLint
import android.content.Context
import android.util.AttributeSet
import androidx.recyclerview.widget.RecyclerView

class CustomRecyclerView @JvmOverloads constructor(
        context: Context, attrs: AttributeSet? = null, defStyleAttr: Int = 0
) : RecyclerView(context, attrs, defStyleAttr) {

    private var isRequestedLayout = false

    fun notifyElementsUpdated() {
        isRequestedLayout = false
    }

    @SuppressLint("WrongCall")
    override fun requestLayout() {
        super.requestLayout()
        // We need to intercept this method because if we don't our children will never update
        // Check https://stackoverflow.com/questions/49371866/recyclerview-wont-update-child-until-i-scroll
        if (!isRequestedLayout) {
            isRequestedLayout = true
            post {
                isRequestedLayout = false
                layout(left, top, right, bottom)
                onLayout(false, left, top, right, bottom)
            }
        }
    }
}