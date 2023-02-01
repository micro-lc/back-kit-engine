# CHANGELOG

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased
## [1.0.4] - 2023-01-31

- `dataschema` `description` field is now of type `LocalizedText`
## [1.0.3] - 2023-01-30

- `http-client` `get` and `post` methods reject the promise on `downloadAsFile` when response is not ok

## [1.0.2] - 2023-01-19

### Added

- `http-client` supports fetching from a proxy window which when not defined defaults to the global window
