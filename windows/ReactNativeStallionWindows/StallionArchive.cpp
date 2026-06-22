#include "pch.h"
#include "StallionArchive.h"

#include <zip.h>

namespace fs = std::filesystem;

namespace
{
  bool IsSafeRelativePath(std::string const &name)
  {
    if (name.empty() || name.size() > 1024 || name.front() == '/' || name.front() == '\\') return false;
    if (name.find(':') != std::string::npos || name.find('\\') != std::string::npos || name.find('\0') != std::string::npos) return false;
    std::u8string utf8(name.begin(), name.end());
    auto path = fs::path(utf8).lexically_normal();
    if (path.empty() || path.is_absolute()) return false;
    for (auto const &part : path) if (part == L"..") return false;
    return true;
  }

  bool IsLink(zip_t *archive, zip_uint64_t index)
  {
    zip_uint8_t operatingSystem{};
    zip_uint32_t attributes{};
    if (zip_file_get_external_attributes(archive, index, 0, &operatingSystem, &attributes) != 0) return true;
    if (operatingSystem != ZIP_OPSYS_UNIX) return false;
    constexpr zip_uint32_t fileTypeMask = 0170000;
    constexpr zip_uint32_t symbolicLink = 0120000;
    return ((attributes >> 16) & fileTypeMask) == symbolicLink;
  }

  struct ArchiveCloser
  {
    void operator()(zip_t *archive) const noexcept { zip_close(archive); }
  };

  struct FileCloser
  {
    void operator()(zip_file_t *file) const noexcept { zip_fclose(file); }
  };
}

namespace ReactNativeStallionWindows
{
  ArchiveResult StallionArchive::ExtractZip(fs::path const &archivePath, fs::path const &destination,
                                             std::string const &password, uint64_t maximumExpandedBytes) noexcept
  {
    try {
      int openError{};
      std::unique_ptr<zip_t, ArchiveCloser> archive(
        zip_open(winrt::to_string(winrt::hstring(archivePath.wstring())).c_str(), ZIP_RDONLY, &openError));
      if (!archive) {
        zip_error_t error;
        zip_error_init_with_code(&error, openError);
        auto message = std::string("Unable to open update archive: ") + zip_error_strerror(&error);
        zip_error_fini(&error);
        return {false, std::move(message)};
      }

      std::error_code fileError;
      fs::remove_all(destination, fileError);
      fileError.clear();
      fs::create_directories(destination, fileError);
      if (fileError) return {false, "Unable to create archive extraction directory"};
      std::unordered_set<std::string> names;
      uint64_t expandedBytes{};
      auto count = zip_get_num_entries(archive.get(), 0);
      if (count < 0) return {false, std::string("Unable to enumerate update archive: ") + zip_strerror(archive.get())};

      for (zip_int64_t index = 0; index < count; ++index) {
        zip_stat_t stat{};
        zip_stat_init(&stat);
        if (zip_stat_index(archive.get(), static_cast<zip_uint64_t>(index), ZIP_FL_ENC_GUESS, &stat) != 0 || !stat.name) {
          return {false, std::string("Unable to inspect ZIP entry: ") + zip_strerror(archive.get())};
        }
        std::string name(stat.name);
        if (!IsSafeRelativePath(name) || !names.insert(name).second) return {false, "Unsafe or duplicate ZIP entry"};
        if (IsLink(archive.get(), static_cast<zip_uint64_t>(index))) return {false, "ZIP links are not supported"};
        if (!(stat.valid & ZIP_STAT_SIZE)) return {false, "ZIP entry has no expanded size"};
        if (stat.size > maximumExpandedBytes || expandedBytes > maximumExpandedBytes - stat.size) {
          return {false, "Expanded archive exceeds safety limit"};
        }
        expandedBytes += stat.size;

        std::u8string utf8Name(name.begin(), name.end());
        auto outputPath = destination / fs::path(utf8Name);
        bool directory = name.back() == '/';
        if (directory) {
          fileError.clear();
          fs::create_directories(outputPath, fileError);
          if (fileError) return {false, "Unable to create extracted update directory"};
          continue;
        }

        bool encrypted = (stat.valid & ZIP_STAT_ENCRYPTION_METHOD) && stat.encryption_method != ZIP_EM_NONE;
        if (encrypted && password.empty()) return {false, "Encrypted ZIP requires StallionArchivePassword"};
        std::unique_ptr<zip_file_t, FileCloser> input(zip_fopen_index_encrypted(
          archive.get(), static_cast<zip_uint64_t>(index), 0, encrypted ? password.c_str() : nullptr));
        if (!input) return {false, std::string("Unable to open ZIP entry: ") + zip_strerror(archive.get())};

        fileError.clear();
        fs::create_directories(outputPath.parent_path(), fileError);
        if (fileError) return {false, "Unable to create extracted update directory"};
        std::ofstream output(outputPath, std::ios::binary | std::ios::trunc);
        if (!output) return {false, "Unable to create extracted update file"};
        std::array<char, 64 * 1024> buffer{};
        uint64_t written{};
        while (true) {
          auto read = zip_fread(input.get(), buffer.data(), buffer.size());
          if (read < 0) return {false, std::string("Unable to decrypt or extract ZIP entry: ") + zip_file_strerror(input.get())};
          if (read == 0) break;
          written += static_cast<uint64_t>(read);
          if (written > stat.size) return {false, "ZIP entry exceeded its declared size"};
          output.write(buffer.data(), static_cast<std::streamsize>(read));
          if (!output) return {false, "Unable to write extracted update file"};
        }
        if (written != stat.size) return {false, "ZIP entry did not match its declared size"};
      }
      if (!fs::is_regular_file(destination / L"build" / L"index.windows.bundle")) {
        return {false, "Archive does not contain build/index.windows.bundle"};
      }
      return {true, {}};
    } catch (std::exception const &error) {
      return {false, error.what()};
    }
  }
}
