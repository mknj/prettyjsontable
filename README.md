# TLDR

Read a json array or jsonstream from stdin and print a nice tabular representation.

The package provides the `prettyjsontable` command and a `jt` shortcut.

# features
* configurable colors for different data types
* automatic conversion of unix timestamps
* robust reader supporting json and jsonstream input
* works fine with [jq](https://stedolan.github.io/jq/) pipes
* easy column filter for wide input

# install

npm i -g prettyjsontable

# usage

![demo.gif](https://github.com/mknj/prettyjsontable/raw/main/demo.gif)


# help

```
Usage: jt [options]

Options:
  -b, --boolean <color>      highlight booleans (default: "#2222FF")
  -f, --false <color>        highlight false boolean (default: "#FF3333")
  -z, --negative <color>     highlight negative numbers (default: "#FF2222")
  -n, --number <color>       highlight numbers (default: "")
  -u, --unixtime <color>     highlight and convert unix timestamps (default: "#2222FF")
  -v, --msunixtime <color>   highlight and convert unix timestamps in milliseconds (default: "#22FF22")
  -e, --even <color>         even line background (default: "#111111")
  -o, --odd <color>          odd line background (default: "#222222")
  --header <color>           header line background (default: "#AA2222")
  --unixstart <date>         convert numbers after <date> to Date (default: "2013-01-01")
  --unixend <date>           convert numbers before <date> to Date (default: "2030-01-01")
  -c, --columns <number...>  display the given columns in the given order (i.e. 3 4 1)
  -h, --help                 display help for command


  Example call:
    $ cat test.json | tj -n 3 2 1 -u "" -n "#AAAA22"
    $ cat test.jsonstream | tj

```