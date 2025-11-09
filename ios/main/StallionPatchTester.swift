//
//  StallionPatchTester.swift
//  react-native-stallion
//
//  Created by Thor963 on 04/11/25.
//

import Foundation
import ZIPFoundation

class StallionPatchTester {
    
    // Hardcoded test URL - replace with your actual patch ZIP URL
    private static let TEST_PATCH_URL: String = "https://assets.stalliontech.io/patches.zip"
    
    static func testPatchUpdate() {
        DispatchQueue.global(qos: .background).async {
            do {
                guard let stateManager = StallionStateManager.sharedInstance(),
                      let config = stateManager.stallionConfig else {
                    NSLog("❌ Patch Test: StateManager not initialized")
                    return
                }
                
                let baseFolderPath: String = config.filesDirectory
                let patchSlotPath = baseFolderPath + "/" + StallionConstants.PROD_DIRECTORY + "/patch"
                
                NSLog("🔍 Patch Test: Starting patch update test...: \(patchSlotPath)")
                
                // Step 1: Download the ZIP
                NSLog("📥 Patch Test: Downloading patch ZIP from: \(TEST_PATCH_URL)")
                guard let testURL = URL(string: TEST_PATCH_URL) else {
                    NSLog("❌ Patch Test: Invalid TEST_PATCH_URL: \(TEST_PATCH_URL)")
                    return
                }
                // Step 2: Get default bundle (main.jsbundle is Hermes bytecode, just named .jsbundle)
                NSLog("🔍 DEBUG: Getting default bundle path...")
                let defaultBundlePath = getDefaultBundlePath()
                guard let defaultBundlePath = defaultBundlePath else {
                    NSLog("❌ Patch Test: Default bundle not found")
                    return
                }
                
                NSLog("✅ Patch Test: Default bundle found at: \(defaultBundlePath)")
                NSLog("   Note: main.jsbundle is Hermes bytecode (HBC format)")
                
                // Debug: Check bundle file details
                let fileManager = FileManager.default
                if fileManager.fileExists(atPath: defaultBundlePath) {
                    if let attributes = try? fileManager.attributesOfItem(atPath: defaultBundlePath),
                       let fileSize = attributes[.size] as? Int64 {
                        NSLog("📊 DEBUG: Bundle file exists - Size: \(fileSize) bytes")
                    }
                } else {
                    NSLog("❌ DEBUG: Bundle file does not exist at path!")
                }
                
                // Step 2.5: Download and extract HBC patch
                NSLog("🔍 DEBUG: Starting patch download and extraction...")
                let (patchZipPath, patchFilePath) = try downloadAndExtractPatch(
                    url: testURL,
                    extractTo: patchSlotPath
                )
                
                NSLog("📦 DEBUG: Patch ZIP path: \(patchZipPath)")
                NSLog("📄 DEBUG: Patch file path: \(patchFilePath)")
                
                // Debug: Check patch file details
                if fileManager.fileExists(atPath: patchFilePath) {
                    if let attributes = try? fileManager.attributesOfItem(atPath: patchFilePath),
                       let fileSize = attributes[.size] as? Int64 {
                        NSLog("📊 DEBUG: Patch file exists - Size: \(fileSize) bytes")
                    }
                } else {
                    NSLog("❌ DEBUG: Patch file does not exist at path!")
                }
                
                // Step 3: Apply patch - output as main.jsbundle (matching the naming convention)
                let buildFolder = patchSlotPath + "/" + StallionConstants.FilePaths.ZipFolderName
                let patchedBundlePath = buildFolder + "/" + StallionConstants.FilePaths.JSFileName
                
                // Ensure build directory exists
                NSLog("🔍 DEBUG: Creating build directory: \(buildFolder)")
                try fileManager.createDirectory(atPath: buildFolder, withIntermediateDirectories: true, attributes: nil)
                
                let patchFileName = (patchFilePath as NSString).lastPathComponent
                NSLog("✅ Patch Test: Using HBC patch for Hermes bytecode bundle")
                NSLog("📝 DEBUG: Patch file name: \(patchFileName)")
                
                // Debug: Verify all files exist before patching
                NSLog("🔍 DEBUG: Verifying files before patch application...")
                let oldFileExists = fileManager.fileExists(atPath: defaultBundlePath)
                let patchFileExists = fileManager.fileExists(atPath: patchFilePath)
                NSLog("   Old bundle exists: \(oldFileExists ? "✅" : "❌") - \(defaultBundlePath)")
                NSLog("   Patch file exists: \(patchFileExists ? "✅" : "❌") - \(patchFilePath)")
                
                if oldFileExists {
                    if let attributes = try? fileManager.attributesOfItem(atPath: defaultBundlePath),
                       let fileSize = attributes[.size] as? Int64 {
                        NSLog("   Old bundle size: \(fileSize) bytes")
                    }
                }
                
                if patchFileExists {
                    if let attributes = try? fileManager.attributesOfItem(atPath: patchFilePath),
                       let fileSize = attributes[.size] as? Int64 {
                        NSLog("   Patch file size: \(fileSize) bytes")
                    }
                }
                
                // Verify the base bundle matches what the patch expects
                // Get the first few bytes of both files to compare
                NSLog("🔍 DEBUG: Verifying base bundle compatibility...")
                if let oldData = try? Data(contentsOf: URL(fileURLWithPath: defaultBundlePath)),
                   oldData.count > 0 {
                    let oldHeader = oldData.prefix(64)
                    let oldHeaderHex = oldHeader.map { String(format: "%02x", $0) }.joined(separator: " ")
                    NSLog("   Base bundle header (first 64 bytes): \(oldHeaderHex.prefix(100))...")
                    NSLog("   Base bundle total size: \(oldData.count) bytes")
                }
                
                NSLog("🔧 Patch Test: Applying HBC patch...")
                NSLog("   Old file: \(defaultBundlePath)")
                NSLog("   New file: \(patchedBundlePath)")
                NSLog("   Patch file: \(patchFilePath)")
                
                NSLog("🔍 DEBUG: Calling bspatch_apply...")
                let success = StallionBSPatch.applyPatch(
                    oldFile: defaultBundlePath,
                    newFile: patchedBundlePath,
                    patchFile: patchFilePath
                )
                
                NSLog("🔍 DEBUG: bspatch_apply returned: \(success ? "true" : "false")")
                
                let patchedFileExists = fileManager.fileExists(atPath: patchedBundlePath)
                NSLog("🔍 DEBUG: Patched file exists: \(patchedFileExists ? "✅" : "❌")")
                
                if success && patchedFileExists {
                    // Verify patched bundle
                    if let attributes = try? fileManager.attributesOfItem(atPath: patchedBundlePath),
                       let fileSize = attributes[.size] as? Int64 {
                        NSLog("✅ Patch Test: Patch applied successfully!")
                        NSLog("📦 Patch Test: Patched bundle saved to: \(patchedBundlePath)")
                        NSLog("📊 Patch Test: Patched bundle size: \(fileSize) bytes")
                        
                        // Debug: Compare sizes
                        if let oldAttributes = try? fileManager.attributesOfItem(atPath: defaultBundlePath),
                           let oldSize = oldAttributes[.size] as? Int64 {
                            NSLog("📊 DEBUG: Size comparison:")
                            NSLog("   Old bundle: \(oldSize) bytes")
                            NSLog("   Patched bundle: \(fileSize) bytes")
                            NSLog("   Difference: \(fileSize - oldSize) bytes")
                        }
                        
                        // Clean up ZIP file
                        if fileManager.fileExists(atPath: patchZipPath) {
                            try fileManager.removeItem(atPath: patchZipPath)
                            NSLog("🧹 DEBUG: Cleaned up ZIP file")
                        }
                        
                        return
                    } else {
                        NSLog("❌ DEBUG: Patched file exists but cannot read attributes or size is 0")
                    }
                } else {
                    NSLog("❌ DEBUG: Patch application failed or patched file not created")
                    NSLog("   success: \(success)")
                    NSLog("   patchedFileExists: \(patchedFileExists)")
                }
                
                NSLog("❌ Patch Test: Failed to apply patch or verify patched bundle")
                NSLog("   Error code -12 means BSPATCH_ERR_OVERFLOW - patch format mismatch")
                NSLog("")
                NSLog("   🔍 Troubleshooting:")
                NSLog("   1. The patch file was generated from a specific base bundle")
                NSLog("   2. The base bundle in Stage/New might not match the one used to generate the patch")
                NSLog("   3. Ensure the patch was generated from the exact bundle at:")
                NSLog("      \(defaultBundlePath)")
                NSLog("")
                NSLog("   💡 To fix:")
                NSLog("   - Generate the patch using the bundle from Stage/New as the base")
                NSLog("   - Or ensure the bundle in Stage/New matches the bundle used for patch generation")
                NSLog("")
                NSLog("   📊 Current base bundle:")
                if let oldAttributes = try? fileManager.attributesOfItem(atPath: defaultBundlePath),
                   let oldSize = oldAttributes[.size] as? Int64 {
                    NSLog("      Size: \(oldSize) bytes")
                    NSLog("      Path: \(defaultBundlePath)")
                }
                
            } catch {
                NSLog("❌ Patch Test Error: \(error.localizedDescription)")
            }
        }
    }
    
