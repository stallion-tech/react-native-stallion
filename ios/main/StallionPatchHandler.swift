//
//  StallionPatchHandler.swift
//  react-native-stallion
//
//  Created by Thor963 on 29/11/25.
//

import Foundation

class StallionPatchHandler {
    
    /**
     * Applies a patch to the base bundle using the diff file.
     *
     * @param baseBundlePath The path to the base bundle folder
     * @param diffPath The path to the downloaded diff folder
     * @param isBundlePatched Whether the bundle file uses bspatch (true) or file-based patching (false)
     * @throws Error if patch application fails at any point
     */
    static func applyPatch(baseBundlePath: String, diffPath: String, isBundlePatched: Bool) throws {
        let baseBundleDir = URL(fileURLWithPath: baseBundlePath)
        let diffDir = URL(fileURLWithPath: diffPath)
        
        // Validate inputs
        var isDirectory: ObjCBool = false
        guard FileManager.default.fileExists(atPath: baseBundlePath, isDirectory: &isDirectory),
              isDirectory.boolValue else {
            throw NSError(domain: "StallionPatchHandler", code: -1,
                         userInfo: [NSLocalizedDescriptionKey: "Base bundle path does not exist or is not a directory: \(baseBundlePath)"])
        }
        
        guard FileManager.default.fileExists(atPath: diffPath, isDirectory: &isDirectory),
              isDirectory.boolValue else {
            throw NSError(domain: "StallionPatchHandler", code: -2,
                         userInfo: [NSLocalizedDescriptionKey: "Diff path does not exist or is not a directory: \(diffPath)"])
        }
        
        // Path to manifest.json (in diffDir, not in unzip folder based on user's changes)
        let manifestFile = diffDir.appendingPathComponent("manifest.json")
        guard FileManager.default.fileExists(atPath: manifestFile.path) else {
            throw NSError(domain: "StallionPatchHandler", code: -3,
                         userInfo: [NSLocalizedDescriptionKey: "Manifest file does not exist: \(manifestFile.path)"])
        }
        
        // Create a temporary directory for the patched bundle
        let tempPatchedDir = diffDir.deletingLastPathComponent()
            .appendingPathComponent(diffDir.lastPathComponent + "_patched_temp")
        
        // Use defer to ensure cleanup
        defer {
            // Clean up temporary directory
            if FileManager.default.fileExists(atPath: tempPatchedDir.path) {
                try? FileManager.default.removeItem(at: tempPatchedDir)
            }
        }
        
        // Copy base bundle to temporary location
        StallionFileManager.copyFileOrDirectory(from: baseBundlePath, to: tempPatchedDir.path)
        
        // Verify copy succeeded
        guard FileManager.default.fileExists(atPath: tempPatchedDir.path) else {
            throw NSError(domain: "StallionPatchHandler", code: -8,
                         userInfo: [NSLocalizedDescriptionKey: "Failed to copy base bundle to temporary directory"])
        }
        
        // Read and parse manifest.json
        let manifest = try readManifest(manifestFile: manifestFile)
        
        // Apply manifest changes (diffDir contains the files, not diffUnzipDir)
        try applyManifestChanges(manifest: manifest, diffDir: diffDir, patchedDir: tempPatchedDir, isBundlePatched: isBundlePatched)
        
        // Replace diffPath contents with patched result
        // First, clear the diffPath
        let diffDirContents = try FileManager.default.contentsOfDirectory(at: diffDir, includingPropertiesForKeys: nil)
        for file in diffDirContents {
            try? FileManager.default.removeItem(at: file)
        }
        
        // Copy patched result to diffPath
        let tempPatchedContents = try FileManager.default.contentsOfDirectory(at: tempPatchedDir, includingPropertiesForKeys: nil)
        for file in tempPatchedContents {
            let destFile = diffDir.appendingPathComponent(file.lastPathComponent)
            StallionFileManager.copyFileOrDirectory(from: file.path, to: destFile.path)
        }
    }
    
    /**
     * Reads and parses the manifest.json file.
     */
    private static func readManifest(manifestFile: URL) throws -> [String: Any] {
        let data = try Data(contentsOf: manifestFile)
        guard let manifest = try JSONSerialization.jsonObject(with: data, options: []) as? [String: Any] else {
            throw NSError(domain: "StallionPatchHandler", code: -4,
                         userInfo: [NSLocalizedDescriptionKey: "Failed to parse manifest JSON"])
        }
        return manifest
    }
    
