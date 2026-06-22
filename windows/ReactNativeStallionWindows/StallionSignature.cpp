#include "pch.h"
#include "StallionSignature.h"

#include <bcrypt.h>
#pragma comment(lib, "bcrypt.lib")

using namespace winrt::Windows::Data::Json;
namespace fs = std::filesystem;

namespace
{
  struct Algorithm
  {
    BCRYPT_ALG_HANDLE value{};
    ~Algorithm() { if (value) BCryptCloseAlgorithmProvider(value, 0); }
  };
  struct Hash
  {
    BCRYPT_HASH_HANDLE value{};
    ~Hash() { if (value) BCryptDestroyHash(value); }
  };
  struct Key
  {
    BCRYPT_KEY_HANDLE value{};
    ~Key() { if (value) BCryptDestroyKey(value); }
  };

  std::vector<uint8_t> Sha256(std::vector<uint8_t> const &data)
  {
    Algorithm algorithm;
    if (BCryptOpenAlgorithmProvider(&algorithm.value, BCRYPT_SHA256_ALGORITHM, nullptr, 0) < 0) throw std::runtime_error("SHA-256 is unavailable");
    DWORD objectSize = 0, hashSize = 0, copied = 0;
    BCryptGetProperty(algorithm.value, BCRYPT_OBJECT_LENGTH, reinterpret_cast<PUCHAR>(&objectSize), sizeof(objectSize), &copied, 0);
    BCryptGetProperty(algorithm.value, BCRYPT_HASH_LENGTH, reinterpret_cast<PUCHAR>(&hashSize), sizeof(hashSize), &copied, 0);
    std::vector<uint8_t> object(objectSize), digest(hashSize);
    Hash hash;
    if (BCryptCreateHash(algorithm.value, &hash.value, object.data(), objectSize, nullptr, 0, 0) < 0 ||
        BCryptHashData(hash.value, const_cast<PUCHAR>(data.data()), static_cast<ULONG>(data.size()), 0) < 0 ||
        BCryptFinishHash(hash.value, digest.data(), hashSize, 0) < 0) throw std::runtime_error("SHA-256 failed");
    return digest;
  }

  std::vector<uint8_t> Sha256File(fs::path const &path)
  {
    std::ifstream input(path, std::ios::binary);
    if (!input) throw std::runtime_error("Unable to hash release file");
    std::vector<uint8_t> bytes(std::istreambuf_iterator<char>(input), {});
    return Sha256(bytes);
  }

  std::string Hex(std::vector<uint8_t> const &bytes)
  {
    static char const digits[] = "0123456789abcdef";
    std::string value(bytes.size() * 2, '0');
    for (size_t i = 0; i < bytes.size(); ++i) { value[i * 2] = digits[bytes[i] >> 4]; value[i * 2 + 1] = digits[bytes[i] & 15]; }
    return value;
  }

  std::vector<uint8_t> DecodeBase64(std::string value, DWORD flags)
  {
    DWORD size = 0;
    if (!CryptStringToBinaryA(value.c_str(), static_cast<DWORD>(value.size()), flags, nullptr, &size, nullptr, nullptr)) {
      throw std::runtime_error("Invalid base64 data");
    }
    std::vector<uint8_t> bytes(size);
    if (!CryptStringToBinaryA(value.c_str(), static_cast<DWORD>(value.size()), flags, bytes.data(), &size, nullptr, nullptr)) {
      throw std::runtime_error("Invalid base64 data");
    }
    bytes.resize(size);
    return bytes;
  }

  std::vector<uint8_t> DecodeBase64Url(std::string value)
  {
    std::replace(value.begin(), value.end(), '-', '+'); std::replace(value.begin(), value.end(), '_', '/');
    while (value.size() % 4) value.push_back('=');
    return DecodeBase64(std::move(value), CRYPT_STRING_BASE64);
  }

  std::vector<uint8_t> DecodePublicKey(std::string const &value)
  {
    auto flags = value.find("-----BEGIN PUBLIC KEY-----") != std::string::npos
      ? CRYPT_STRING_BASE64HEADER
      : CRYPT_STRING_BASE64;
    return DecodeBase64(value, flags);
  }

  std::string ReadText(fs::path const &path)
  {
    std::ifstream input(path, std::ios::binary); return {std::istreambuf_iterator<char>(input), {}};
  }
}

