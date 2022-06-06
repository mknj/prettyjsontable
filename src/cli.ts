#!/usr/bin/env node

import { readFileSync } from 'node:fs'
import { prettyjsontable } from './prettyjsontable.js'
import { Command, Option } from 'commander'

const program = new Command()
program
  .name('prettyjsontable')
  .description('CLI to format json arrays and jsonstreams as table')
  .addOption(new Option('-b, --boolean <color>', 'highlight booleans                                           ').default('#2222FF').env('PRETTYJSONTABLE_BOOLEAN'))
  .addOption(new Option('-f, --false <color>', 'highlight false boolean                                        ').default('#FF3333').env('PRETTYJSONTABLE_FALSE'))
  .addOption(new Option('-z, --negative <color>', 'highlight negative numbers                                  ').default('#FF2222').env('PRETTYJSONTABLE_NEGATIVE'))
  .addOption(new Option('-n, --number <color>', 'highlight numbers                                             ').default('').env('PRETTYJSONTABLE_NUMBER'))
  .addOption(new Option('-e, --even <color>', 'even line background                                            ').default('#111111').env('PRETTYJSONTABLE_EVEN'))
  .addOption(new Option('-o, --odd <color>', 'odd line background                                              ').default('#222222').env('PRETTYJSONTABLE_ODD'))
  .addOption(new Option('--header <color>', 'header line background                                            ').default('#AA2222').env('PRETTYJSONTABLE_HEADER'))
  .addOption(new Option('-u, --unixtime <color>', 'highlight and convert unix timestamps                       ').default('#2222FF').env('PRETTYJSONTABLE_UNIXTIME'))
  .addOption(new Option('-v, --msunixtime <color>', 'highlight and convert unix timestamps in milliseconds     ').default('#22FF22').env('PRETTYJSONTABLE_MSUNIXTIME'))
  .addOption(new Option('--unixstart <date>', 'convert numbers after <date> to Date                            ').default('2013-01-01').env('PRETTYJSONTABLE_UNIXSTART'))
  .addOption(new Option('--unixend <date>', 'convert numbers before <date> to Date                             ').default('2030-01-01').env('PRETTYJSONTABLE_UNIXEND'))
  .addOption(new Option('-c, --columns <number...>', 'display the given columns in the given order (i.e. 3 4 1)'))
  .addHelpText('after', `

  Example calls:
    $ cat test.json | prettyjsontable -n 3 2 1 -u "" -n "#AAAA22"
    $ cat test.json | jq .[] | jt`)

program.parse()

const options = program.opts()

const data = readFileSync('/dev/stdin', 'utf-8')

console.log(prettyjsontable(data, options))
