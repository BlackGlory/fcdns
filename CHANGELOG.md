# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.5.7](https://github.com/BlackGlory/fcdns/compare/v0.5.6...v0.5.7) (2022-08-11)

### [0.5.6](https://github.com/BlackGlory/fcdns/compare/v0.5.5...v0.5.6) (2022-08-11)

### [0.5.5](https://github.com/BlackGlory/fcdns/compare/v0.5.4...v0.5.5) (2022-08-06)

### [0.5.4](https://github.com/BlackGlory/fcdns/compare/v0.5.3...v0.5.4) (2022-08-05)

### [0.5.3](https://github.com/BlackGlory/fcdns/compare/v0.5.2...v0.5.3) (2022-08-05)


### Bug Fixes

* bundle ([486968d](https://github.com/BlackGlory/fcdns/commit/486968d33297433fa5edc11d282d6a2a69e6f804))

### [0.5.2](https://github.com/BlackGlory/fcdns/compare/v0.5.1...v0.5.2) (2022-08-05)


### Bug Fixes

* bundle ([210ba5b](https://github.com/BlackGlory/fcdns/commit/210ba5b3355fbdc0930d0b60cd242a4d562f2e95))

### [0.5.1](https://github.com/BlackGlory/fcdns/compare/v0.5.0...v0.5.1) (2022-08-05)


### Bug Fixes

* bundle ([f80e617](https://github.com/BlackGlory/fcdns/commit/f80e6170e3cd50488992a47615b8c8e150c0609c))

## [0.5.0](https://github.com/BlackGlory/fcdns/compare/v0.4.5...v0.5.0) (2022-08-05)


### ⚠ BREAKING CHANGES

* Old route cache and test cache are discarded.

### Features

* **scripts:** add scripts ([2caea3b](https://github.com/BlackGlory/fcdns/commit/2caea3b4e3c945cc450371b378bc630f9f8185a1))
* set process.title ([ea17e1b](https://github.com/BlackGlory/fcdns/commit/ea17e1bae4d70f85a0e7337fed577f34ae8298fe))


### Bug Fixes

* scripts ([b664c6b](https://github.com/BlackGlory/fcdns/commit/b664c6b0bd2dc2e66e694b7d07bc1f56a961f18d))
* the syntax of option ([208c2c8](https://github.com/BlackGlory/fcdns/commit/208c2c8133859a2f2c18c74277a4de9e6e314a50))


* replace NDJSON with extra-disk-cache ([01c33ac](https://github.com/BlackGlory/fcdns/commit/01c33accaec74851ad68431adf524137d7dac7ab))

### [0.4.5](https://github.com/BlackGlory/fcdns/compare/v0.4.4...v0.4.5) (2022-07-30)


### Bug Fixes

* cli ([abaa8c5](https://github.com/BlackGlory/fcdns/commit/abaa8c5344527605ffe4f2cb702f410f51b04bb7))

### [0.4.4](https://github.com/BlackGlory/fcdns/compare/v0.4.3...v0.4.4) (2022-07-30)

### [0.4.3](https://github.com/BlackGlory/fcdns/compare/v0.4.2...v0.4.3) (2022-07-30)

### [0.4.2](https://github.com/BlackGlory/fcdns/compare/v0.4.1...v0.4.2) (2022-07-26)


### Features

* add timeout option ([42e044b](https://github.com/BlackGlory/fcdns/commit/42e044b972e6a99739d078fb085814fb5ff67929))

### [0.4.1](https://github.com/BlackGlory/fcdns/compare/v0.4.0...v0.4.1) (2022-07-25)


### Bug Fixes

* cli options ([0b4fa30](https://github.com/BlackGlory/fcdns/commit/0b4fa30ea4b41248a2593c5719030bcb2b55c5ea))

## [0.4.0](https://github.com/BlackGlory/fcdns/compare/v0.3.16...v0.4.0) (2022-07-25)


### ⚠ BREAKING CHANGES

* - Remove loose mode, because it doesn't work very well
- Remove microcaching, as caching is best implemented as a relay server

### Features

* remove loose mode and microcaching ([986e58f](https://github.com/BlackGlory/fcdns/commit/986e58f4cc88ab3c77f3149e7a5dc644ee370d79))

### [0.3.16](https://github.com/BlackGlory/fcdns/compare/v0.3.15...v0.3.16) (2022-07-25)

### [0.3.15](https://github.com/BlackGlory/fcdns/compare/v0.3.14...v0.3.15) (2022-04-16)


### Bug Fixes

* hostname blacklist ([0e21a21](https://github.com/BlackGlory/fcdns/commit/0e21a214c13633ee4a3b2fe6353ae97d72f3fa65))

### [0.3.14](https://github.com/BlackGlory/fcdns/compare/v0.3.13...v0.3.14) (2022-04-16)


### Features

* add hostname blacklist ([f196de1](https://github.com/BlackGlory/fcdns/commit/f196de13e742935ccdf4f67e1b54f73b057e15e8))


### Bug Fixes

* make hostname list files optional ([ab2352f](https://github.com/BlackGlory/fcdns/commit/ab2352ff55dd05f947fa8eedd9dc6706e36c67ad))

### [0.3.13](https://github.com/BlackGlory/fcdns/compare/v0.3.12...v0.3.13) (2022-04-01)

### [0.3.12](https://github.com/BlackGlory/fcdns/compare/v0.3.11...v0.3.12) (2022-03-26)


### Bug Fixes

* try fix the out of range problem about SOA serial ([ebc5275](https://github.com/BlackGlory/fcdns/commit/ebc5275cd7ec3074e07558b52ca93d492919f07c))

### [0.3.11](https://github.com/BlackGlory/fcdns/compare/v0.3.10...v0.3.11) (2022-03-26)


### Bug Fixes

* make sure to throw errors ([85ee589](https://github.com/BlackGlory/fcdns/commit/85ee58964c0b20df765c1d61dc4e3fb5e2c95dfd))

### [0.3.10](https://github.com/BlackGlory/fcdns/compare/v0.3.9...v0.3.10) (2022-03-23)


### Bug Fixes

* edge case ([9162617](https://github.com/BlackGlory/fcdns/commit/9162617e2ace75b22e418674320f79858bbdc959))

### [0.3.9](https://github.com/BlackGlory/fcdns/compare/v0.3.8...v0.3.9) (2022-03-20)


### Bug Fixes

* logging ([4902a1f](https://github.com/BlackGlory/fcdns/commit/4902a1f1390a83d02dbbf48395c74d791f5f27da))

### [0.3.8](https://github.com/BlackGlory/fcdns/compare/v0.3.7...v0.3.8) (2022-03-20)


### Bug Fixes

* logging ([21a71d5](https://github.com/BlackGlory/fcdns/commit/21a71d5988da3b32564b058be51fe98366bb3ccf))

### [0.3.7](https://github.com/BlackGlory/fcdns/compare/v0.3.6...v0.3.7) (2022-03-20)


### Bug Fixes

* forward entire response instead of answers ([326fbaf](https://github.com/BlackGlory/fcdns/commit/326fbaf40bc028bdd8c1d3b7c5c540430aa0e7dd))

### [0.3.6](https://github.com/BlackGlory/fcdns/compare/v0.3.5...v0.3.6) (2022-03-03)

### [0.3.5](https://github.com/BlackGlory/fcdns/compare/v0.3.4...v0.3.5) (2022-02-28)

### [0.3.4](https://github.com/BlackGlory/fcdns/compare/v0.3.3...v0.3.4) (2022-02-28)

### [0.3.3](https://github.com/BlackGlory/fcdns/compare/v0.3.2...v0.3.3) (2022-01-02)

### [0.3.2](https://github.com/BlackGlory/fcdns/compare/v0.3.1...v0.3.2) (2021-12-21)

### [0.3.1](https://github.com/BlackGlory/fcdns/compare/v0.3.0...v0.3.1) (2021-12-17)

## [0.3.0](https://github.com/BlackGlory/fcdns/compare/v0.2.7...v0.3.0) (2021-12-17)


### ⚠ BREAKING CHANGES

* - The minimum version is Node.js v16

* upgrade dependencies ([c9072dc](https://github.com/BlackGlory/fcdns/commit/c9072dc80e8f6867aca7f0a9d05abec154195f21))

### [0.2.7](https://github.com/BlackGlory/fcdns/compare/v0.2.6...v0.2.7) (2021-12-12)

### [0.2.6](https://github.com/BlackGlory/fcdns/compare/v0.2.5...v0.2.6) (2021-10-17)

### [0.2.5](https://github.com/BlackGlory/fcdns/compare/v0.2.4...v0.2.5) (2021-10-14)

### [0.2.4](https://github.com/BlackGlory/fcdns/compare/v0.2.3...v0.2.4) (2021-10-06)


### Features

* add loose mode ([561f7f9](https://github.com/BlackGlory/fcdns/commit/561f7f9181a5bd76e5093ed5e7fc65daadd4702d))

### [0.2.3](https://github.com/BlackGlory/fcdns/compare/v0.2.2...v0.2.3) (2021-09-18)

### [0.2.2](https://github.com/BlackGlory/fcdns/compare/v0.2.1...v0.2.2) (2021-07-12)


### Bug Fixes

* isHostnamePattern ([eee8e03](https://github.com/BlackGlory/fcdns/commit/eee8e03703e4cac962db6b2d05965f877051c30b))

### [0.2.1](https://github.com/BlackGlory/fcdns/compare/v0.2.0...v0.2.1) (2021-07-09)


### Features

* improve hostname pattern ([f86b9a6](https://github.com/BlackGlory/fcdns/commit/f86b9a64c92160dc5995fa1dc77e0a1f2c1daa3d))

## [0.2.0](https://github.com/BlackGlory/fcdns/compare/v0.1.6...v0.2.0) (2021-07-09)


### ⚠ BREAKING CHANGES

* rename whitelist.txt to ip-whitelist.txt

### Features

* add hostname whitelist ([f96d2f3](https://github.com/BlackGlory/fcdns/commit/f96d2f38daf1506e168d7e380b09edad87165d06))
* support to parse ip addresses in whitelist ([10024db](https://github.com/BlackGlory/fcdns/commit/10024db45acb5201f67ecc64a7e2cf54ade396b4))

### [0.1.6](https://github.com/BlackGlory/fcdns/compare/v0.1.5...v0.1.6) (2021-05-17)

### [0.1.5](https://github.com/BlackGlory/fcdns/compare/v0.1.4...v0.1.5) (2021-05-14)

### [0.1.4](https://github.com/BlackGlory/fcdns/compare/v0.1.3...v0.1.4) (2021-05-08)

### [0.1.3](https://github.com/BlackGlory/fcdns/compare/v0.1.2...v0.1.3) (2021-05-08)

### [0.1.2](https://github.com/BlackGlory/fcdns/compare/v0.1.1...v0.1.2) (2021-04-22)


### Bug Fixes

* handle uncaught errors ([a324ed8](https://github.com/BlackGlory/fcdns/commit/a324ed8241feb1aab029b5bd23d3f792bce42c58))

### [0.1.1](https://github.com/BlackGlory/fcdns/compare/v0.1.0...v0.1.1) (2021-04-14)

## 0.1.0 (2021-04-12)


### Features

* init ([5185bb9](https://github.com/BlackGlory/fcdns/commit/5185bb9103536124b15192b340bd0a91d1eb49af))
