#include "pch.h"
#include "StallionNetwork.h"

namespace fs = std::filesystem;

namespace
{
  std::wstring Wide(std::string const &value)
  {
    if (value.empty()) return {};
    int size = MultiByteToWideChar(CP_UTF8, 0, value.data(), static_cast<int>(value.size()), nullptr, 0);
    std::wstring result(size, L'\0');
    MultiByteToWideChar(CP_UTF8, 0, value.data(), static_cast<int>(value.size()), result.data(), size);
    return result;
  }

  std::string Utf8(std::wstring const &value)
  {
    if (value.empty()) return {};
    int size = WideCharToMultiByte(CP_UTF8, 0, value.data(), static_cast<int>(value.size()), nullptr, 0, nullptr, nullptr);
    std::string result(size, '\0');
    WideCharToMultiByte(CP_UTF8, 0, value.data(), static_cast<int>(value.size()), result.data(), size, nullptr, nullptr);
    return result;
  }

  struct Handles
  {
    HINTERNET session{nullptr};
    HINTERNET connection{nullptr};
    HINTERNET request{nullptr};
    ~Handles() { if (request) WinHttpCloseHandle(request); if (connection) WinHttpCloseHandle(connection); if (session) WinHttpCloseHandle(session); }
  };

  bool Open(std::string const &url, wchar_t const *verb, Handles &handles, std::string &error)
  {
    auto wideUrl = Wide(url);
    URL_COMPONENTS parts{sizeof(parts)};
    parts.dwSchemeLength = static_cast<DWORD>(-1);
    parts.dwHostNameLength = static_cast<DWORD>(-1);
    parts.dwUrlPathLength = static_cast<DWORD>(-1);
    parts.dwExtraInfoLength = static_cast<DWORD>(-1);
    if (!WinHttpCrackUrl(wideUrl.c_str(), 0, 0, &parts)) { error = "Invalid update URL"; return false; }
    std::wstring host(parts.lpszHostName, parts.dwHostNameLength);
    bool secure = parts.nScheme == INTERNET_SCHEME_HTTPS;
    bool loopback = host == L"127.0.0.1" || host == L"localhost" || host == L"::1" || host == L"[::1]";
    if (!secure && !loopback) { error = "Stallion only accepts HTTPS or loopback test URLs"; return false; }
    std::wstring path(parts.lpszUrlPath, parts.dwUrlPathLength);
    if (parts.dwExtraInfoLength) path.append(parts.lpszExtraInfo, parts.dwExtraInfoLength);
    handles.session = WinHttpOpen(L"react-native-stallion-windows/0.1", WINHTTP_ACCESS_TYPE_AUTOMATIC_PROXY,
                                  WINHTTP_NO_PROXY_NAME, WINHTTP_NO_PROXY_BYPASS, 0);
    if (!handles.session) { error = "Unable to initialize WinHTTP"; return false; }
    WinHttpSetTimeouts(handles.session, 15000, 15000, 30000, 30000);
    handles.connection = WinHttpConnect(handles.session, host.c_str(), parts.nPort, 0);
    handles.request = handles.connection ? WinHttpOpenRequest(handles.connection, verb, path.c_str(), nullptr,
      WINHTTP_NO_REFERER, WINHTTP_DEFAULT_ACCEPT_TYPES, secure ? WINHTTP_FLAG_SECURE : 0) : nullptr;
    if (!handles.request) { error = "Unable to create HTTP request"; return false; }
    return true;
  }

  void AddHeaders(HINTERNET request, std::string const &appToken, std::string const &sdkToken, std::string const &uid)
  {
    auto app = L"x-app-token: " + Wide(appToken);
    WinHttpAddRequestHeaders(request, app.c_str(), static_cast<DWORD>(-1), WINHTTP_ADDREQ_FLAG_REPLACE | WINHTTP_ADDREQ_FLAG_ADD);
    if (!sdkToken.empty()) {
      auto sdk = L"x-sdk-pin-access-token: " + Wide(sdkToken);
      WinHttpAddRequestHeaders(request, sdk.c_str(), static_cast<DWORD>(-1), WINHTTP_ADDREQ_FLAG_REPLACE | WINHTTP_ADDREQ_FLAG_ADD);
    }
    if (!uid.empty()) {
      auto device = L"uid: " + Wide(uid);
      WinHttpAddRequestHeaders(request, device.c_str(), static_cast<DWORD>(-1), WINHTTP_ADDREQ_FLAG_REPLACE | WINHTTP_ADDREQ_FLAG_ADD);
    }
  }

  uint32_t Status(HINTERNET request)
  {
    DWORD status = 0, size = sizeof(status);
    WinHttpQueryHeaders(request, WINHTTP_QUERY_STATUS_CODE | WINHTTP_QUERY_FLAG_NUMBER, nullptr, &status, &size, nullptr);
    return status;
  }

