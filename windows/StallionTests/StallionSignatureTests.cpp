#include <windows.h>
#include <filesystem>
#include <fstream>
#include <stdexcept>
#include <string>

#include "StallionSignature.h"

namespace fs = std::filesystem;
using ReactNativeStallionWindows::StallionSignature;

char const *SignatureFixtureJwt();
char const *SignatureFixturePublicKey();

namespace
{
  struct TempRoot
  {
    fs::path path;

    TempRoot()
    {
      GUID id{};
      CoCreateGuid(&id);
      wchar_t text[40]{};
      StringFromGUID2(id, text, 40);
      path = fs::temp_directory_path() / (L"stallion-signature-tests-" + std::wstring(text));
      fs::create_directories(path);
    }

    ~TempRoot()
    {
      std::error_code ignored;
      fs::remove_all(path, ignored);
    }
  };

  void Write(fs::path const &path, std::string const &value)
  {
    fs::create_directories(path.parent_path());
    std::ofstream(path, std::ios::binary) << value;
  }

  void Require(bool condition, char const *message)
  {
    if (!condition) throw std::runtime_error(message);
  }
}

void Signature_CoverageEntryPoints()
{
  TempRoot temp;
  auto first = temp.path / L"first";
  auto second = temp.path / L"second";
  Write(first / L"index.windows.bundle", "bundle");
  Write(first / L"assets" / L"asset.txt", "asset");
  Write(first / L".DS_Store", "ignored");
  Write(first / L".stallionsigned", "ignored");
  Write(first / L"__MACOSX" / L"metadata", "ignored");
  Write(second / L"assets" / L"asset.txt", "asset");
  Write(second / L"index.windows.bundle", "bundle");

  Require(StallionSignature::ComputeFolderHash(first) == StallionSignature::ComputeFolderHash(second),
          "signature hash included ignored metadata or depended on file creation order");
  Write(second / L"assets" / L"asset.txt", "changed");
  Require(StallionSignature::ComputeFolderHash(first) != StallionSignature::ComputeFolderHash(second),
          "signature hash ignored package content changes");

  Write(first / L".stallionsigned", "not-a-jws");
  std::string error;
  Require(!StallionSignature::Verify(first, "unused", error), "malformed signature was accepted");
  Require(error == "Invalid Stallion signature file", "malformed signature error mismatch");

  Write(first / L"index.windows.bundle", "B");
  fs::remove(first / L"assets" / L"asset.txt");
  fs::remove(first / L".DS_Store");
  fs::remove_all(first / L"__MACOSX");
  auto signature = std::string(SignatureFixtureJwt());
  auto publicKey = std::string(SignatureFixturePublicKey());
  Write(first / L".stallionsigned", signature);
  Require(StallionSignature::Verify(first, publicKey, error), error.c_str());

  Write(first / L"index.windows.bundle", "tampered");
  Require(!StallionSignature::Verify(first, publicKey, error), "tampered package was accepted");
  Require(error == "Signed package hash does not match release contents", "tampered package error mismatch");
  Write(first / L"index.windows.bundle", "B");

  Write(first / L".stallionsigned", "eyJhbGciOiJIUzI1NiJ9.e30.AA");
  Require(!StallionSignature::Verify(first, publicKey, error), "wrong signature algorithm was accepted");
  Require(error == "Signature algorithm must be RS256", "signature algorithm error mismatch");

  Write(first / L".stallionsigned", signature);
  Require(!StallionSignature::Verify(first, "AA==", error), "invalid public key was accepted");
  Require(error == "Invalid RSA public key", "invalid public key error mismatch");

  auto signatureStart = signature.rfind('.') + 1;
  signature[signatureStart] = signature[signatureStart] == 'A' ? 'B' : 'A';
  Write(first / L".stallionsigned", signature);
  Require(!StallionSignature::Verify(first, publicKey, error), "invalid RSA signature was accepted");
  Require(error == "RSA signature verification failed", "invalid RSA signature error mismatch");
}
