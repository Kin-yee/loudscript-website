import CoreGraphics
import Foundation

let pid = Int32(CommandLine.arguments[1])!
let info = CGWindowListCopyWindowInfo([.optionOnScreenOnly, .excludeDesktopElements], kCGNullWindowID) as? [[String: Any]] ?? []
let windows = info.compactMap { window -> [String: Any]? in
    guard window[kCGWindowOwnerPID as String] as? Int32 == pid else { return nil }
    return [
        "id": window[kCGWindowNumber as String] as? Int ?? 0,
        "name": window[kCGWindowName as String] as? String ?? "",
        "layer": window[kCGWindowLayer as String] as? Int ?? 0,
        "bounds": window[kCGWindowBounds as String] as? [String: Double] ?? [:],
    ]
}
let data = try JSONSerialization.data(withJSONObject: windows)
print(String(decoding: data, as: UTF8.self))