    /**
     * Applies the changes specified in the manifest to the patched directory.
     */
    private static func applyManifestChanges(manifest: [String: Any], diffDir: URL, patchedDir: URL, isBundlePatched: Bool) throws {
        // Apply deletions first
        if let deleted = manifest["deleted"] as? [String] {
            for filePath in deleted {
                let fileToDelete = patchedDir.appendingPathComponent(filePath)
                if FileManager.default.fileExists(atPath: fileToDelete.path) {
                    try? FileManager.default.removeItem(at: fileToDelete)
                }
            }
        }
        
        // Apply modifications (files that already exist)
        if let modified = manifest["modified"] as? [String] {
            for filePath in modified {
                try applyFileFromDiff(diffDir: diffDir, patchedDir: patchedDir, relativeFilePath: filePath, isBundlePatched: isBundlePatched)
            }
        }
        
        // Apply additions (new files)
        if let added = manifest["added"] as? [String] {
            for filePath in added {
                try applyFileFromDiff(diffDir: diffDir, patchedDir: patchedDir, relativeFilePath: filePath, isBundlePatched: isBundlePatched)
            }
        }
    }
    
    /**
     * Copies a file from the diff directory to the patched directory.
     * If the file is main.jsbundle and isBundlePatched is true, applies bspatch instead of copying.
     */
    private static func applyFileFromDiff(diffDir: URL, patchedDir: URL, relativeFilePath: String, isBundlePatched: Bool) throws {
        let sourceFile = diffDir.appendingPathComponent(relativeFilePath)
        let destFile = patchedDir.appendingPathComponent(relativeFilePath)
        
        guard FileManager.default.fileExists(atPath: sourceFile.path) else {
            throw NSError(domain: "StallionPatchHandler", code: -5,
                         userInfo: [NSLocalizedDescriptionKey: "Source file does not exist in diff: \(sourceFile.path)"])
        }
        
        // Ensure parent directory exists
        let parentDir = destFile.deletingLastPathComponent()
        try? FileManager.default.createDirectory(at: parentDir, withIntermediateDirectories: true, attributes: nil)
        
        // Check if this is the main.jsbundle file
        let bundleFileName = StallionObjConstants.bundle_file_name
        let normalizedPath = relativeFilePath.replacingOccurrences(of: "\\", with: "/")
        let isBundleFile = normalizedPath.hasSuffix("/" + (bundleFileName ?? "")) || normalizedPath == bundleFileName
        
        if isBundleFile && isBundlePatched {
            // This is the bundle file and it's a binary patch - use bspatch
            // The base bundle file should already exist in the patched directory (from the initial copy)
            let baseBundleFile = destFile
            
            guard FileManager.default.fileExists(atPath: baseBundleFile.path) else {
                throw NSError(domain: "StallionPatchHandler", code: -6,
                             userInfo: [NSLocalizedDescriptionKey: "Base bundle file does not exist for patching: \(baseBundleFile.path)"])
            }
            
            // Create a temporary file for the patched output
            let tempPatchedFile = destFile.deletingLastPathComponent()
                .appendingPathComponent(destFile.lastPathComponent + ".tmp")
            
            do {
                // Apply bspatch: patch the base bundle using the diff file
                let success = StallionBSPatch.applyPatch(
                    oldFile: baseBundleFile.path,
                    newFile: tempPatchedFile.path,
                    patchFile: sourceFile.path
                )
                
                guard success else {
                    throw NSError(domain: "StallionPatchHandler", code: -7,
                                 userInfo: [NSLocalizedDescriptionKey: "Failed to apply bspatch to \(relativeFilePath)"])
                }
                
                // Replace the original file with the patched one
                if FileManager.default.fileExists(atPath: destFile.path) {
                    try? FileManager.default.removeItem(at: destFile)
                }
                StallionFileManager.moveFile(from: tempPatchedFile.path, to: destFile.path)
                
                // Verify move succeeded
                guard FileManager.default.fileExists(atPath: destFile.path) else {
                    throw NSError(domain: "StallionPatchHandler", code: -8,
                                 userInfo: [NSLocalizedDescriptionKey: "Failed to move patched bundle file"])
                }
            } catch {
                // Clean up temp file on error
                if FileManager.default.fileExists(atPath: tempPatchedFile.path) {
                    try? FileManager.default.removeItem(at: tempPatchedFile)
                }
                throw error
            }
        } else {
            // Regular file - copy normally
            StallionFileManager.moveFile(from: sourceFile.path, to: destFile.path)
            
            // Verify copy succeeded
            guard FileManager.default.fileExists(atPath: destFile.path) else {
                throw NSError(domain: "StallionPatchHandler", code: -9,
                             userInfo: [NSLocalizedDescriptionKey: "Failed to copy file: \(relativeFilePath)"])
            }
        }
    }
}
