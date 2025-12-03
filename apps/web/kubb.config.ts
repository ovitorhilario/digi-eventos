import { defineConfig } from '@kubb/core'
import { pluginOas } from '@kubb/plugin-oas'
import { pluginClient } from '@kubb/plugin-client'
import { pluginReactQuery } from '@kubb/plugin-react-query'
import { pluginTs } from '@kubb/plugin-ts'

export default defineConfig(() => {
	return {
		root: '.',
		input: {
			path: './src/http/openapi/docs.yaml',
		},
		output: {
			path: './src/http/gen',
			clean: true
		},
		plugins: [
			pluginTs(),
			pluginOas(),
			pluginClient({
				importPath: '@/http/client',
			}),
			pluginReactQuery({
				client: {
					importPath: '@/http/client',
				}
			})
		],
	}
})