package com.connect.club.react.bridge.iosLike.ui

import android.graphics.Color
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.text.Editable
import android.text.InputFilter
import android.view.ActionMode
import android.view.Gravity
import android.view.Menu
import android.view.MenuItem
import android.view.inputmethod.EditorInfo
import androidx.core.view.setPadding
import androidx.core.view.updatePadding
import com.connect.club.R
import com.connect.club.utils.textprocessing.TextEditor
import com.connect.club.utils.textprocessing.TextEditorParser
import com.connect.club.utils.textprocessing.TextEditorSpanner
import com.connect.club.utils.textprocessing.UrlToken
import com.connect.club.utils.toPx
import com.connect.club.view.EnhancedTextEdit
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.common.MapBuilder
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.uimanager.events.RCTEventEmitter
import com.facebook.react.views.text.DefaultStyleValuesUtil
import com.facebook.react.views.textinput.ReactEditText
import com.facebook.react.views.textinput.ReactTextInputManager
import io.intercom.android.sdk.utilities.SimpleTextWatcher

class MenuTextInputViewManager : ReactTextInputManager() {

    private var textEditor: TextEditor? = null
    private var textValue: String? = null
    private val handler = Handler(Looper.getMainLooper())
    private var updateTextRunnable: Runnable? = null
    private var isInternalTextChange = false
    private var linkTextColor: Int = Color.BLUE
    private var spanner: TextEditorSpanner? = null

    override fun getName() = "MenuTextInput"

