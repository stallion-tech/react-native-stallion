//
//  StallionBSPatch.swift
//  react-native-stallion
//
//  Created by Thor963 on 04/11/25.
//

import Foundation

class StallionBSPatch {
    
    static func applyPatch(oldFile: String, newFile: String, patchFile: String) -> Bool {
        #if os(iOS)
        // Use embedded C implementation on iOS
        // Swift automatically bridges String to const char * for C functions
        let result = oldFile.withCString { oldPath in
            newFile.withCString { newPath in
                patchFile.withCString { patchPath in
                    bspatch_apply(oldPath, newPath, patchPath)
                }
            }
        }
        
        if result == 0 {
            return true
        } else {
            NSLog("BSPatch failed with code: %d (old: %@, patch: %@)", result, oldFile, patchFile)
            return false
        }
        #else
        NSLog("BSPatch not supported on this platform.")
        return false
        #endif
    }
}
