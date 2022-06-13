import chalk from 'chalk'
import { OptionValues } from 'commander'
import stringWidth from 'string-width'
import { Matrix } from './matrix.js'
type Data = Array<Record<string, unknown>>

// this function returns an array of parsed JSON objects, the function does not care about formating. i.e. `[1,2\n][3,4]\n { "a"\r\n:2}\r\r` is valid input
// if you have a well formated line based JSONStream, you could use data.split("\n") instead, as that would be roughly 2x faster
function JSONStreamToArray (data: string): Data {
  const atPositionRE = /Unexpected token . in JSON at position (\d*)/
  const out = []
  let pos = data.length
  while (data.length > 0) {
    try {
      out.push(JSON.parse(data.slice(0, pos)))
      data = data.slice(pos)
      pos = data.length
    } catch (e: unknown) {
      if (e instanceof Error) {
        const atPositionError = atPositionRE.exec(e.message)
        if (atPositionError != null) {
          pos = +atPositionError[1]
        } else {
          throw e
        }
      } else {
        throw e
      }
    }
  }
  return out
}

// this function handles the edge case where the input already is an array of objects
export function dataToTable (data: string): Data {
  const tmp = JSONStreamToArray(data)
  // if we have only one element and this element is an array of objects, then we return it directly
  if (tmp.length === 1 && Array.isArray(tmp[0]) && typeof tmp[0][0] === 'object') {
    return tmp[0]
  }
  return tmp
}

/* 12.345 -> 3 */
const afterdotRE = /\.(\d*)$/
function getDecimalPlaces (v: number): number {
  const afterDot = afterdotRE.exec(v.toString())
  if (afterDot != null) {
    return afterDot[1].length
  }
  return 0
}

function transpose (m: unknown[][]): unknown[][] {
  return m[0].map((x: unknown, i: number) => m.map((x: unknown[]) => x[i]))
}
export function prettyjsongraph (data: Data | string, options: OptionValues): string {
  const columns: Map<string, string> = new Map()

  // if the input is a string, convert it to data
  if (typeof (data) === 'string') {
    data = dataToTable(data)
  }

  // extract column names (aka table header) and decimal places
  data.forEach(d => Object.keys(d).forEach(column => { columns.set(column, column) }))

  // add table header
  data.unshift(Object.fromEntries(columns))

  // convert array of objects to array of array (like excel ;)
  let table = data.map((e) => Array.from(columns.values()).map(column => e[column]))

  // filter and rearrange columns (if options.columns is set)
  if (Array.isArray(options.columns)) {
    table = table.map((row) => options.columns.map((i: unknown) => row[+(i as string) - 1]))
  }
  const header = table.shift() as string[]
  table = transpose(table) as number[][]
  return Matrix.drawGraph(table as number[][], header)
//  return [asciichart.plot(table as number[][], { height: 20, colors }), header.map((v, i) => asciichart.colored(v, colors[i])).join('  ')].join('\n')
}