namespace ReactNativeStallionWindows
{
  std::string StallionSignature::ComputeFolderHash(fs::path const &buildDirectory)
  {
    std::vector<std::string> manifest;
    for (auto const &entry : fs::recursive_directory_iterator(buildDirectory)) {
      if (!entry.is_regular_file()) continue;
      auto relative = fs::relative(entry.path(), buildDirectory).generic_u8string();
      std::string path(relative.begin(), relative.end());
      if (path == ".DS_Store" || path == ".stallionsigned" || path.rfind("__MACOSX/", 0) == 0) continue;
      manifest.push_back(path + ":" + Hex(Sha256File(entry.path())));
    }
    std::sort(manifest.begin(), manifest.end());
    JsonArray json;
    for (auto const &item : manifest) json.Append(JsonValue::CreateStringValue(winrt::to_hstring(item)));
    auto serialized = winrt::to_string(json.Stringify());
    return Hex(Sha256(std::vector<uint8_t>(serialized.begin(), serialized.end())));
  }

  bool StallionSignature::Verify(fs::path const &buildDirectory, std::string const &publicKeyPem, std::string &error) noexcept
  {
    try {
      auto jwt = ReadText(buildDirectory / L".stallionsigned");
      auto first = jwt.find('.'), second = first == std::string::npos ? first : jwt.find('.', first + 1);
      if (first == std::string::npos || second == std::string::npos || jwt.find('.', second + 1) != std::string::npos) throw std::runtime_error("Invalid Stallion signature file");
      auto content = jwt.substr(0, second);
      auto headerBytes = DecodeBase64Url(jwt.substr(0, first));
      JsonObject header;
      if (!JsonObject::TryParse(winrt::to_hstring(std::string(headerBytes.begin(), headerBytes.end())), header) ||
          header.GetNamedString(L"alg", L"") != L"RS256") throw std::runtime_error("Signature algorithm must be RS256");
      auto payloadBytes = DecodeBase64Url(jwt.substr(first + 1, second - first - 1));
      JsonObject payload;
      if (!JsonObject::TryParse(winrt::to_hstring(std::string(payloadBytes.begin(), payloadBytes.end())), payload)) throw std::runtime_error("Invalid signature payload");
      auto expected = winrt::to_string(payload.GetNamedString(L"packageHash"));
      if (expected != ComputeFolderHash(buildDirectory)) throw std::runtime_error("Signed package hash does not match release contents");

      auto keyDer = DecodePublicKey(publicKeyPem);
      CERT_PUBLIC_KEY_INFO *keyInfo = nullptr;
      DWORD keyInfoSize = 0;
      if (!CryptDecodeObjectEx(X509_ASN_ENCODING, X509_PUBLIC_KEY_INFO, keyDer.data(), static_cast<DWORD>(keyDer.size()),
                               CRYPT_DECODE_ALLOC_FLAG, nullptr, &keyInfo, &keyInfoSize)) throw std::runtime_error("Invalid RSA public key");
      Key key;
      BOOL imported = CryptImportPublicKeyInfoEx2(X509_ASN_ENCODING, keyInfo, 0, nullptr, &key.value);
      LocalFree(keyInfo);
      if (!imported) throw std::runtime_error("Unable to import RSA public key");
      DWORD keyBits = 0, copied = 0;
      if (BCryptGetProperty(key.value, BCRYPT_KEY_LENGTH, reinterpret_cast<PUCHAR>(&keyBits), sizeof(keyBits), &copied, 0) < 0 ||
          keyBits < 2048) throw std::runtime_error("RSA public key must be at least 2048 bits");
      auto contentBytes = std::vector<uint8_t>(content.begin(), content.end());
      auto digest = Sha256(contentBytes);
      auto signature = DecodeBase64Url(jwt.substr(second + 1));
      BCRYPT_PKCS1_PADDING_INFO padding{BCRYPT_SHA256_ALGORITHM};
      if (BCryptVerifySignature(key.value, &padding, digest.data(), static_cast<ULONG>(digest.size()), signature.data(),
                                static_cast<ULONG>(signature.size()), BCRYPT_PAD_PKCS1) < 0) throw std::runtime_error("RSA signature verification failed");
      return true;
    } catch (std::exception const &exception) {
      error = exception.what(); return false;
    }
  }
}
