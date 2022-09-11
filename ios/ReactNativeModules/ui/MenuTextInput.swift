//
//  MenuTextInput.swift
//  connectreactive
//
//  Created by Тарас Минин on 25/05/2021.
//

import React
import Foundation

final class MenuTextInput: UITextView {

    @objc var onChangeText: RCTBubblingEventBlock?
    @objc var onLinkText: RCTBubblingEventBlock?
    @objc var placeholder: String = "" {
        didSet {
            if originalText.isEmpty {
                setPlaceholder()
            }
        }
    }

    private var originalText: String = ""
    private var activeLinks: [TextLink] = []

    private var maxLength: Int?
    private var maxHeight: Int?
    private var caretPosition: Int?

    var markdownText: String {
        if textColor == UIColor.black.withAlphaComponent(0.32) {
            return ""
        }
        var text = attributedText.string

        for link in activeLinks.reversed() {
            text.replaceSubrange(
                Range(link.range, in: text)!,
                with: link.format()
            )
        }

        return text
    }
    
    override init(frame: CGRect, textContainer: NSTextContainer?) {
        super.init(frame: frame, textContainer: textContainer)
        setup()
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    private func setup() {
        font = .systemFont(ofSize: 20)
        layer.cornerRadius = 7
        delegate = self
        autocorrectionType = .no
        smartInsertDeleteType = .no
        backgroundColor = .white
    }
    
    @objc
    private func linkSelectedText() {
        guard let range = selectedTextRange,
              let selectedText = self.text(in: range) else { return }
        
        let actualLocation = activeLinks
            .filter({ $0.range.location < selectedRange.location})
            .map({ $0.format().count - $0.name.count })
            .reduce(selectedRange.location, +)
        
        linkText(selectedText, start: actualLocation)
    }

    private func linkText(_ text: String, start: Int = 0) {
        onLinkText?(["text": text, "location": start])
    }

    // MARK: - React Native Events
    @objc
    func setMaxLength(_ value: NSNumber) {
        maxLength = value.intValue
    }

    @objc
    func setMaxHeight(_ value: NSNumber) {
        maxHeight = value.intValue
    }

    @objc
    func setIndentRight(_ value: NSNumber) {
        let indent = CGFloat(value.floatValue)
        textContainerInset = .init(top: 12, left: 12, bottom: 12, right: indent)
    }
    
    @objc
    func setValue(_ value: String) {
        guard !value.isEmpty else {
            setPlaceholder()
            return
        }
        // fallthrough only if we have new link from react-native
        // in format [x](http://...) - minimum amount of new characters is 12
        if !originalText.isEmpty && (markdownText.count + 12 > value.count) { return }
        activeLinks.removeAll()
        
        originalText = value
        attributedText = formatMarkdown(value)
    }
    
    @objc
    func setShouldDismissKeyboard(_ resign: Bool) {
        if resign {
            resignFirstResponder()
        }
    }
    
    func setPlaceholder() {
        if placeholder.isEmpty { return }
        text = placeholder
        textColor = UIColor.black.withAlphaComponent(0.32)
    }

    private func formatMarkdown(_ text: String) -> NSAttributedString {
        var outputText = text as NSString

        let linkRegExp = try! NSRegularExpression(
            pattern: "\\[.+?\\]\\(.+?\\)",
            options: []
        )
        let linkNameRegExp = try! NSRegularExpression(
            pattern: "\\[.+?\\]",
            options: []
        )
        while let match = linkRegExp.matches(
            in: outputText as String,
            options: [],
            range: NSRange(location: 0, length: outputText.length)
        ).first {
            let linkNameRange = linkNameRegExp.firstMatch(
                    in: outputText as String,
                    options: .anchored,
                    range: match.range
            )!.range
            
            let linkName = outputText.substring(
                with: NSRange(
                    location: linkNameRange.location + 1,
                    length: linkNameRange.length - 2
                )
            )
            
            let linkUrl = outputText.substring(
                with: NSRange(
                    location: linkNameRange.location + linkNameRange.length + 1,
                    length: match.range.length - linkNameRange.length - 2
                )
            )
            
            outputText = outputText.replacingCharacters(
                in: match.range,
                with: linkName
            ) as NSString
            let linkRange = NSRange(location: match.range.location, length: linkName.utf16.count)

            activeLinks.append(
                TextLink(
                    name: linkName,
                    url: linkUrl,
                    range: linkRange
                )
            )
        }
        
        let formatedString = NSMutableAttributedString(
            string: outputText as String,
            attributes: [
                NSAttributedString.Key.foregroundColor: UIColor.black.withAlphaComponent(0.87),
                NSAttributedString.Key.font: UIFont.systemFont(ofSize: 20)
            ]
        )
        
        for link in activeLinks {
            formatedString.addAttribute(
                .link,
                value: link.url,
                range: link.range
            )
        }

        return formatedString
    }
}

extension MenuTextInput {
    
    private struct TextLink {
        let name: String
        let url: String
        let range: NSRange
        
        func format() -> String {
            "[\(name)](\(url))"
        }
    }
}

extension MenuTextInput: UITextViewDelegate {

    func textViewDidEndEditing(_ textView: UITextView) {
        onChangeText?(["text": markdownText])
    }
    
    func textView(_ textView: UITextView, shouldChangeTextIn range: NSRange, replacementText text: String) -> Bool {
        if originalText.isEmpty, !text.isEmpty {
            textView.text = ""
        }

        if let length = maxLength, (markdownText.utf16.count + text.utf16.count - range.length) > length {
            return false
        }
        
        for link in activeLinks {

            if range.location + range.length <= link.range.location {

                let newLinkRange = NSRange(
                    location: link.range.location + text.utf16.count - range.length,
                    length: link.range.length
                )
                if newLinkRange.location + newLinkRange.length > textView.text.utf16.count + text.utf16.count - range.length {
                    activeLinks.removeAll(where: { $0.range == link.range })
                }
                    
                let updatedLink = TextLink(name: link.name, url: link.url, range: newLinkRange)
                let index = activeLinks.firstIndex(where: { $0.range == link.range})!
                activeLinks[index] = updatedLink

            } else if NSIntersectionRange(range, link.range).length > 0
                        || NSLocationInRange(range.location, link.range) {

                activeLinks.removeAll(where: { $0.range == link.range })
            }
        }
        caretPosition = range.location + text.utf16.count
        
        return true
    }
    
    func textViewDidChange(_ textView: UITextView) {
        originalText = textView.text
        attributedText = formatMarkdown(originalText)
        
        if let caretPosition = caretPosition {
            selectedRange = NSRange(location: caretPosition, length: 0)
        }
        
        onChangeText?(["text": markdownText])
    }
    
    func textView(
        _ textView: UITextView,
        shouldInteractWith URL: URL,
        in characterRange: NSRange,
        interaction: UITextItemInteraction
    ) -> Bool {
        for link in activeLinks where link.range == characterRange {
            selectedRange = link.range
            linkText("[\(link.name)](\(link.url))", start: link.range.location)
            
            return false
        }
        return false
    }
    
    func textViewDidChangeSelection(_ textView: UITextView) {
        if originalText.isEmpty {
            selectedRange = NSRange(location: 0, length: 0)
            return
        }
        if selectedRange.length > 0,
           let text = text(in: selectedTextRange!),
           !text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
            let linkMenuItem = UIMenuItem(
                title: "Link",
                action: #selector(linkSelectedText)
            )
            UIMenuController.shared.menuItems = [linkMenuItem]
        } else {
            UIMenuController.shared.menuItems = nil
        }
    }
}
