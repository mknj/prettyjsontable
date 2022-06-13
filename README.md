# TLDR

Read a json array or jsonstream from stdin and print as table.

The package provides the `prettyjsontable` command and a `jt` shortcut.

# features
* configurable colors for different data types and cases
* automatic conversion of unix timestamps
* robust reader supporting json and jsonstream input
* easy column filter for wide input
* align numbers
* changeable defaults via environment variables
* works fine with [jq](https://stedolan.github.io/jq/) pipes
* draw simple graphs for numbers

# install

npm i -g prettyjsontable

# usage

![demo.gif](https://github.com/mknj/prettyjsontable/raw/main/demo.gif)


# help

```
Usage: prettyjsontable [options]

CLI to format json arrays and jsonstreams as table

Options:
  -b, --boolean <color>      highlight booleans
  -f, --false <color>        highlight false boolean
  -z, --negative <color>     highlight negative numbers
  -n, --number <color>       highlight numbers
  -e, --even <color>         even line background
  -o, --odd <color>          odd line background
  --header <color>           header line background
  -u, --unixtime <color>     highlight and convert unix timestamps
  -v, --msunixtime <color>   highlight and convert unix timestamps in ms
  --unixstart <date>         convert numbers after <date> to Date
  --unixend <date>           convert numbers before <date> to Date
  -c, --columns <number...>  display columns in the given order (i.e. 3 4 1)
  -g, --graph                plot graph for numeric values
  -h, --help                 display help for command


  ENVIRONMENT:
    You can also set an option via the variable PRETTYJSONTABLE_optionname.
    i.e. PRETTYJSONTABLE_EVEN for the even option.
  
  Disable single color:
    Set option to "".
    To disable number to date conversion set -u and -v to "".

  Example calls:
    $ cat test.json | prettyjsontable -n 3 2 1 -u "" -n "#AAAA22"
    $ cat test.json | jq .[] | jt
```
