import chalk from 'chalk'

interface Scale { sig: number, factor: number, min: number, max: number, scale: number[], delta: number, count: number }

function makeScale (min: number, max: number): Scale {
  const deltamm = max - min
  const sig = Math.floor(Math.log10(deltamm))
  const factor = Math.pow(10, sig)
  const low = Math.floor(min / factor) * factor
  const high = Math.ceil(max / factor) * factor
  const delta = high - low
  let count = Math.round(delta / factor)
  let count2 = count
  const scale = []
  if (count === 10) {
    count = 5
    count2 = 5
  }
  if (count === 2) {
    count = 4
    count2 = 4
  }
  if (count > 6) {
    count = count / 2 + 0.5
    count2 = count2 / 2
  }
  for (let i = 0; i <= count; ++i) {
    scale.push(rounds(low + i * delta / count2, sig - 1))
  }
  return { sig, factor, min: scale[0], max: scale[scale.length - 1], scale, delta, count }
}
function rounds (val: number, sig: number): number {
  if (sig < 1) {
    return +val.toFixed(-sig)
  }
  const factor = Math.pow(10, sig)
  return Math.round(val / factor) * factor
}

export class Matrix {
  murks: string[]
  width: number
  height: number
  matrix: number[]
  lastx: number
  lasty: number
  header: string[]
  ylabels: string[]
  xlabel: string
  x: Scale
  y: Scale
  constructor (width: number, height: number, minx: number, miny: number, maxx: number, maxy: number, header: string[]) {
    this.murks = [' ', '▖', '▗', '▄', '▘', '▌', '▚', '▙', '▝', '▞', '▐', '▟', '▀', '▛', '▜', '█']
    width = (width - 10) * 2
    height *= 2
    this.lastx = 0
    this.lasty = 0
    this.x = makeScale(minx, maxx)
    this.y = makeScale(miny, maxy)

    this.width = width
    this.height = height
    this.matrix = new Array(width * height).fill(0)
    this.header = header
    this.ylabels = this.scaleToLabels(this.y, (this.height / 2 - 1))
    this.xlabel = '      '
    for (const v of this.x.scale) {
      const pos = 6 + (v - this.x.min) / (this.x.max - this.x.min) * (width / 2 - 6 - this.x.max.toString().length)
      const pad = pos - this.xlabel.length
      this.xlabel = this.xlabel + ' '.repeat(pad) + v.toString()
    }
  }

  private scaleToLabels (m: Scale, len: number): string[] {
    const labels = []
    for (let i = Math.floor(this.height / 2) - 1; i >= 0; --i) {
      labels.push('')
    }
    for (const v of m.scale) {
      const pos = (v - m.min) / (m.max - m.min) * len
      labels[Math.round(pos)] = v.toString()
    }
    return labels
  }

  private set (x: number, y: number, v: number): void {
    this.matrix[Math.round(x) + (Math.round(y)) * this.width] = v
    this.lastx = x
    this.lasty = y
  }

  private get (x: number, y: number): number {
    return this.matrix[Math.round(x) + (Math.round(y)) * this.width]
  }

  line (x: number, y: number, v: number): void {
    const dx = x - this.lastx
    const dy = y - this.lasty
    const maxd = Math.max(Math.abs(dx), Math.abs(dy))
    for (let i = 0; i < Math.floor(maxd); ++i) {
      this.set(this.lastx + dx / maxd, this.lasty + dy / maxd, v)
    }
    this.set(x, y, v)
  }

  plot (x: number, y: number, v: number): void {
    const xx = (x - this.x.min) / (this.x.max - this.x.min) * (this.width - 1)
    const yy = (y - this.y.min) / (this.y.max - this.y.min) * (this.height - 1)
    this.set(xx, yy, v)
  }

  plotLine (x: number, y: number, v: number): void {
    const xx = (x - this.x.min) / (this.x.max - this.x.min) * (this.width - 1)
    const yy = (y - this.y.min) / (this.y.max - this.y.min) * (this.height - 1)
    this.line(xx, yy, v)
  }

  toRaster (): string {
    const pix = []
    for (let y = Math.floor(this.height / 2) - 1; y >= 0; --y) {
      const vlabel = `${this.ylabels[y]}`
      const p = (' '.repeat(6 - vlabel.length)) + vlabel

      pix.push(p)
      for (let x = 0; x < Math.floor(this.width / 2); ++x) {
        const four =
                    (this.get(2 * x, 2 * y) !== 0 ? 1 : 0) +
                    (this.get(2 * x + 1, 2 * y) !== 0 ? 2 : 0) +
                    (this.get(2 * x, 2 * y + 1) !== 0 ? 4 : 0) +
                    (this.get(2 * x + 1, 2 * y + 1) !== 0 ? 8 : 0)
        const color = Math.max(
          this.get(2 * x, 2 * y),
          this.get(2 * x + 1, 2 * y),
          this.get(2 * x, 2 * y + 1),
          this.get(2 * x + 1, 2 * y + 1))
        pix.push(chalk.ansi256(color)(this.murks[four]))
      }
      pix.push('\n')
    }
    pix.push(this.xlabel)
    pix.push('           ' + this.header.map((s: string, i: number) => chalk.ansi256(i + 8)(s)).join('   '))
    return pix.join('')
  }

  toString (): string {
    function chunk (arr: number [], chunkSize: number): number[][] {
      if (chunkSize <= 0) throw new Error('Invalid chunk size')
      const R = []
      for (let i = 0, len = arr.length; i < len; i += chunkSize) { R.push(arr.slice(i, i + chunkSize)) }
      return R
    }
    return (chunk(this.matrix, this.width).map(line => line.join('')).reverse().join('\n'))
  }

  static drawGraph (table: number[][], header: string[]): string {
    const minval: number = (table).map(a => a.reduce(min)).reduce(min)
    const maxval: number = (table).map(a => a.reduce(max)).reduce(max)
    const terminalwidth = process.stdout.columns !== undefined ? process.stdout.columns : 80
    const matrix = new Matrix(terminalwidth, 19, 0, minval, table[0].length, maxval, header)
    table.forEach((row, i) => {
      row.forEach((value, j: number): void => {
        if (j === 0) {
          matrix.plot(0, value, i + 8)
        } else {
          matrix.plotLine(j, value, i + 8)
        }
      })
    })
    return matrix.toRaster()
  }

  static drawXY (table: number[][], header: string[]): string {
    const minvalx: number = table.map(a => a[0]).reduce(min)
    const maxvalx: number = table.map(a => a[0]).reduce(max)
    const minvaly: number = table.map(a => a[1]).reduce(min)
    const maxvaly: number = table.map(a => a[1]).reduce(max)
    const terminalwidth = process.stdout.columns !== undefined ? process.stdout.columns : 80
    const matrix = new Matrix(terminalwidth, 40, minvalx, minvaly, maxvalx, maxvaly, header)
    table.forEach((row, j: number): void => {
      if (j === 0) {
        matrix.plot(row[0], row[1], 8)
      } else {
        matrix.plotLine(row[0], row[1], 8 + 1)
      }
    })
    return matrix.toRaster()
  }
}
export function max (a: number, b: number): number {
  return +a > +b ? +a : +b
}
export function min (a: number, b: number): number {
  return +a < +b ? +a : +b
}
