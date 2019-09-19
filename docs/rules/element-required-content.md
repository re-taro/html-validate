@ngdoc rule
@module rules
@name element-required-content
@category content-model
@summary Ensure required elements are present
@description

# Ensure required elements are present (`element-required-content`)

Some elements has requirements where certain child elements has to be present.

The requirements comes from the [element metadata](/usage/elements.html):

```js
{
  "my-element": {
    "requiredContent": ["my-other-element"]
  }
}
```

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect" rules="element-required-content">
    <html>
        <head>
        </head>
    </html>
</validate>

Examples of **correct** code for this rule:

<validate name="correct" rules="element-required-content">
    <html>
        <head>
            <title>foo</title>
        </head>
        <body></body>
    </html>
</validate>