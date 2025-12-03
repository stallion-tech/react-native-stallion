cmake_minimum_required(VERSION 3.10.2)

project(stallion_crash)

add_library(
  stallion-crash
  SHARED
  stallion_signal_handler.cpp
)

# Build bzip2 as a static library
# Using the same bzip2 that works in iOS and CLI
add_library(
  bzip2_static
  STATIC
  bzip2/blocksort.c
  bzip2/huffman.c
  bzip2/crctable.c
  bzip2/randtable.c
  bzip2/compress.c
  bzip2/decompress.c
  bzip2/bzlib.c
)

# Include bzip2 headers
target_include_directories(
  bzip2_static
  PUBLIC
  ${CMAKE_CURRENT_SOURCE_DIR}/bzip2
)

add_library(
  stallion-bspatch
  SHARED
  bspatch_bridge.c
  stallion_bspatch_jni.cpp
)

find_library(
  log-lib
  log
)

target_link_libraries(
  stallion-crash
  ${log-lib}
)

target_link_libraries(
  stallion-bspatch
  ${log-lib}
  bzip2_static
)

# Include bzip2 headers for bspatch
target_include_directories(
  stallion-bspatch
  PRIVATE
  ${CMAKE_CURRENT_SOURCE_DIR}/bzip2
)
