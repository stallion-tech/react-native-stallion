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