    private static func downloadAndExtractPatch(url: URL, extractTo: String) throws -> (String, String) {
        let fileManager = FileManager.default
        
        // Create destination directory
        let extractFolder = URL(fileURLWithPath: extractTo, isDirectory: true)
        if fileManager.fileExists(atPath: extractTo) {
            try fileManager.removeItem(at: extractFolder)
        }
        try fileManager.createDirectory(at: extractFolder, withIntermediateDirectories: true, attributes: nil)
        
        // Download the ZIP file
        let semaphore = DispatchSemaphore(value: 0)
        var downloadError: Error?
        var tempZipURL: URL?
        
        let downloadTask = URLSession.shared.downloadTask(with: url) { tempURL, response, error in
            if let error = error {
                downloadError = error
                semaphore.signal()
                return
            }
            
            guard let tempURL = tempURL else {
                downloadError = NSError(domain: "DownloadError", code: -1, userInfo: [NSLocalizedDescriptionKey: "No file downloaded"])
                semaphore.signal()
                return
            }
            
            tempZipURL = tempURL
            semaphore.signal()
        }
        
        downloadTask.resume()
        semaphore.wait()
        
        if let error = downloadError {
            throw error
        }
        
        guard let zipURL = tempZipURL else {
            throw NSError(domain: "DownloadError", code: -1, userInfo: [NSLocalizedDescriptionKey: "No file downloaded"])
        }
        
        // Move to final location
        let finalZipPath = extractTo + "/patch.zip"
        if fileManager.fileExists(atPath: finalZipPath) {
            try fileManager.removeItem(atPath: finalZipPath)
        }
        try fileManager.moveItem(at: zipURL, to: URL(fileURLWithPath: finalZipPath))
        
        // Extract ZIP
        let zipURLFinal = URL(fileURLWithPath: finalZipPath)
        try fileManager.unzipItem(at: zipURLFinal, to: extractFolder)
        
        // Find patch file in extracted contents - prioritize matching bundle type
        // ZIP structure: patches/ folder contains the patch files
        let patchesFolder = extractFolder.appendingPathComponent("patches")
        NSLog("🔍 Patch Test: Looking for patch files in: \(patchesFolder.path)")
        
        // Check if patches folder exists
        guard fileManager.fileExists(atPath: patchesFolder.path) else {
            NSLog("❌ Patch Test: patches/ folder not found in ZIP")
            throw NSError(domain: "PatchError", code: -1, userInfo: [NSLocalizedDescriptionKey: "patches/ folder not found in ZIP"])
        }
        
        NSLog("✅ Patch Test: Found patches/ folder")
        
        // List all files in patches folder for debugging
        if let files = try? fileManager.contentsOfDirectory(atPath: patchesFolder.path) {
            NSLog("📂 Patch Test: Files in patches/ folder: \(files.joined(separator: ", "))")
        }
        
        // Look for patch file - try multiple possible names
        // Priority: patch.diff (standard), then HBC-specific names, then generic names
        let patchNames = ["patch.diff", "main.jsbundle.hbc.patch", "bundle.patch", "patch.patch"]
        
        for patchName in patchNames {
            let patchPath = patchesFolder.appendingPathComponent(patchName).path
            if fileManager.fileExists(atPath: patchPath) {
                NSLog("✅ Patch Test: Found patch file: \(patchName)")
                return (finalZipPath, patchPath)
            }
        }
        
        throw NSError(domain: "PatchError", code: -1, userInfo: [NSLocalizedDescriptionKey: "Patch file not found in patches/ folder. Tried: \(patchNames.joined(separator: ", "))"])
    }
    
