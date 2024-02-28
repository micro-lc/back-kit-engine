# CHANGELOG

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

## [1.0.17] - 2024-02-28

- `dataschema`: format `html-editor` is now available

## [1.0.16] - 2024-01-28

- `customLocale` property is available in `bk-base` component

## [1.0.15] - 2024-01-16

- `reroutingRules` property is available in `bk-http-base` component

## [1.0.14] - 2024-01-11

- `columnName` key is available in payload of `export-data/user-config` event

## [1.0.13] - 2023-12-20

- `geopointFormat` option is available inside data-schema `formOptions`
- empty string is supported in i18n label resolution

## [1.0.12] - 2023-12-04

- i18n objects are resolved to strings using english as fallback language

## [1.0.11] - 2023-08-03

- new events `import-data` and `import-data/user-config` are available
- `patchMultipart` implementation for the http client

## [1.0.10] - 2023-06-22

- new events `fetch-files`, `fetched-files` are available

## [1.0.9] - 2023-06-12

- `sort` key is available in payload of `nested-navigation-state/display` event

## [1.0.8] - 2023-05-22

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
