#!/usr/bin/env node

/*
 read data
 convert data to array
 convert values
 filter columns
 calulate widths
 pad cells
 create lines
 alternate lines
 create stringrep

 ideas:
  - align . in number column if possible
  - right and center pad option
*/

import { readFileSync } from 'node:fs'
import { prettyjsontable } from './prettyjsontable.js'
import { Command } from 'commander'

const program = new Command()
program
  .option('-b, --boolean <color>', 'highlight booleans', '#2222FF')
  .option('-z, --negative <color>', 'highlight negative numbers', '#FF2222')
  .option('-n, --number <color>', 'highlight numbers', '')
  .option('-u, --unixtime <color>', 'highlight and convert unix timestamps', '#2222FF')
  .option('-v, --msunixtime <color>', 'highlight and convert unix timestamps in milliseconds', '#22FF22')
  .option('-e, --even <color>', 'even line background', '#111111')
  .option('-o, --odd <color>', 'odd line background', '#333333')
  .option('--header <color>', 'header line background', '#AA2222')
  .option('--unixstart <date>', 'convert numbers after <date> to Date', '2013-01-01')
  .option('--unixend <date>', 'convert numbers before <date> to Date', '2030-01-01')
  .option('-c, --columns <number...>', 'display the given columns in the given order (i.e. 3 4 1)')
  .addHelpText('after', `

  Example call:
    $ cat test.json | tj -n 3 2 1 -u "" -n "#AAAA22"
    $ cat test.jsonstream | tj`)

program.parse()

const options = program.opts()

const data = readFileSync('/dev/stdin', 'utf-8')

console.log(prettyjsontable(data, options))