export function prettyjsontable (data: Data| string, options: OptionValues): string {
  const columns: Map<string, string> = new Map()
  const firstJSONDate = new Date(options.unixstart).valueOf()
  const lastJSONDate = new Date(options.unixend).valueOf()

  // if the input is a string, convert it to data
  if (typeof (data) === 'string') {
    data = dataToTable(data)
  }

  // extract column names (aka table header) and decimal places
  data.forEach(d => Object.keys(d).forEach(column => { columns.set(column, column) }))

  // calculate column widths
  const decimalPlaces = reduceObjects(mapObjects(data, (column, value) => typeof (value) === 'number' ? getDecimalPlaces(value) : NaN), max)

  // add table header
  data.unshift(Object.fromEntries(columns))

  // fill dummy object
  const dummy = mapObject(Object.fromEntries(columns), () => '')

  // extend all objects with empty string
  const dataWithExtendedObjects = data.map(o => ({ ...dummy, ...o }))

  // convert all values to strings
  const dataWithValuesConvertedToStrings = mapObjects(dataWithExtendedObjects, (column, value) => convertValues(value, column).replace(/[\t\r\n]/g, '☐'))

  // calculate column widths
  const columnWidths = reduceObjects(mapObjects(dataWithValuesConvertedToStrings, (column, value) => stringWidth(value)), max)

  // pad all cells of one column to the same length
  const dataWithPaddedValues = mapObjects(dataWithValuesConvertedToStrings, (column, value) => pad(value, column))

  // convert array of objects to array of array (like excel ;)
  let table = dataWithPaddedValues.map((e) => Array.from(columns.values()).map(column => e[column]))

  // filter and rearrange columns (if options.columns is set)
  if (Array.isArray(options.columns)) {
    table = table.map((row) => options.columns.map((i: unknown) => row[+(i as string) - 1]))
  }

  // join cells and rows
  return table.map((row) => ` ${row.join(chalk.blueBright(' ｜ '))} `).map(colorizeLineBg).join('\n')

  /// //////////////////////////////// internal sub-functions ///////////////////////////////////

  function convertValues (value: unknown, column: string): string {
    if (typeof value === 'number') {
      if (value > firstJSONDate && value < lastJSONDate && options.msunixtime.length > 0) {
        return chalkOrValue(new Date(value).toISOString(), options.msunixtime)
      }
      if (value > firstJSONDate / 1000 && value < lastJSONDate / 1000 && options.unixtime.length > 0) {
        return chalkOrValue(new Date(value * 1000).toISOString(), options.unixtime)
      }
      const l = getDecimalPlaces(value)
      const maxl = decimalPlaces[column]
      let s = value.toString()
      if (!isNaN(maxl) && maxl > 0) {
        s = s + ' '.repeat(maxl - l)
        if (l === 0) { s = s + ' ' }
      }
      if (Number.isFinite(value) && value < 0) {
        return chalkOrValue(s, options.negative)
      }
      return chalkOrValue(s, options.number)
    }
    if (Array.isArray(value)) {
      return chalk.redBright.italic.bold('[Array]')
    }
    if (typeof (value) === 'object') {
      return chalk.redBright.italic.bold('{Object}')
    }
    if (typeof (value) === 'bigint') {
      return value.toString()
    }
    if (typeof (value) === 'string') {
      return value
    }
    if (typeof (value) === 'boolean') {
      if (!value && options.false.length > 0) {
        return chalkOrValue(value, options.false)
      }
      return chalkOrValue(value, options.boolean)
    }
    return '' // null or undefined or function
  }

  function pad (value: string, column: string): string {
    const l = decimalPlaces[column]
    const w = columnWidths[column]
    if (w !== undefined) {
      if (!isNaN(l)) { // this is a number column, so we do a right pad
        return (' '.repeat(w - stringWidth(value))) + value
      } else {
        return value + (' '.repeat(w - stringWidth(value)))
      }
    }
    return 'PADERROR'
    // js String.padEnd() does not account for double-half-width characters like "古"
  }

  function colorizeLineBg (line: string, lineNumber: number): string {
    if (lineNumber === 0) {
      return chalkBgOrValue(line, options.header)
    }
    if (lineNumber % 2 === 0) {
      return chalkBgOrValue(line, options.even)
    }
    return chalkBgOrValue(line, options.odd)
  }
}

/// //////////////////////////////////////////////////////////////////// helpers ///////////////////////////////////////////////////////////////////////////////

export function mapObject<V, R> (obj: Record<string, V>, fun: (column: string, value: V) => R): Record<string, R> {
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, fun(k, v)]))
}

export function mapObjects<V, R> (objs: Array<Record<string, V>>, fun: (column: string, value: V) => R): Array<Record<string, R>> {
  return objs.map(obj => mapObject(obj, fun))
}

export function max (a: number, b: number): number {
  return a > b ? a : b
}
export function min (a: number, b: number): number {
  return a < b ? a : b
}

export function reduceObjects<V> (objects: Array<Record<string, V>>, fun: (value: V, oldValue: V, column: string) => V): Record<string, V> {
  const old = objects[0]
  objects.slice(1).forEach(obj => Object.keys(old).forEach(key => { old[key] = fun(obj[key], old[key], key) }))
  return old
}

function chalkOrValue (value: string|boolean|number, color: string): string {
  if (color !== undefined && color.length > 0) {
    return chalk.hex(color)(value)
  }
  return value.toString()
}

function chalkBgOrValue (value: string | boolean | number, color: string): string {
  if (color !== undefined && color.length > 0) {
    return chalk.bgHex(color)(value)
  }
  return value.toString()
}
