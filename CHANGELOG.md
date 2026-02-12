# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Updated
- Release to npmjs using updated CI workflow and trusted publishing

## [1.6.4] - 2025-02-17
### Added
- Release to npmjs using CI workflow

## [1.6.3] - 2022-11-06
### Fixed
- Use globalThis instead of window
- Clarify compatibility

## [1.6.2] - 2022-10-28
### Fixed
- Added missing constants OPEN, CONNECTING, CLOSED to ReconnectingEventSource class.

## [1.6.1] - 2022-10-28
### Fixed
- Added missing file in package

## [1.6.0] - 2022-10-28
### Fixed
- Loading this package as an ESM module

## [1.5.2] - 2022-08-13
### Fixed
- Event names can be any freely chosen name

## [1.5.1] - 2022-08-02
### Fixed
- Corrected unintentional double-registration of message handler (#65)

## [1.5.0] - 2022-07-06
### Changed
- Reformatted in TypeScript for better type checking
- Improved build process using just TypeScript, rather than using webpack/babel 

[Unreleased]: https://github.com/fanout/reconnecting-eventsource/compare/v1.6.4...HEAD
[1.6.4]: https://github.com/fanout/reconnecting-eventsource/compare/v1.6.3...v1.6.4
[1.6.3]: https://github.com/fanout/reconnecting-eventsource/compare/v1.6.2...v1.6.3
[1.6.2]: https://github.com/fanout/reconnecting-eventsource/compare/v1.6.1...v1.6.2
[1.6.1]: https://github.com/fanout/reconnecting-eventsource/compare/v1.6.0...v1.6.1
[1.6.0]: https://github.com/fanout/reconnecting-eventsource/compare/v1.5.2...v1.6.0
[1.5.2]: https://github.com/fanout/reconnecting-eventsource/compare/v1.5.1...v1.5.2
[1.5.1]: https://github.com/fanout/reconnecting-eventsource/compare/v1.5.0...v1.5.1
[1.5.0]: https://github.com/fanout/reconnecting-eventsource/releases/tag/v1.5.0
