/**
 * This file was automatically generated based on your preset configuration.
 *
 * For better type checking and IntelliSense:
 * 1. Install azion as dev dependency:
 *    npm install -D azion
 *
 * 2. Use defineConfig:
 *    import { defineConfig } from 'azion'
 *
 * 3. Replace the configuration with defineConfig:
 *    export default defineConfig({
 *      // Your configuration here
 *    })
 *
 * For more configuration options, visit:
 * https://github.com/aziontech/lib/tree/main/packages/config
 */

export default {
  build: {
    preset: 'typescript',
    polyfills: true
  },
  functions: [
    {
      name: 'az-psi-analyzer',
      path: './functions/index.js'
    }
  ],
  applications: [
    {
      name: 'az-psi-analyzer',
      rules: {
        request: [
          {
            name: 'Execute Function',
            description: 'Execute function for all requests',
            active: true,
            criteria: [
              [
                {
                  variable: '${uri}',
                  conditional: 'if',
                  operator: 'matches',
                  argument: '^/'
                }
              ]
            ],
            behaviors: [
              {
                type: 'run_function',
                attributes: {
                  value: 'az-psi-analyzer'
                }
              }
            ]
          }
        ]
      },
      functionsInstances: [
        {
          name: 'az-psi-analyzer',
          ref: 'az-psi-analyzer'
        }
      ]
    }
  ],
  workloads: [
    {
      name: 'az-psi-analyzer',
      active: true,
      infrastructure: 1,
      protocols: {
        http: {
          versions: ['http1', 'http2'],
          httpPorts: [80],
          httpsPorts: [443],
          quicPorts: null
        }
      },
      deployments: [
        {
          name: 'az-psi-analyzer',
          current: true,
          active: true,
          strategy: {
            type: 'default',
            attributes: {
              application: 'az-psi-analyzer'
            }
          }
        }
      ]
    }
  ]
}
