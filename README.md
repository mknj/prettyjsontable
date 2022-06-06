# TLDR

Read a json array or jsonstream from stdin and print a nice tabular representation.

The package provides the `prettyjsontable` command and a `jt` shortcut.

# features
* configurable colors for different data types and cases
* automatic conversion of unix timestamps
* robust reader supporting json and jsonstream input
* easy column filter for wide input
* align numbers
* changeable defaults via environment variables
* works fine with [jq](https://stedolan.github.io/jq/) pipes

# install

npm i -g prettyjsontable

# usage

![demo.gif](https://github.com/mknj/prettyjsontable/raw/main/demo.gif)


# help

```
Usage: prettyjsontable [options]

CLI to format json arrays and jsonstreams as table

Options:
  -b, --boolean <color>      highlight booleans                                            (default: "#2222FF", env: PRETTYJSONTABLE_BOOLEAN)
  -f, --false <color>        highlight false boolean                                         (default: "#FF3333", env: PRETTYJSONTABLE_FALSE)
  -z, --negative <color>     highlight negative numbers                                   (default: "#FF2222", env: PRETTYJSONTABLE_NEGATIVE)
  -n, --number <color>       highlight numbers                                              (default: "", env: PRETTYJSONTABLE_NUMBER)
  -e, --even <color>         even line background                                             (default: "#111111", env: PRETTYJSONTABLE_EVEN)
  -o, --odd <color>          odd line background                                               (default: "#222222", env: PRETTYJSONTABLE_ODD)
  --header <color>           header line background                                             (default: "#AA2222", env: PRETTYJSONTABLE_HEADER)
  -u, --unixtime <color>     highlight and convert unix timestamps                        (default: "#2222FF", env: PRETTYJSONTABLE_UNIXTIME)
  -v, --msunixtime <color>   highlight and convert unix timestamps in milliseconds      (default: "#22FF22", env: PRETTYJSONTABLE_MSUNIXTIME)
  --unixstart <date>         convert numbers after <date> to Date                             (default: "2013-01-01", env: PRETTYJSONTABLE_UNIXSTART)
  --unixend <date>           convert numbers before <date> to Date                              (default: "2030-01-01", env: PRETTYJSONTABLE_UNIXEND)
  -c, --columns <number...>  display the given columns in the given order (i.e. 3 4 1)
  -h, --help                 display help for command


  Example calls:
    $ cat test.json | prettyjsontable -n 3 2 1 -u "" -n "#AAAA22"
    $ cat test.json | jq .[] | jt
```
