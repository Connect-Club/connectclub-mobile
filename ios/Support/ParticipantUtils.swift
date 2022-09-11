//
//  ParticipantUtils.swift
//  connectreactive
//
//  Created by Sergei Golishnikov on 01/05/2021.
//

import Foundation

public func profileInitials(
    name: String?,
    surname: String?
) -> String {
    let nameInitial = name?.first
    let surnameInitial = surname?.first
    var initials = ""
    if let initial = nameInitial { initials += "\(initial)" }
    if let initial = surnameInitial { initials += "\(initial)" }
    if initials.isEmpty { initials = "N/A" }
    return initials.uppercased()
}
