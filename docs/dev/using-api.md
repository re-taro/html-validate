---
docType: content
title: Using API
---

# Using API

## Bundles

The `html-validate` package contains four bundles:

- CommonJS full (`dist/cjs/main.js`)
- CommonJS browser (`dist/cjs/browser.js`)
- ESM full (`dist/es/main.js`)
- ESM browser (`dist/es/browser.js`)

The default full bundle includes everything (`CLI` classes etc) while the browser bundles are a bit more stripped and includes only code that runs in a browser<sup>1</sup>.

1. Running in a browser is not fully supported yet as there are still calls to NodeJS `fs` and dynamic `require`'s inside the library, see {@link dev/running-in-browser running in a browser} for details.

## Validating files

```typescript
import { HtmlValidate } from "html-validate";

const htmlvalidate = new HtmlValidate();
const report = htmlvalidate.validateFile("myfile.html");

console.log("valid", report.valid);
if (!report.valid) {
  console.log(report.results);
}
```

`validateFile` is a high-level API which automatically locates configuration
files, load plugins, runs any transformations etc and is very similar to using
the CLI tool (in fact, the CLI tool uses this very API).

A configuration object may optionally be passed to the `HtmlValidate` constructor:

```diff
-const htmlvalidate = new HtmlValidate();
+const htmlvalidate = new HtmlValidate({
+  extends: ["html-validate:recommended"],
+});
```

If set, it will be used as configuration unless a configuration could be read from `.htmlvalidate.json` files.
Set `root: true` to prevent configuration files to be searched.

