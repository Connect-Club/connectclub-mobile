//
//  ListenersStore.swift
//  connectreactive
//
//  Created by Sergei Golishnikov on 01/05/2021.
//

import Foundation

final class ListenersStore {

    private init() {}

    static let shared = ListenersStore()
    
    var onNewState: ((_ name: String, _ speakers: Int, _ listenersCount: Int, _ listeners: [Listener]) -> Void)?
    
    var shouldStopParseData = false {
        didSet {
            if !shouldStopParseData, oldValue {
                processListenersJson(lastListenersJson)
            }
        }
    }

    private var lastListenersJson: JSON = .null

    func processListenersJson(_ json: JSON) {
        let speakersCount = json.speakersCount.int!
        guard let users = json.users.array else { return }
        lastListenersJson = json
        
        if shouldStopParseData {
            onNewState?(AppManager.instance.roomName, speakersCount, users.count, [])
            return
        }
        let listeners: [Listener] = users.map({
            Listener(
                id: $0.id.string!,
                name: $0.name.string!,
                surname: $0.surname.string!,
                avatarSource: $0.avatar.string!,
                reaction: $0.reaction.string!,
                isLocal: $0.isLocal.bool == true,
                isOwner: $0.isOwner.bool == true,
                isSpecialGuest: $0.isSpecialGuest.bool == true,
                isAdmin: $0.isAdmin.bool == true,
                badges: $0.badges.array?.map({ $0.string! })
            )
        })
        let listenersCount = json.listenersCount.int ?? listeners.count
        onNewState?(AppManager.instance.roomName, speakersCount, listenersCount, listeners)
    }
    
    /// Update for listener Identifier with reaction type. First parameter - id, second parameter - reaction type
    var onNewReaction: ((String, String) -> Void)?
}
