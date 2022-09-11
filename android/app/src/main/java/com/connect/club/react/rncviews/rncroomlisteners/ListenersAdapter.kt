package com.connect.club.react.rncviews.rncroomlisteners

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.core.view.isVisible
import androidx.recyclerview.widget.RecyclerView
import com.connect.club.R
import com.connect.club.react.bridge.iosLike.ui.AppManager
import com.connect.club.react.bridge.iosLike.ui.RasterIconView
import com.connect.club.react.bridge.iosLike.ui.allReactions
import com.connect.club.utils.profileInitials
import com.connect.club.utils.profileName
import com.connect.club.view.AvatarView
import com.facebook.react.uimanager.PixelUtil

class ListenersAdapter(
    var specialGuestBadgeIcon: String = "",
    var badgedGuestBadgeIcon: String = "",
    var specialModeratorBadgeIcon: String = "",
    var newbieBadgeIcon: String = "",
) : RecyclerView.Adapter<ListenersAdapter.ViewHolder>() {

    var onItemClicked: ((ListenerItem) -> Unit)? = null

    val items: List<ListenerItem>
        get() = _items
    private var _items = mutableListOf<ListenerItem>()
    private val badgeIconPadding = PixelUtil.toPixelFromDIP(4f).toInt()

    fun setItems(items: MutableList<ListenerItem>) {
        this._items = items
    }

    fun updateItem(index: Int, item: ListenerItem) {
        require(index < _items.size)
        _items[index] = item
        notifyItemChanged(index)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        return ViewHolder(
            LayoutInflater.from(parent.context)
                    .inflate(R.layout.view_listener, parent, false)
        )
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val item = _items[position]
        holder.itemView.setOnClickListener { onItemClicked?.invoke(item) }
        holder.nameView.text = profileName(holder.itemView.context, item.name)
        holder.avatarView.image = item.avatarSrc
        holder.avatarView.lettersText = profileInitials(
                holder.itemView.context,
                item.name,
                item.surname
        )
        holder.badgeView.setPadding(0, 0, 0, 0)
        if (item.reaction != null && item.reaction != "none") {
            val reactionIcon = allReactions[item.reaction]
            RasterIconView.showIcon(holder.reactionView, reactionIcon)
            holder.reactionView.isVisible = true
            holder.badgeView.isVisible = false
            if (reactionIcon != null) {
                val xOffset = holder.itemView.left + (holder.itemView.width) / 2f
                AppManager.reactionsView?.animateReaction(reactionIcon, xOffset)
            }
            return
        }
        holder.reactionView.isVisible = false
        holder.badgeView.isVisible = item.role != ListenerRole.Default
        when (item.role) {
            ListenerRole.Admin -> {
                holder.badgeView.setPadding(
                    badgeIconPadding,
                    badgeIconPadding,
                    badgeIconPadding,
                    badgeIconPadding
                )
                holder.badgeView.setImageResource(R.drawable.ic_crown_16dp)
            }
            ListenerRole.Newbie -> {
                RasterIconView.showIcon(holder.badgeView, newbieBadgeIcon)
            }
            ListenerRole.FestivalAdmin -> {
                RasterIconView.showIcon(holder.badgeView, specialModeratorBadgeIcon)
            }
            ListenerRole.BadgedGuest -> {
                RasterIconView.showIcon(holder.badgeView, badgedGuestBadgeIcon)
            }
            ListenerRole.SpecialGuest -> {
                RasterIconView.showIcon(holder.badgeView, specialGuestBadgeIcon)
            }
            ListenerRole.Default -> return
        }
    }

    override fun getItemCount(): Int = _items.size

    class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val nameView: TextView = view.findViewById(R.id.listenerName)
        val avatarView: AvatarView = view.findViewById(R.id.avatar)
        val badgeView: ImageView = view.findViewById(R.id.badge)
        val reactionView: ImageView = view.findViewById(R.id.reaction)
    }
}
