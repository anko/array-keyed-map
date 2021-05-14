// Reads JS from stdin (the code of the readme example being tested), resolves
// module name requires to the main file instead, adds a require if not
// present, and checks that when it is run, its stdout matches the total of all
// comments of something like the form `// -> desired output`.

import { readFileSync } from 'fs'
import { spawnSync } from 'child_process'

const { name: moduleName, exports: mainFileName } = JSON.parse(
  readFileSync('./package.json'))

const moduleImportPattern = `import\\s+(\\S+)\\s+from\\s+('${moduleName}'|"${moduleName}")`
const moduleNameWhenImplicitlyRequired = 'ArrayKeyedMap'

// Load code from stdin
let code = readFileSync(0, 'utf-8').toString()

const outputSpecs = code.matchAll(/\/\/ (?:=>|->|→|⇒) (.*)/g)
const requiredStdout = [...outputSpecs].map(x => x[1] + '\n').join('')
console.log({ requiredStdout })

// If the code didn't require this module, add a require in the beginning
if (!code.match(moduleImportPattern)) {
  code = `import ${moduleNameWhenImplicitlyRequired} from '${mainFileName}'\n${code}`
} else {
  // Replace all occurrences of requiring this module by name, by requiring
  // this module by its main file
  code = code.replace(
    new RegExp(moduleImportPattern, 'g'),
    (_, nameGiven) => `import ${nameGiven} from '${mainFileName}'`)
}

const { stdout, stderr, status } = spawnSync(
  'node', ['--input-type=module'], { input: code, encoding: 'utf-8' })

console.log({ stdout, stderr, status })

if (stdout !== requiredStdout) {
  console.log('Stdout did not match comments specifying output')
  process.exit(1)
} else {
  if (status) {
    process.exit(status)
  }
}
