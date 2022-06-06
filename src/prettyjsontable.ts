import chalk from 'chalk'
import { OptionValues } from 'commander'
import stringWidth from 'string-width'

// this function returns an array of parsed JSON objects, the function does not care about formating. i.e. `[1,2\n][3,4]\n { "a"\r\n:2}\r\r` is valid input
// if you have a well formated line based JSONStream, you could use data.split("\n") instead, as that would be roughly 2x faster
function JSONStreamToArray (data: string): unknown[][] {
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
export function dataToTable (data: string): unknown[][] {
  const tmp = JSONStreamToArray(data)
  // if we have only one element and this element is an array of objects, then we return it directly
  if (tmp.length === 1 && Array.isArray(tmp[0]) && typeof tmp[0][0] === 'object') {
    return tmp[0]
  }
  return tmp
}

export function prettyjsontable (data: unknown[][] | string, options: OptionValues): string {
  if (typeof (data) === 'string') {
    data = dataToTable(data)
  }

  // calculate column names (aka table header)
  const columns = new Map()
  for (const d of data) {
    for (const column of Object.keys(d)) {
      columns.set(column, column)
    }
  }

  // add table header
  data.unshift(Object.fromEntries(columns))

  const firstJSONDate = new Date(options.unixstart).valueOf()
  const lastJSONDate = new Date(options.unixend).valueOf()

  let table = data.map((e) => Array.from(columns.values()).map((k) => convertValues(e[k]).toString().replace(/[\t\r\n]/g, '☐'))
  )

  // filter columns
  if (Array.isArray(options.columns)) {
    table = table.map((row) => options.columns.map((i: unknown) => row[+(i as string) - 1])
    )
  }

  const columnWidths = Array.from(columns.values()).map(() => 0)
  for (const row of table) {
    for (let i = 0; i < row.length; i++) {
      const w = stringWidth(row[i])
      columnWidths[i] = w > columnWidths[i] ? w : columnWidths[i]
    }
  }

  function convertValues (value: unknown): string {
    if (typeof value === 'number') {
      if (value > firstJSONDate && value < lastJSONDate && options.msunixtime.length > 0) {
        return chalkOrValue(new Date(value).toISOString(), options.msunixtime)
      }
      if (value > firstJSONDate / 1000 && value < lastJSONDate / 1000 && options.unixtime.length > 0) {
        return chalkOrValue(new Date(value * 1000).toISOString(), options.unixtime)
      }
      if (Number.isFinite(value) && value < 0) {
        return chalkOrValue(value, options.negative)
      }
      return chalkOrValue(value, options.number)
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

  function chalkOrValue (value: string|boolean|number, color: string): string {
    if (color !== undefined && color.length > 0) {
      return chalk.hex(color)(value)
    }
    return value.toString()
  }
  function chalkBgOrValue (value: string|boolean|number, color: string): string {
    if (color !== undefined && color.length > 0) {
      return chalk.bgHex(color)(value)
    }
    return value.toString()
  }
  function pad (data: string, columnIndex: number): string {
    return data + (' '.repeat(columnWidths[columnIndex] - stringWidth(data)))
    // js String.padEnd() does not account for double-half-width characters like "古"
  }

  function colorizeLine (line: string, lineNumber: number): string {
    if (lineNumber === 0) {
      return chalkBgOrValue(line, options.header)
    }
    if (lineNumber % 2 === 0) {
      return chalkBgOrValue(line, options.even)
    }
    return chalkBgOrValue(line, options.odd)
  }

  return table.map((row) => ` ${row.map((data, i) => pad(data, i)).join(chalk.blueBright(' ｜ '))} `).map(colorizeLine).join('\n')
}