    private static func getDefaultBundlePath() -> String? {
        NSLog("🔍 DEBUG: Searching for bundle in Stage/New slot...")
        
        guard let stateManager = StallionStateManager.sharedInstance(),
              let config = stateManager.stallionConfig else {
            NSLog("❌ DEBUG: StateManager not initialized")
            return nil
        }
        
        guard let baseFolderPath = config.filesDirectory, !baseFolderPath.isEmpty else {
            NSLog("❌ DEBUG: filesDirectory is nil or empty in StallionConfig")
            return nil
        }
        
        // Path: baseFolderPath/StallionStage/StallionNew/build/main.jsbundle
        let stageNewSlotPath = baseFolderPath + "/" + StallionConstants.STAGE_DIRECTORY + "/" + StallionConstants.NEW_FOLDER_SLOT
        let bundlePath = stageNewSlotPath + "/" + StallionConstants.FilePaths.ZipFolderName + "/" + StallionConstants.FilePaths.JSFileName
        
        NSLog("🔍 DEBUG: Stage/New slot path: \(stageNewSlotPath)")
        NSLog("🔍 DEBUG: Bundle path: \(bundlePath)")
        
        let fileManager = FileManager.default
        if fileManager.fileExists(atPath: bundlePath) {
            NSLog("✅ DEBUG: Found bundle in Stage/New slot: \(bundlePath)")
            if let attributes = try? fileManager.attributesOfItem(atPath: bundlePath),
               let fileSize = attributes[.size] as? Int64 {
                NSLog("📊 DEBUG: Bundle size: \(fileSize) bytes")
            }
            return bundlePath
        } else {
            NSLog("❌ DEBUG: Bundle not found in Stage/New slot")
            NSLog("   Expected path: \(bundlePath)")
            return nil
        }
    }
}