It is also possible to pass a [configuration loader](#configuration-loaders) to fully customize how the configuration loading is handled:

```diff
-import { HtmlValidate } from "html-validate";
+import { StaticConfigLoader, HtmlValidate } from "html-validate";

-const htmlvalidate = new HtmlValidate();
+const loader = new StaticConfigLoader();
+const htmlvalidate = new HtmlValidate(loader);
```

### `validateFile(filename: string)`

Reads a file and transforms the file according to the configured transformers.

## Validating strings and other sources

In addition to `validateFile` there is also `validateString` and
`validateSource`. Unlike `validateFile` no configuration files will be searched
from the filesystem and the full configuration must be passed to the
`HtmlValidate` constructor.

```typescript
const report = htmlvalidate.validateString("<div>lorem ipsum</span>");
console.log(report.results);
```

```typescript
const report = htmlvalidate.validateSource({
  /* markup to validate */
  data: "<div>lorem ipsum</span>",

  /* filename to put in report, content is not read */
  filename: "myfile.txt",

  /* original source location, i.e. at what position was markup extracted from
   * in original file. */
  line: 12,
  column: 8,
});
console.log(report.results);
```

### `validateString(markup: string, [filename: string], [config: ConfigData], [hooks: SourceHooks])`

Validates the given markup.

- `filename` - If a filename is passed it is used to load configuration and is used as the `filePath` property when generating the report.
- `config` - If configuration is passed it is merged with global config and config loaded from the filename.
- `hooks` - Normally reserved for transforms hooks can be used to alter DOM tree during parsing.

### `validateSource(source: Source, [config: ConfigData])`

Validates the given markup (passed in the `Source` object).

- `config` - If configuration is passed it is merged with global config and config loaded from the filename.

## Handling multiple files

To validate multiple files you need to call `validateFile` for each one,
obtaining a report for each one. The reports can then be merged together,
forming a new `Report` object.

```typescript
const report1 = htmlvalidate.validateFile("myfile.html");
const report2 = htmlvalidate.validateFile("anotherfile.html");

/* merge reports together to a single report */
const merged = Reporter.merge([report1, report2]);

/* valid is true only if all reports are valid */
console.log("valid", merged.valid);

/* results holds all files */
if (!merged.valid) {
  console.log(merged.results);
}
```

## Formatting reports

HTML-validate comes with a number of builtin formatters:

- `checkstyle`
- `codeframe`
- `json`
- `stylish`
- `text`

Formatters work on the `results` property in a report and all returns a formatted string:

```typescript
import { HtmlValidate, formatterFactory } from "html-validate";

const htmlvalidate = new HtmlValidate();
const report = htmlvalidate.validateFile("myfile.html");
const text = formatterFactory("text");

console.log(text(report.results));
```

Using the CLI API there is a factory function to retrieve formatters (see `html-validate --help` for details about the format):

```typescript
import { formatterFactory } from "html-validate";

const stylish = formatterFactory("stylish");
console.log(stylish(report));
```

In addition, any ESLint compatible reporter will work:

```typescript
const stylish = require("eslint/lib/formatters/stylish");
console.log(stylish(report.results));
```

## Configuration loaders

Since v6 the `HtmlValidate` API uses `StaticConfigLoader` by default which only loads static configuration (configuration passed to constructor or calls to validation functions).
The CLI tool uses `FileSystemConfigLoader` instead which traversess the file system looking for configuration files such as `.htmlvalidate.json`.

To specify a loader pass it as the first argument to constructor:

```ts
import { FileSystemConfigLoader, HtmlValidate } from "html-validate";

const loader = new FileSystemConfigLoader();
const htmlvalidate = new HtmlValidate(loader);
```

A fully custom loader can be impemented by inheriting from `ConfigLoader`:

```ts
class MyCustomLoader extends ConfigLoader {
  public override getConfigFor(handle: string, configOverride?: ConfigData): Config {
    /* return config for given handle (e.g. filename passed to validateFile) */
    const override = this.loadFromObject(configOverride || {});
    const merged = this.globalConfig.merge(override);
    merged.init();
    return merged;
  }

  public override flushCache(handle?: string): void {
    /* do nothing for this example */
  }

  protected defaultConfig(): Config {
    /* return default configuration, used when no config is passed to constructor */
    return this.loadFromObject({
      extends: ["html-validate:recommended"],
      elements: ["html5"],
    });
  }
}
```

The custom loader is used the same as builtin loaders:

```diff
-const loader = new FileSystemConfigLoader();
+const loader = new MyCustomLoader();
 const htmlvalidate = new HtmlValidate(loader);
```

When markup is validated the library will call the loader to fetch configuration, e.g:

```ts
htmlvalidate.validateFile("foo.html");
htmlvalidate.validateString("..", "my-fancy-handle");
```

This will generate calls to `getConfigFor("foo.html")` and `getConfigFor("my-fancy-handle")` respectively.
While `validateFile` requires the file to be readable, the second argument to `validateString` can be any handle the API user wants as long as the loader can understand it.

### `FileSystemConfigLoader([config: ConfigData])`

Loader which traverses filesystem looking for `.htmlvalidate.json` configuration files, starting at the directory of the target filename.

The result from the configuration files are merged both with a global configuration and optionally explicit overrides from the calls to `validateFile`, `validateString` and `validateSource`.

### `StaticConfigLoader([config: ConfigData])` (default)

Default loader which loads configuration only from the configuration passed to the constructor or explicit overrides to `validateString(..)`.

```ts
const loader = StaticConfigLoader({
  /* global configuration */
});
```

The global configuration is used by default when using `validateFile`, `validateString` and `validateSource` without any arguments:

```ts
htmlvalidate.validateFile("myfile.html");
htmlvalidate.validateString("..");
htmlvalidate.validateSource({
  data: "..",
});
```

Each call may also pass a configuration override (merged with global):

```ts
htmlvalidate.validateString("..", {
  /* config override */
});
```

## Configuration cache

`HtmlValidate` is mostly stateless, it only acts on the input source and its
configuration.

However, for performance configuration is cached (per instance) and must be
flushed if configuration is changed. Normally this wont matter but when writing
integrations with tools it might be desirable to keep a single instance of
`HtmlValidate` around and in that case the cache needs to be flushed if
configuration changes are detected.

```typescript
/* flush everything */
htmlvalidate.flushConfigCache();

/* flush configuration for a single file */
htmlvalidate.flushConfigCache("myfile.html");
```

## Unit testing

If using jest to write tests there is a couple of helpers to assist writing
tests:

```typescript
import { HtmlValidate } from "html-validate";
import "html-validate/jest";

const config = {
  rules: {
    "my-rule": "error",
  },
};

test("should frobnicate a tux", () => {
  const htmlvalidate = new HtmlValidate(config);
  const report = htmlvalidate.validateString("...");
  expect(report).toBeValid();
});

test("should not frobnicate a flux", () => {
  const htmlvalidate = new HtmlValidate(config);
  const report = htmlvalidate.validateString("...");
  expect(report).toBeInvalid();
  expect(report).toHaveError("my-rule", "the tux should not be frobnicated by a flux");
});
```

## CLI tools

The CLI interface can be wrapped using the `CLI` class.

```js
const cli = new CLI({
  configFile: argv.configFile,
  rules: argv.rules,
});
const htmlvalidate = cli.getValidator();
const formatter = cli.getFormatter(argv.formatter);
const files = cli.expandFiles("**/*.html");
const report = htmlvalidate.validateMultipleFiles(files);
```
