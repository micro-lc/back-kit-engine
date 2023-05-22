# CHANGELOG

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

- new event `http-delete` is available

## [1.0.7] - 2023-03-23

- `bk-http-base` has `credentials` property controlling homonymous fetch configuration

## [1.0.6] - 2023-03-14

- quotation marks are removed filename in `Content-disposition` header when `downloadAsFile` is true to download file

## [1.0.5] - 2023-03-02

- `http-client` supports `patch` method

## [1.0.4] - 2023-01-31

- `dataschema` `description` field is now of type `LocalizedText`
## [1.0.3] - 2023-01-30

- `http-client` `get` and `post` methods reject the promise on `downloadAsFile` when response is not ok

## [1.0.2] - 2023-01-19

### Added

- `http-client` supports fetching from a proxy window which when not defined defaults to the global window
