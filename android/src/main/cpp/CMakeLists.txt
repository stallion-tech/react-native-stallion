cmake_minimum_required(VERSION 3.10.2)

project(stallion_crash)

add_library(
  stallion-crash
  SHARED
  stallion_signal_handler.cpp
)

find_library(
  log-lib
  log
)

target_link_libraries(
  stallion-crash
  ${log-lib}
)

# Fix for 16KB page size compatibility (required for Android 15+)
# This ensures LOAD segments are aligned at 16KB boundaries
set_target_properties(stallion-crash PROPERTIES
  LINK_FLAGS "-Wl,-z,max-page-size=16384"
)
