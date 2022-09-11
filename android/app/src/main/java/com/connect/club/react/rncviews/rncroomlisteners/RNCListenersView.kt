package com.connect.club.react.rncviews.rncroomlisteners

import android.content.Context
import android.content.res.Resources
import android.util.AttributeSet
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.FrameLayout
import android.widget.TextView
import androidx.coordinatorlayout.widget.CoordinatorLayout
import androidx.core.view.doOnAttach
import androidx.core.view.doOnNextLayout
import androidx.core.view.updateLayoutParams
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.GridLayoutManager
import com.connect.club.R
import com.connect.club.utils.toPx
import com.connect.club.view.CustomLinearLayout
import com.connect.club.view.CustomRecyclerView
import com.connect.club.view.LessSensitiveBottomSheetBehavior
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.uimanager.PixelUtil
import com.facebook.react.uimanager.events.RCTEventEmitter
import com.google.android.material.bottomsheet.BottomSheetBehavior


private const val HALF_HEIGHT_RATIO = 0.4f
private const val MINIMAL_HEIGHT_HIDE_THRESHOLD = 0.2f
private const val MINIMAL_HEIGHT_REVEAL_THRESHOLD = 0.25f

private const val headerSlideFactor = 0.65f

class RNCListenersView @JvmOverloads constructor(
        context: Context, attrs: AttributeSet? = null, defStyleAttr: Int = 0
) : FrameLayout(context, attrs, defStyleAttr) {

    var specialGuestBadgeIcon: String
        get() = adapter.specialGuestBadgeIcon
        set(value) {
            adapter.specialGuestBadgeIcon = value
        }

    var badgedGuestBadgeIcon: String
        get() = adapter.badgedGuestBadgeIcon
        set(value) {
            adapter.badgedGuestBadgeIcon = value
        }

    var specialModeratorBadgeIcon: String
        get() = adapter.specialModeratorBadgeIcon
        set(value) {
            adapter.specialModeratorBadgeIcon = value
        }

    var newbieBadgeIcon: String
        get() = adapter.newbieBadgeIcon
        set(value) {
            adapter.newbieBadgeIcon = value
        }

    private var popupHeaderView: ViewGroup
    private val recyclerView: CustomRecyclerView
    private val popupView: ViewGroup
    private val coordinatorLayout: CoordinatorLayout
    private val layoutManager: GridLayoutManager
    private val adapter: ListenersAdapter
    private val topicTitleView: TextView
    private val speakersNumView: TextView
    private val listenersNumView: TextView
    private val headerView: CustomLinearLayout
    private val eventEmitter: RCTEventEmitter
        get() = (context as ReactContext).getJSModule(RCTEventEmitter::class.java)
    private val targetHeaderOffset = 16.toPx().toFloat()
    private var initialHeaderOffset = 0

    private val bottomSheetCallback = object : LessSensitiveBottomSheetBehavior.BottomSheetCallback() {
        private var isMinimal = false

        override fun onStateChanged(bottomSheet: View, newState: Int) {
        }

        override fun onSlide(bottomSheet: View, slideOffset: Float) {
            updateListHeaderPosition(bottomSheet, slideOffset)
            if (slideOffset > MINIMAL_HEIGHT_REVEAL_THRESHOLD && isMinimal) {
                isMinimal = false
                return
            }
            if (slideOffset < MINIMAL_HEIGHT_HIDE_THRESHOLD && !isMinimal) {
                isMinimal = true
            }
        }
    }

    init {
        LayoutInflater.from(context).inflate(
                R.layout.view_room_listeners_popup,
                this,
                true
        )
        layoutManager = GridLayoutManager(context, calculateColumnCount())
        coordinatorLayout = findViewById(R.id.coordinator)
        popupView = findViewById(R.id.popupView)
        popupHeaderView = findViewById(R.id.popupHeader)

        recyclerView = popupView.findViewById(R.id.recyclerView)
        recyclerView.layoutManager = layoutManager
        recyclerView.setHasFixedSize(true)
        recyclerView.itemAnimator = null
        adapter = ListenersAdapter()
        adapter.onItemClicked = { listener ->
            val args = Arguments.createMap()
            args.putMap("user", Arguments.createMap().apply {
                putString("id", listener.id)
                putBoolean("isAdmin", listener.isAdmin)
                putBoolean("isLocal", listener.isLocal)
                putString("mode", "popup")
            })
            eventEmitter.receiveEvent(getId(), "onUserTap", args)
        }
        recyclerView.adapter = adapter
        headerView = popupView.findViewById(R.id.headerView)
        topicTitleView = popupView.findViewById(R.id.topicTitleView)
        speakersNumView = popupView.findViewById(R.id.speakersNumView)
        listenersNumView = popupView.findViewById(R.id.listenersNumView)
        popupView.updateLayoutParams<CoordinatorLayout.LayoutParams> {
            this.behavior = LessSensitiveBottomSheetBehavior<View>(context).also {
                it.isHideable = false
                it.setFitToContents(false)
                it.peekHeight = context.resources.getDimensionPixelSize(R.dimen.listeners_popup_peek_height)
                it.halfExpandedRatio = HALF_HEIGHT_RATIO
                it.skipCollapsed = false
                it.state = BottomSheetBehavior.STATE_HALF_EXPANDED
                it.addBottomSheetCallback(bottomSheetCallback)
                it.isGestureInsetBottomIgnored = false
                behavior = it
            }
        }
        doOnAttach {
            val marginTop = resources.getDimensionPixelSize(R.dimen.listeners_popup_top_margin)
            initialHeaderOffset = marginTop
            popupView.setPadding(
                    0,
                    0,
                    0,
                    it.rootWindowInsets?.systemWindowInsetBottom ?: 0
            )
            coordinatorLayout.updateLayoutParams<MarginLayoutParams> {
                topMargin = (it.rootWindowInsets?.systemWindowInsetTop ?: 0) + marginTop
                initialHeaderOffset = topMargin
            }
            return@doOnAttach
        }
    }

    fun updatePeekHeight(value: Int) {
        popupView.updateLayoutParams<CoordinatorLayout.LayoutParams> {
            (this.behavior as? LessSensitiveBottomSheetBehavior)?.let { behavior ->
                behavior.peekHeight = (PixelUtil.toPixelFromDIP(value.toDouble())).toInt()
            }
        }
    }

    fun updateMiddleHeight(value: Float) {
        popupView.updateLayoutParams<CoordinatorLayout.LayoutParams> {
            (this.behavior as? LessSensitiveBottomSheetBehavior)?.halfExpandedRatio = value
        }
    }

    private fun calculateColumnCount(): Int {
        val listenerDiameter = context.resources.getDimensionPixelSize(R.dimen.listener_diameter)
        val listenerMargin = context.resources.getDimensionPixelSize(R.dimen.listener_margin)
        return Resources.getSystem().displayMetrics.widthPixels / (listenerDiameter + listenerMargin * 2)
    }

    override fun onAttachedToWindow() {
        super.onAttachedToWindow()
        ListenersPresenter.takeView(this)
        val headerViewHeight = resources.getDimension(R.dimen.listeners_header_height)
        doOnNextLayout {
            popupHeaderView.translationY = popupView.top - headerViewHeight + initialHeaderOffset - targetHeaderOffset
        }
    }

    override fun onDetachedFromWindow() {
        super.onDetachedFromWindow()
        ListenersPresenter.removeView(this)
    }

    fun renderInfo(topic: String, speakersNum: Int, listenersNum: Int) {
        if (!isAttachedToWindow) return
        speakersNumView.text = speakersNum.toString()
        topicTitleView.text = topic
        topicTitleView.isSelected = true
        listenersNumView.text = listenersNum.toString()
    }

    fun onCreateListenersDiff(listeners: List<ListenerItem>): DiffUtil.DiffResult {
        return DiffUtil.calculateDiff(createDiffCallback(listeners), true)
    }

    fun renderListeners(listeners: MutableList<ListenerItem>, diff: DiffUtil.DiffResult) {
        if (!isAttachedToWindow) return
        headerView.measure(
                MeasureSpec.makeMeasureSpec(headerView.width, MeasureSpec.EXACTLY),
                MeasureSpec.makeMeasureSpec(headerView.height, MeasureSpec.EXACTLY)
        )
        headerView.notifyUpdated()
        headerView.requestLayout()

        adapter.setItems(listeners)
        recyclerView.notifyElementsUpdated()
        diff.dispatchUpdatesTo(adapter)
    }

    fun renderListener(index: Int, listener: ListenerItem) {
        if (!isAttachedToWindow) return
        if (index >= adapter.items.size) return
        if (adapter.items[index].id != listener.id) return
        adapter.updateItem(index, listener)
    }

    private fun createDiffCallback(listeners: List<ListenerItem>) =
        object : DiffUtil.Callback() {
            override fun getOldListSize(): Int = adapter.itemCount
            override fun getNewListSize(): Int = listeners.size
            override fun areItemsTheSame(oldItemPosition: Int, newItemPosition: Int): Boolean {
                return adapter.items.getOrNull(oldItemPosition)?.id == listeners.getOrNull(newItemPosition)?.id
            }

            override fun areContentsTheSame(oldItemPosition: Int, newItemPosition: Int): Boolean {
                return adapter.items.getOrNull(oldItemPosition) == listeners.getOrNull(newItemPosition)
            }
        }

    private fun updateListHeaderPosition(bottomSheet: View, slideOffset: Float) {
        val off: Float
        if (slideOffset > headerSlideFactor) {
            val negFactor = 1f / headerSlideFactor
            val slideValue = slideOffset - headerSlideFactor
            val slideDiff = headerSlideFactor - slideValue
            val baseOffset = initialHeaderOffset * negFactor
            off = (baseOffset * slideValue - baseOffset * slideDiff) + targetHeaderOffset * negFactor * slideDiff
        } else {
            off = -initialHeaderOffset + targetHeaderOffset
        }
        popupHeaderView.translationY = (bottomSheet.top - popupHeaderView.height).toFloat() - off
    }
}