    override fun createViewInstance(reactContext: ThemedReactContext): ReactEditText {
        val textInput = EnhancedTextEdit(reactContext)
        textInput.let {
            it.customSelectionActionModeCallback = object : ActionMode.Callback {

                override fun onCreateActionMode(mode: ActionMode, menu: Menu): Boolean {
                    val start = it.selectionStart
                    val end = it.selectionEnd
                    val selectedText = it.text.toString().substring(start, end)
                    if (selectedText.isNotBlank()) {
                        mode.menuInflater.inflate(R.menu.selection_menu, menu)
                    }
                    return true
                }

                override fun onPrepareActionMode(mode: ActionMode, menu: Menu): Boolean = false

                override fun onActionItemClicked(mode: ActionMode, item: MenuItem): Boolean {
                    if (item.itemId != R.id.menu_insert_link) return false
                    val start = it.selectionStart
                    val end = it.selectionEnd
                    val token = textEditor?.findTokenAtIndex(start)
                    val selectedText = it.text.toString().substring(start, end)
                    mode.finish()
                    if (selectedText.isBlank()) return true
                    if (token?.type == UrlToken.TYPE) {
                        onSendLink(it, token.sourceText, start)
                    } else {
                        onSendLink(it, selectedText, start)
                    }
                    return true
                }

                override fun onDestroyActionMode(mode: ActionMode) = Unit
            }
            it.gravity = Gravity.TOP or Gravity.START
            it.setPadding(12.toPx())
            it.setBackgroundResource(R.drawable.bg_textinput)
            it.textSize = 20f
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                it.lineHeight = 32.toPx()
            }
            it.inputType = EditorInfo.TYPE_TEXT_FLAG_MULTI_LINE or EditorInfo.TYPE_CLASS_TEXT
        }
        return textInput
    }

    override fun addEventEmitters(reactContext: ThemedReactContext, editText: ReactEditText) {
        // no-op
    }

    override fun receiveCommand(reactEditText: ReactEditText, commandId: String?, args: ReadableArray?) {
        if (commandId == "blur" || commandId == "blurTextInput") {
            // prevent unwanted soft input dismiss
            return
        }
        super.receiveCommand(reactEditText, commandId, args)
    }

    @ReactProp(name = "indentRight")
    fun setIndentRight(view: EnhancedTextEdit, value: Int) {
        view.setPadding(view.paddingLeft, view.paddingTop, value.toPx(), view.paddingBottom)
    }

    @ReactProp(name = "value")
    fun setValue(view: EnhancedTextEdit, value: String?) {
        if (textValue == value) return
        textValue = value.orEmpty()
        if (textEditor != null) {
            postTextChange(view)
            return
        }
        val parser = TextEditorParser()
        spanner = TextEditorSpanner(view.context, linkTextColor)
        textEditor = TextEditor(parser, spanner!!, object : SimpleTextWatcher() {
            override fun afterTextChanged(s: Editable) {
                if (isInternalTextChange) return
                updateTextRunnable?.let { handler.removeCallbacks(it) }
                textEditor?.let { onSendTextChange(view, it.getRawText()) }
            }
        })
        textEditor!!.setRawText(view, value.orEmpty())
        textEditor!!.onUrlSelected = { onSendLink(view, it.sourceText, it.index) }
    }

    @ReactProp(name = "placeholder")
    fun setPlaceholder(view: EnhancedTextEdit, value: String?) {
        view.hint = value
    }

    @ReactProp(name = "placeholderTextColor", customType = "Color")
    fun setPlaceholderTextColor(view: EnhancedTextEdit, color: Int?) {
        if (color == null) {
            view.setHintTextColor(DefaultStyleValuesUtil.getDefaultTextColorHint(view.context))
        } else {
            view.setHintTextColor(color)
        }
    }

    @ReactProp(name = "linkTextColor", customType = "Color")
    fun setLinkTextColor(view: EnhancedTextEdit, color: Int?) {
        linkTextColor = color ?: Color.BLUE
        spanner?.linkTextColor = linkTextColor
    }

    @ReactProp(name = "maxLength")
    fun setMaxLength(view: EnhancedTextEdit, value: Int?) {
        val baseFilters = view.filters.filter { it !is InputFilter.LengthFilter }
        val newFilters = value?.let { baseFilters + InputFilter.LengthFilter(value) } ?: baseFilters
        view.filters = newFilters.toTypedArray()
    }

    private fun postTextChange(view: EnhancedTextEdit) {
        val throttlingMillis = 250L
        updateTextRunnable?.let { handler.removeCallbacks(it) }
        updateTextRunnable = Runnable {
            val text = textValue.orEmpty()
            if (view.text.toString() != text) {
                isInternalTextChange = true
                textEditor!!.setRawText(view, text)
                val actualText = view.text.toString()
                if (actualText.isNotEmpty()) view.setSelection(actualText.length)
                isInternalTextChange = false
            }
        }
        updateTextRunnable?.let { handler.postDelayed(it, throttlingMillis) }
    }

    override fun onDropViewInstance(view: ReactEditText) {
        super.onDropViewInstance(view)
        if (textEditor != null) {
            view.removeTextChangedListener(textEditor)
            textEditor = null
        }
        textValue = null
        spanner = null
        updateTextRunnable = null
        isInternalTextChange = false
    }

    override fun getExportedCustomBubblingEventTypeConstants(): Map<String, Any> {
        return MapBuilder.builder<String, Any>()
            .put(
                "onLinkText",
                MapBuilder.of<String, Any>(
                    "phasedRegistrationNames",
                    MapBuilder.of("bubbled", "onLinkText")
                )
            )
            .put(
                "onChangeText",
                MapBuilder.of<String, Any>(
                    "phasedRegistrationNames",
                    MapBuilder.of("bubbled", "onChangeText")
                )
            )
            .build()
    }

    private fun onSendTextChange(view: EnhancedTextEdit, text: String) {
        if (text == textValue) return
        textValue = text
        val args = Arguments.createMap()
        args.putString("text", text)
        (view.context as ReactContext).getJSModule(RCTEventEmitter::class.java)
            .receiveEvent(view.id, "onChangeText", args)
    }

    private fun onSendLink(view: EnhancedTextEdit, text: String, startIndex: Int) {
        if (!view.isAttachedToWindow) return
        val args = Arguments.createMap()
        args.putString("text", text)
        args.putInt("location", startIndex)
        (view.context as ReactContext).getJSModule(RCTEventEmitter::class.java)
            .receiveEvent(view.id, "onLinkText", args)
    }
}
