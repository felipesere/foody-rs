import type { CodegenConfig } from '@graphql-codegen/cli'
// @ts-ignore
import * as fs from "node:fs";

const schema = () => {
    if(fs.existsSync('schema.graphql')) {
       return 'schema.graphql'
    }
    return '../schema.graphql'
}
 
const config: CodegenConfig = {
   schema: schema(),
   documents: ['src/**/*.tsx'],
   generates: {
      './src/gql/': {
        preset: 'client',
        plugins: []
      }
   }
}
export default config
