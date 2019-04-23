/* jslint white: true, devel: true, onelet: true, browser: true, undef: true, nomen: true, regexp: true, plusplus: false, bitwise: true, newcap: true, maxerr: 50, indent: 4 */
/* eslint-disable */
let jsl = typeof jsl === 'undefined' ? {} : jsl

/**
 * jsl.format - Provide json reformatting in a character-by-character approach, so that even invalid JSON may be reformatted (to the best of its ability).
 *
 **/
jsl.format = (function () {

  function repeat (s, count) {
    return new Array(count + 1).join(s)
  }

  function getSizeOfArray (jsonString, startingPosition) {
    let currentPosition = startingPosition + 1
    let inString = false
    let numOpened = 1
    try {
      while (numOpened > 0 && currentPosition < jsonString.length) {
        let currentChar = jsonString.charAt(currentPosition)
        switch (currentChar) {
          case '[':
            if (!inString) {
              numOpened++
            }
            break
          case ']':
            if (!inString) {
              numOpened--
            }
            break
          case '"':
            inString = !inString
            break
        }
        currentPosition++
      }
      return JSON.parse(jsonString.substring(startingPosition, currentPosition)).length
    } catch (err) {
      return null
    }
  }

  function formatJson (json, options) {
    options = options || {}
    let tabSize = options.tabSize || 2
    let indentCStyle = options.indentCStyle || false
    let showArraySize = (typeof options.showArraySize !== 'undefined' ? Boolean(options.showArraySize) : false)
    let tab = ''
    for (let ts = 0; ts < tabSize; ts++) {
      tab += ' '
    }

    let i = 0,
      il = 0,
      newJson = '',
      indentLevel = 0,
      inString = false,
      currentChar = null
    for (i = 0, il = json.length; i < il; i += 1) {
      currentChar = json.charAt(i)

      switch (currentChar) {
        case '{':
        case '[':
          if (!inString) {
            if (indentCStyle) newJson += '\n' + repeat(tab, indentLevel)
            if (currentChar === '[') {
              if (showArraySize) {
                let arraySize = getSizeOfArray(json, i)
                if (arraySize !== null) {
                  newJson += 'Array[' + arraySize + ']'
                }
              }
            }
            newJson += currentChar

            newJson += '\n' + repeat(tab, indentLevel + 1)
            indentLevel += 1
          } else {
            newJson += currentChar
          }
          break
        case '}':
        case ']':
          if (!inString) {
            indentLevel -= 1
            newJson += '\n' + repeat(tab, indentLevel) + currentChar
          } else {
            newJson += currentChar
          }
          break
        case ',':
          if (!inString) {
            newJson += ',\n' + repeat(tab, indentLevel)
          } else {
            newJson += currentChar
          }
          break
        case ':':
          if (!inString) {
            newJson += ': '
          } else {
            newJson += currentChar
          }
          break
        case ' ':
        case '\n':
        case '\t':
          if (inString) {
            newJson += currentChar
          }
          break
        case '"':
          if (i === 0) {
            inString = true
          } else if (json.charAt(i - 1) !== '\\' || (json.charAt(i - 1) === '\\' && json.charAt(i - 2) === '\\')) {
            inString = !inString
          }
          newJson += currentChar
          break
        default:
          newJson += currentChar
          break
      }
    }

    return newJson
  }

  return {'formatJson': formatJson}

}())

module.exports = jsl.format.formatJson