  class DiskDownloadFile final : public ReactNativeStallionWindows::DownloadFile
  {
  public:
    explicit DiskDownloadFile(fs::path destination) : destination_(std::move(destination)) {}
    uint64_t ExistingSize() noexcept override
    {
      std::error_code error;
      fs::create_directories(destination_.parent_path(), error);
      if (error) return 0;
      auto size = fs::file_size(destination_, error);
      return error ? 0 : size;
    }
    bool Open(bool append) noexcept override
    {
      output_.open(destination_, std::ios::binary | (append ? std::ios::app : std::ios::trunc));
      return output_.good();
    }
    bool Write(char const *data, size_t size) noexcept override
    {
      output_.write(data, static_cast<std::streamsize>(size));
      return output_.good();
    }
  private:
    fs::path destination_;
    std::ofstream output_;
  };
}

namespace ReactNativeStallionWindows
{
  HttpResult StallionNetwork::PostJson(std::string const &url, std::string const &body,
                                       std::string const &appToken, std::string const &sdkToken,
                                       std::string const &uid) noexcept
  {
    Handles handles;
    std::string error;
    if (!Open(url, L"POST", handles, error)) return {false, 0, {}, error};
    AddHeaders(handles.request, appToken, sdkToken, uid);
    WinHttpAddRequestHeaders(handles.request, L"Content-Type: application/json", static_cast<DWORD>(-1), WINHTTP_ADDREQ_FLAG_ADD);
    if (!WinHttpSendRequest(handles.request, WINHTTP_NO_ADDITIONAL_HEADERS, 0,
                            const_cast<char *>(body.data()), static_cast<DWORD>(body.size()), static_cast<DWORD>(body.size()), 0) ||
        !WinHttpReceiveResponse(handles.request, nullptr)) return {false, 0, {}, "Update metadata request failed"};
    std::string response;
    for (;;) {
      DWORD available = 0;
      if (!WinHttpQueryDataAvailable(handles.request, &available)) return {false, Status(handles.request), {}, "Unable to read metadata response"};
      if (!available) break;
      auto offset = response.size();
      response.resize(offset + available);
      DWORD read = 0;
      if (!WinHttpReadData(handles.request, response.data() + offset, available, &read)) return {false, Status(handles.request), {}, "Unable to read metadata response"};
      response.resize(offset + read);
      if (response.size() > 4 * 1024 * 1024) return {false, Status(handles.request), {}, "Metadata response is too large"};
    }
    auto status = Status(handles.request);
    return {status >= 200 && status < 300, status, response, status >= 200 && status < 300 ? "" : "Metadata endpoint returned an error"};
  }

  HttpResult StallionNetwork::Download(std::string const &url, fs::path const &destination,
                                       std::string const &appToken, std::string const &sdkToken,
                                       std::string const &uid,
                                       std::function<void(double)> const &onProgress) noexcept
  {
    DiskDownloadFile file(destination);
    return DownloadToFile(url, file, appToken, sdkToken, uid, onProgress);
  }

  HttpResult StallionNetwork::DownloadToFile(std::string const &url, DownloadFile &file,
                                       std::string const &appToken, std::string const &sdkToken,
                                       std::string const &uid,
                                       std::function<void(double)> const &onProgress) noexcept
  {
    Handles handles;
    std::string error;
    if (!Open(url, L"GET", handles, error)) return {false, 0, {}, error};
    AddHeaders(handles.request, appToken, sdkToken, uid);
    uint64_t offset = file.ExistingSize();
    if (offset) {
      auto range = L"Range: bytes=" + std::to_wstring(offset) + L"-";
      WinHttpAddRequestHeaders(handles.request, range.c_str(), static_cast<DWORD>(-1), WINHTTP_ADDREQ_FLAG_ADD);
    }
    if (!WinHttpSendRequest(handles.request, WINHTTP_NO_ADDITIONAL_HEADERS, 0, WINHTTP_NO_REQUEST_DATA, 0, 0, 0) ||
        !WinHttpReceiveResponse(handles.request, nullptr)) return {false, 0, {}, "Update download failed"};
    auto status = Status(handles.request);
    if (status != 200 && status != 206) return {false, status, {}, "Download endpoint returned an error"};
    if (offset && status == 200) offset = 0;
    if (!file.Open(offset != 0)) return {false, status, {}, "Unable to open download cache"};
    DWORD contentLength = 0, headerSize = sizeof(contentLength);
    WinHttpQueryHeaders(handles.request, WINHTTP_QUERY_CONTENT_LENGTH | WINHTTP_QUERY_FLAG_NUMBER, nullptr, &contentLength, &headerSize, nullptr);
    uint64_t received = offset;
    uint64_t total = offset + contentLength;
    std::array<char, 256 * 1024> buffer{};
    for (;;) {
      DWORD read = 0;
      if (!WinHttpReadData(handles.request, buffer.data(), static_cast<DWORD>(buffer.size()), &read)) return {false, status, {}, "Interrupted update download"};
      if (!read) break;
      if (!file.Write(buffer.data(), read)) return {false, status, {}, "Unable to write update download"};
      received += read;
      if (total && onProgress) onProgress(static_cast<double>(received) / static_cast<double>(total));
    }
    return {true, status, {}, {}};
  }
}
